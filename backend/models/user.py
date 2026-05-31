from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    
    # Stored Profile
    target_role = Column(String, default="Software Engineer")
    target_company = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    prep_days = Column(Integer, default=30)
    
    # Strict Progress (Starts at zero)
    progress_technical = Column(Float, default=0.0)
    progress_aptitude = Column(Float, default=0.0)
    progress_interview = Column(Float, default=0.0)
    progress_resume = Column(Float, default=0.0)
    
    # Extras
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)

    # Advanced Tracking
    questions_attempted = Column(Integer, default=0)
    coding_attempts = Column(Integer, default=0)
    coding_successes = Column(Integer, default=0)
    current_prep_day = Column(Integer, default=1)
    current_topic = Column(String, default="Python Basics")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_text = Column(Text) # Raw Extracted
    skills = Column(Text) # JSON serialized
    missing_keywords = Column(Text) # JSON serialized
    ats_score = Column(Float, default=0.0)

class QuestionHistory(Base):
    __tablename__ = "question_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    topic = Column(String, index=True)
    difficulty = Column(String)
    role = Column(String)
    question_hash = Column(String, unique=True) # To compare exact duplication
    question_text = Column(Text)
    is_correct = Column(Boolean, default=False)

class AssessmentHistory(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String) # 'aptitude', 'technical', 'coding', 'full'
    score = Column(Float)
    details = Column(Text) # JSON serialized QA data
