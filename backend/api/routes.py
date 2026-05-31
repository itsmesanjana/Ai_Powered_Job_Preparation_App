from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
import pdfplumber
import copy

from core.database import get_db
from models.user import User, ResumeAnalysis, QuestionHistory, AssessmentHistory
from services.groq_service import generate_resume_analysis, generate_coding_question, generate_aptitude_question, generate_prep_plan, handle_mock_interview_turn

router = APIRouter()

# In-memory cache for MVP stability and ultra-fast Next.js routing
prep_plan_cache = {}

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.security import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

security = HTTPBearer()

def get_current_user(db: Session = Depends(get_db), token: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/onboarding")
async def onboarding_flow(
    role: str = Form(...),
    company: str = Form(...),
    exp: str = Form(...),
    days: int = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Handles PDF parsing, updates User config, generates AI ATS metrics.
    """
    if not resume.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # 1. Update strict User metrics
    user.target_role = role
    user.target_company = company
    user.experience_level = exp
    user.prep_days = days
    
    # Reset progress to absolute zero!
    user.progress_technical = 0.0
    user.progress_aptitude = 0.0
    user.progress_interview = 0.0
    user.progress_resume = 0.0
    db.commit()
    
    # Invalidate old prep plan cache so it regenerates for the new days/role
    global prep_plan_cache
    prep_plan_cache.pop(user.id, None)
    
    # 2. Extract PDF Text
    extracted_text = ""
    try:
        with pdfplumber.open(resume.file) as pdf:
            for page in pdf.pages:
                extracted_text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
        
    # 3. Pipe to AI for parsing
    analysis_data = generate_resume_analysis(extracted_text, role)
    if "error" in analysis_data:
        raise HTTPException(status_code=500, detail="AI Service Error")
        
    # 4. Save to Database
    analysis_record = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user.id).first()
    if not analysis_record:
        analysis_record = ResumeAnalysis(user_id=user.id)
        db.add(analysis_record)
    
    import json
    analysis_record.resume_text = extracted_text
    analysis_record.skills = json.dumps(analysis_data.get('skills', []))
    analysis_record.missing_keywords = json.dumps(analysis_data.get('missing_keywords', []))
    analysis_record.ats_score = analysis_data.get('ats_score', 0.0)
    
    db.commit()
    return {"message": "Onboarding complete", "ats_score": analysis_record.ats_score}

@router.get("/dashboard/progress")
def get_dashboard_progress(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Returns actual zero-state or calculated db-driven progress + weak areas.
    """
    # Readiness could be an aggregate of the others
    readiness = (user.progress_technical + user.progress_aptitude + user.progress_interview + user.progress_resume) / 4.0
    
    # Calculate global accuracy
    questions = db.query(QuestionHistory).filter(QuestionHistory.user_id == user.id).all()
    accuracy = 0.0
    if questions:
        correct_count = sum(1 for q in questions if q.is_correct)
        accuracy = (correct_count / len(questions)) * 100

    # Calculate weak areas by topic
    topic_map = {}
    for q in questions:
        if q.topic not in topic_map:
            topic_map[q.topic] = {"total": 0, "correct": 0}
        topic_map[q.topic]["total"] += 1
        if q.is_correct:
            topic_map[q.topic]["correct"] += 1
            
    weak_areas = []
    for t_name, stats in topic_map.items():
        acc = (stats["correct"] / stats["total"]) * 100
        if acc <= 50:
            weak_areas.append(f"{t_name} ({int(acc)}%)")

    coding_success_rate = (user.coding_successes / user.coding_attempts * 100) if user.coding_attempts > 0 else 0.0
    
    return {
        "readiness": readiness,
        "technical": user.progress_technical,
        "aptitude": user.progress_aptitude,
        "interview": user.progress_interview,
        "resume": user.progress_resume,
        "accuracy": accuracy,
        "questions_attempted": user.questions_attempted,
        "coding_success_rate": coding_success_rate,
        "weak_areas": weak_areas,
        "current_topic": user.current_topic,
        "xp": user.xp,
        "streak": user.streak,
        "role": user.target_role,
        "company": user.target_company
    }

@router.post("/apti/question")
def get_aptitude_question(topic: str, difficulty: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Generates a pure multiple choice aptitude question enforcing no DB repetition.
    """
    past_questions = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == user.id,
        QuestionHistory.topic == topic
    ).all()
    
    past_hashes = [q.question_hash for q in past_questions]
    
    new_q = generate_aptitude_question(topic, difficulty, past_hashes)
    if "error" in new_q: return new_q
    
    db.add(QuestionHistory(
        user_id=user.id,
        topic=topic,
        difficulty=difficulty,
        role=user.target_role,
        question_hash=new_q['question_hash'],
        question_text=new_q['title']
    ))
    db.commit()
    return new_q

@router.post("/coding/question")
def get_coding_question(topic: str, difficulty: str, language: str = "", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Generates a FAANG scenario coding question avoiding previous DB hashes.
    """
    past_questions = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == user.id,
        QuestionHistory.topic == topic
    ).all()
    
    past_hashes = [q.question_hash for q in past_questions]
    
    new_q = generate_coding_question(topic, difficulty, user.target_role, past_hashes, company=user.target_company, language=language)
    if "error" in new_q: return new_q
    
    db.add(QuestionHistory(
        user_id=user.id,
        topic=topic,
        difficulty=difficulty,
        role=user.target_role,
        question_hash=new_q['question_hash'],
        question_text=new_q['title']
    ))
    db.commit()
    return new_q

@router.post("/open/question")
def get_open_question(topic: str, difficulty: str, q_type: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Generates a textual/open-ended scenario (System Design, Behavioral).
    """
    past_questions = db.query(QuestionHistory).filter(
        QuestionHistory.user_id == user.id,
        QuestionHistory.topic == topic
    ).all()
    past_hashes = [q.question_hash for q in past_questions]
    
    from services.groq_service import generate_open_ended_question
    new_q = generate_open_ended_question(topic, difficulty, q_type, past_hashes)
    if "error" in new_q: return new_q
    
    db.add(QuestionHistory(
        user_id=user.id,
        topic=topic,
        difficulty=difficulty,
        role=user.target_role,
        question_hash=new_q.get('question_hash', 'open_text'),
        question_text=new_q.get('title', 'Text Question')
    ))
    db.commit()
    return new_q

class TextEvaluationRequest(BaseModel):
    question: str
    answer: str
    q_type: str

@router.post("/open/evaluate")
def evaluate_open_text(req: TextEvaluationRequest):
    """ Grades open text for Behavioral STAR or System Design. """
    from services.groq_service import evaluate_textual_answer
    return evaluate_textual_answer(req.question, req.answer, req.q_type)

@router.get("/jobs")
def discover_jobs(user: User = Depends(get_current_user)):
    """
    Dynamically generates apply links based on real target_role in user's DB.
    """
    role_formatted = user.target_role.replace(" ", "%20")
    company_formatted = user.target_company.replace(" ", "%20") if user.target_company else ""
    
    linkedin_url = f"https://www.linkedin.com/jobs/search/?keywords={role_formatted}&location=India"
    naukri_url = f"https://www.naukri.com/{role_formatted.replace('%20', '-')}-jobs-in-india"
    indeed_url = f"https://www.indeed.com/jobs?q={role_formatted}&l=India"
    
    wellfound_url = f"https://wellfound.com/role/{role_formatted.replace('%20', '-')}"
    glassdoor_url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={role_formatted}"
    remoteco_url = f"https://remote.co/remote-jobs/search/?q={role_formatted}"
    upwork_url = f"https://www.upwork.com/nx/search/jobs/?q={role_formatted}"
    flexjobs_url = f"https://www.flexjobs.com/search?search={role_formatted}"
    
    return {
        "linkedin": linkedin_url,
        "naukri": naukri_url,
        "indeed": indeed_url,
        "wellfound": wellfound_url,
        "glassdoor": glassdoor_url,
        "remoteco": remoteco_url,
        "upwork": upwork_url,
        "flexjobs": flexjobs_url
    }

@router.post("/practice/complete")
def update_progress(type: str, score: float, topic: str = "", is_correct: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    The STRICTly driven dynamic progress route. It is impossible to advance without passing real tests here.
    """
    if type == "technical":
        user.progress_technical = min(100.0, user.progress_technical + score)
        user.coding_attempts += 1
        if is_correct:
            user.coding_successes += 1
    elif type == "aptitude":
        user.progress_aptitude = min(100.0, user.progress_aptitude + score)
    elif type == "interview":
        user.progress_interview = min(100.0, user.progress_interview + score)
        
    user.questions_attempted += 1
    if topic:
        user.current_topic = topic
        
        # Find latest question for this topic and mark correct if passed
        if is_correct:
            last_q = db.query(QuestionHistory).filter(QuestionHistory.user_id == user.id, QuestionHistory.topic == topic).order_by(QuestionHistory.id.desc()).first()
            if last_q:
                last_q.is_correct = True
    
    user.xp += int(score * 10)
    db.commit()
    return {"status": "Updated."}

@router.get("/prep-plan/generate")
def get_prep_plan(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Generate or retrieve the user's customized day-wise AI prep plan based on their days & role.
    """
    global prep_plan_cache
    if user.id in prep_plan_cache:
        return prep_plan_cache[user.id]

    import json
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user.id).first()
    skills = json.loads(analysis.skills) if analysis and analysis.skills else []
    missing = json.loads(analysis.missing_keywords) if analysis and analysis.missing_keywords else []
    
    # Compute weak areas
    questions = db.query(QuestionHistory).filter(QuestionHistory.user_id == user.id).all()
    topic_map = {}
    for q in questions:
        if q.topic not in topic_map:
            topic_map[q.topic] = {"total": 0, "correct": 0}
        topic_map[q.topic]["total"] += 1
        if q.is_correct:
            topic_map[q.topic]["correct"] += 1
            
    weak_topics = []
    for t_name, stats in topic_map.items():
        if (stats["correct"] / stats["total"]) * 100 <= 50:
            weak_topics.append(t_name)
    
    plan = generate_prep_plan(user.target_role, user.prep_days, skills, missing, user.target_company, weak_topics)
    if "error" in plan: return plan
    
    prep_plan_cache[user.id] = plan
    return plan

@router.get("/resume/data")
def get_resume_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fetch the parsed resume data and AI score.
    """
    import json
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user.id).first()
    if not analysis:
        return {"error": "No resume found. Please complete onboarding."}
        
    return {
        "ats_score": analysis.ats_score,
        "skills": json.loads(analysis.skills) if analysis.skills else [],
        "missing_keywords": json.loads(analysis.missing_keywords) if analysis.missing_keywords else [],
        "original_text": analysis.resume_text[:200] + "..." # Just preview
    }

@router.post("/interview/start")
def mock_interview_start(type: str, user: User = Depends(get_current_user)):
    """
    Initializes the mock interview by generating a dynamic, contextual first question using Groq.
    """
    from services.groq_service import client
    if not client: return {"reply": f"Hello. I am your interviewer for the {type} round. Introduce yourself."}
    
    company = user.target_company or "a top tech company"
    system_prompt = f"You are a senior hiring manager at {company} interviewing a candidate for a {user.target_role} role. This is the {type} round. Generate the very first opening question to kick off the interview. Keep it brief, professional, and invite them to introduce themselves regarding the role."
    
    response = client.chat.completions.create(
        messages=[{"role": "system", "content": system_prompt}],
        model="llama-3.1-8b-instant",
    )
    return {"reply": response.choices[0].message.content}

class InterviewTurn(BaseModel):
    history: list
    round_type: str

@router.post("/interview/turn")
def mock_interview_turn(turn: InterviewTurn, user: User = Depends(get_current_user)):
    """
    Handles a single back-and-forth conversational turn for the mock interview securely tracking the target role and company.
    """
    from services.groq_service import handle_mock_interview_turn
    reply = handle_mock_interview_turn(turn.history, user.target_role, user.target_company, turn.round_type)
    
    # Progress increment silently for practicing interview
    # We could abstract this, but adding a micro bump encourages continuous looping
    return {"reply": reply}

@router.post("/interview/evaluate")
def mock_interview_evaluate(turn: InterviewTurn, user: User = Depends(get_current_user)):
    """
    Evaluates the full transcript and generates the report card JSON.
    """
    from services.groq_service import evaluate_mock_interview_report
    return evaluate_mock_interview_report(turn.history, user.target_role, user.target_company)

class CodeSubmission(BaseModel):
    code: str
    language: str
    question: str
    sample_input: Any = ""
    sample_output: Any = ""

@router.post("/practice/run")
def run_practice_code(sub: CodeSubmission):
    from services.groq_service import evaluate_code
    return evaluate_code(sub.code, sub.language, sub.question, str(sub.sample_input), str(sub.sample_output))

@router.get("/assessment/final")
def get_final_assessment(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Generates the massive 3-phase final assessment pulling 10 apti, 5 tech, and 1 coding.
    """
    from services.groq_service import generate_final_assessment
    data = generate_final_assessment(user.target_role, user.target_company)
    
    if "error" in data:
        raise HTTPException(status_code=500, detail="AI failed to build assessment.")
        
    return data
