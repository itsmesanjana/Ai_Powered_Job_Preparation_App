from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from api.routes import router as routes_router
from api.auth import router as auth_router

# Initialize the Database Schema securely
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Prep Platform API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind the API Routes
app.include_router(routes_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "FastAPI engine running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
