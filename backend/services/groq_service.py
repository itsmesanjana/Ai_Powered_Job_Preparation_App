import os
import json
import hashlib
from groq import Groq
from core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None

def generate_resume_analysis(resume_text: str, target_role: str):
    """
    Parses resume text strictly using AI to find ATS gaps against the target role.
    """
    if not client: return {"error": "Missing Groq API Key"}
    
    prompt = f"Analyze this resume for a '{target_role}' role. Return strict JSON format: {{'skills': ['skill1',...], 'missing_keywords': ['kw1'...], 'ats_score': 0.0_to_100.0, 'suggestions': ['sug1',...]}}.\n\nResume: {resume_text}"
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def generate_aptitude_question(topic: str, difficulty: str, previous_hashes: list):
    """
    Generates a pure multiple-choice aptitude question. NO CODING!
    """
    if not client: return {"error": "Missing Groq API Key"}
    
    history_context = f"AVOID generating questions resembling these past hashes: {previous_hashes[:5]}" if previous_hashes else ""
    
    prompt = f"""Generate ONE aptitude question for topic: {topic}.
    Difficulty: {difficulty}.
    It must be a non-coding question.
    It should test reasoning or numerical ability.
    Do NOT include code, programming logic, or syntax.
    {history_context}
    
    Return strict JSON: 
    {{
        "title": "Topic - Aptitude scenario title",
        "description": "The exact aptitude question text...",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correct_answer": "A) Option 1",
        "expected_logic": "Provide a deeply detailed, step-by-step mathematical or logical justification of the answer. Ensure the explanation explicitly details how to derive the correct option. Use \n characters to logically separate the steps."
    }}"""
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    data = json.loads(response.choices[0].message.content)
    raw_str = data.get('title', '') + data.get('description', '')
    data['question_hash'] = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()
    return data

def generate_coding_question(topic: str, difficulty: str, role: str, previous_hashes: list, company: str = "", language: str = ""):
    """
    Generates a role-specific scenario FAANG coding question with company-specific logical difficulty.
    """
    if not client: return {"error": "Missing Groq API Key"}
    
    history_context = f"AVOID generating questions resembling these past hashes: {previous_hashes[:5]}" if previous_hashes else ""
    language_context = f"The user is specifically practicing the {language} programming language syntax and features." if language else ""
    
    # Inject specific rules based on company
    company_logic = ""
    if company.lower() == "tcs": company_logic = "Keep the difficulty relatively easy to medium. Focus on basic loops, string manipulations, and arrays."
    elif company.lower() == "deloitte": company_logic = "Focus heavily on analytical logic and business-case problem solving rather than pure algorithms."
    elif company.lower() == "accenture": company_logic = "Moderate algorithmic logic. Focus on standard mapping, hashing, and arrays."
    elif company.lower() in ["amazon", "google", "microsoft"]: company_logic = "Hard difficulty. Intensely focus on Data Structures, algorithms, optimization, Trees, Graphs, and DP."
    
    prompt = f"""Generate a highly realistic {difficulty} level coding practice question for a {role} focusing on {topic}.
    Model this EXACTLY as a previous-year interview question from {company if company else 'a top tech company'}.
    {company_logic}
    {language_context}
    {history_context}
    
    Return strict JSON: 
    {{
        "title": "Company Name - Question scenario title",
        "description": "The exact business context and problem statement...",
        "constraints": ["constraint 1"],
        "sample_input": "Test cases input format (e.g., [1, 2, 3])",
        "sample_output": "Test cases output format (e.g., 6)",
        "expected_logic": "Brief explanation of optimal solution algorithm"
    }}"""
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    data = json.loads(response.choices[0].message.content)
    raw_str = data.get('title', '') + data.get('description', '')
    data['question_hash'] = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()
    return data

def generate_prep_plan(role: str, days: int, skills: list, missing: list, company: str = "", weak_topics: list = []):
    """
    Generates a bespoke N-day curriculum roadmap integrating external resources.
    """
    if not client: return {"error": "Missing API Key"}
    
    weak_rule = ""
    if weak_topics:
        weak_rule = f"The user is severely weak in the following topics: {weak_topics}. DYNAMICALLY ADAPT the plan to aggressively include more modules and repetitive practice for these specific subjects."
    
    prompt = f"""Create a highly targeted and precise {days}-day technical prep plan for a {role} aiming for {company}. 
    They know these skills: {skills}. They are missing these ATS gaps: {missing}.
    {weak_rule}
    
    CRITICAL INSTRUCTION: You MUST output EXACTLY {days} days in the 'days' array. Do not stop early. To avoid token limits, keep the notes for each module EXTREMELY SHORT (1 sentence max).
    Instead of generic modules, for each day, generate extremely specific learning modules with explicit technical theory notes.
    Return strict JSON matching this structure:
    {{ 
      "days": [ 
        {{ 
          "title": "Topic Name (e.g., DP)", 
          "time": "4 Hours", 
          "modules": [
            {{
              "name": "Concept Subtopic (e.g., Binary Search)",
              "notes": "1 concise sentence explanation."
            }}
          ] 
        }} 
      ] 
    }}"""
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def handle_mock_interview_turn(history: list, role: str, company: str, round_type: str):
    """
    history: list of dicts [{'role': 'assistant'|'user', 'content': '...text'}]
    """
    if not client: return "Missing API Key"
    
    if round_type == "End-to-End":
        system_prompt = f"You are the Lead Director at {company} conducting a comprehensive, complete 45-minute End-to-End interview for the {role} position. Do NOT just ask one type of question. You must logically progress the interview through these phases based on the chat history length:\n1. Introduction & Resume deep dive.\n2. Technical/System Design questions tailored for {role}.\n3. A complex Behavioral/Conflict STAR-method scenario.\n4. Closing the interview and asking if the candidate has questions.\n\nKeep your responses concise and conversational. Act like a real human interviewer. Ask only ONE question at a time."
    else:
        system_prompt = f"You are a senior hiring manager at {company} interviewing a candidate for a {role} role. This is the {round_type} round. For every answer the user provides, briefly evaluate it, provide constructive feedback on what improvements are needed (using the STAR method if applicable), and then explicitly ask the next interview question to continue the flow."
    
    messages = [{"role": "system", "content": system_prompt}] + history
    
    try:
        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant", # Better for conversational context with high rate limit
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error handling interview turn: {e}")
        return "It appears my AI thought process was momentarily interrupted or rate limited. Could you repeat your last point or elaborate further so we can continue?"

def evaluate_code(code: str, language: str, question: str, expected_in: str, expected_out: str):
    if not client: return {"error": "Missing API Key"}
    prompt = f"""
    You are an exact code execution engine. Evaluate this {language} code against the scenario.
    Question: {question}
    Test Input: {expected_in}
    Expected Output: {expected_out}
    Code:
    {code}
    
    Return strict JSON: {{"status": "Passed" | "Failed", "output": "Simulated console output...", "feedback": "One line of logic feedback"}}
    """
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def generate_final_assessment(role: str, company: str):
    """
    Generates a massive multi-phase JSON dictionary containing aptitude, technical, and coding nodes.
    Uses concurrent execution to prevent LLM token limits when generating 62 questions.
    """
    if not client: return {"error": "API Key Missing"}
    
    import concurrent.futures
    import json
    
    company_context = f"aimed at {company} standards" if company else "aimed at top tier standards"
    
    def fetch_section(section_name, count, prompt_desc, json_schema):
        prompt = f"""You are generating a strict JSON formatted assessment section for a {role} {company_context}.
        Return ONLY valid JSON with exactly {count} questions matching this exact structure:
        {{
          "{section_name}": {json_schema}
        }}
        
        Rules:
        1. Generate EXACTLY {count} items.
        2. MUST be valid JSON.
        3. {prompt_desc}
        """
        try:
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content).get(section_name, [])
        except Exception as e:
            print(f"Error generating {section_name}: {e}")
            return []

    aptitude_schema = '[{"question": "Math/Logic question text", "options": ["A", "B", "C", "D"], "correct_answer": "A"}]'
    verbal_schema = '[{"question": "English Grammar or Comprehension question", "options": ["A", "B", "C", "D"], "correct_answer": "B"}]'
    technical_schema = '[{"question": "Technical CS Base multiple choice based on the role", "options": ["A", "B", "C", "D"], "correct_answer": "B"}]'
    coding_schema = '[{"title": "Algorithm Title", "description": "Problem context.", "sample_input": "...", "sample_output": "..."}]'

    final_assessment = {"aptitude": [], "verbal": [], "technical": [], "coding": []}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_apt = executor.submit(fetch_section, "aptitude", 20, "Focus on deep quantitative and logical reasoning.", aptitude_schema)
        future_verb = executor.submit(fetch_section, "verbal", 20, "Focus on professional workplace English and comprehension.", verbal_schema)
        future_tech = executor.submit(fetch_section, "technical", 20, f"Focus on {role} specific technical theory.", technical_schema)
        future_code = executor.submit(fetch_section, "coding", 2, "Focus on real-world algorithms like LeetCode Medium/Hard.", coding_schema)
        
        final_assessment["aptitude"] = future_apt.result()
        final_assessment["verbal"] = future_verb.result()
        final_assessment["technical"] = future_tech.result()
        final_assessment["coding"] = future_code.result()

    # Fallback to prevent UI crash if LLM entirely failed
    if not final_assessment["aptitude"]: final_assessment["aptitude"] = [{"question": "Failed to load", "options": ["A","B","C","D"], "correct_answer": "A"}]
    if not final_assessment["verbal"]: final_assessment["verbal"] = [{"question": "Failed to load", "options": ["A","B","C","D"], "correct_answer": "A"}]
    if not final_assessment["technical"]: final_assessment["technical"] = [{"question": "Failed to load", "options": ["A","B","C","D"], "correct_answer": "A"}]
    if not final_assessment["coding"]: final_assessment["coding"] = [{"title": "Failed to load", "description": "Error", "sample_input": "", "sample_output": ""}]

    return final_assessment

def generate_open_ended_question(topic: str, difficulty: str, q_type: str, previous_hashes: list = []):
    """
    Generates a textual question (System Design or Behavioral).
    """
    if not client: return {"error": "Missing Groq API Key"}
    history_context = f"AVOID generating questions resembling these past hashes: {previous_hashes[:5]}" if previous_hashes else ""
    
    if q_type == "behavioral":
        prompt = f"""Generate a realistic Behavioral / HR conflict resolution question focusing on {topic}. Difficulty: {difficulty}.
        It should prompt the user to use the STAR method.
        {history_context}
        Return strict JSON: 
        {{
            "title": "Behavioral Scenario - Title",
            "description": "The situational context and the specific HR question...",
            "expected_logic": "Brief bullet points of what a good STAR response should include."
        }}"""
    else: # system design
        prompt = f"""Generate a highly technical System Design architecture scenario focusing on {topic}. Difficulty: {difficulty}.
        Ask the user to design a specific system/feature.
        {history_context}
        Return strict JSON: 
        {{
            "title": "System Architecture - Title",
            "description": "The business requirements, traffic scale, and the specific design question...",
            "constraints": ["constraint 1 - e.g. 100M Daily Active Users"],
            "expected_logic": "Brief summary of the ideal system architecture (Tech stack, Database type, Caching strategy)."
        }}"""
        
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    data = json.loads(response.choices[0].message.content)
    raw_str = data.get('title', '') + data.get('description', '')
    data['question_hash'] = hashlib.sha256(raw_str.encode('utf-8')).hexdigest()
    return data

def evaluate_textual_answer(question: str, answer: str, q_type: str):
    if not client: return {"error": "Missing API Key"}
    
    if q_type == "behavioral":
        prompt = f"""You are an HR Manager. Evaluate this candidate's behavioral answer using the STAR method.
        Question: {question}
        Candidate Answer: {answer}
        
        Return strict JSON: {{"status": "Passed" | "Failed", "output": "Simulated evaluation notes...", "feedback": "Detailed feedback on what was good and what was missing (Situation, Task, Action, Result)..."}}"""
    else:
        prompt = f"""You are a Senior Staff Engineer. Evaluate this candidate's System Design answer.
        Question: {question}
        Candidate Architecture Proposal: {answer}
        
        Grade them on scalability, bottlenecks, database choices, and logical soundness.
        Return strict JSON: {{"status": "Passed" | "Failed", "output": "Review notes regarding architecture constraints...", "feedback": "Detailed technical feedback identifying flaws, missing components, or praising good choices..."}}"""
        
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def evaluate_mock_interview_report(history: list, role: str, company: str):
    if not client: return {"error": "Missing API Key"}
    prompt = f"""You are an elite Tech Hiring Manager at {company}.
    Evaluate this entire mock interview transcript for a {role} position.
    Be extremely critical, realistic, and specific.
    
    Return strict JSON matching this structure:
    {{
       "overall_score": 85,
       "hire_decision": "Hire",
       "communication_feedback": "Detailed paragraph about their STAR method delivery and speaking clarity...",
       "technical_feedback": "Detailed paragraph about their technical accuracy and problem solving...",
       "red_flags": ["Use of filler words", "Failed to mention scalability"]
    }}"""
    
    # We prefix the history with the evaluator prompt
    messages = [{"role": "system", "content": prompt}] + history
    
    try:
        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error evaluating interview: {e}")
        return {"error": str(e)}
