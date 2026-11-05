import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
# Import all models to ensure they are registered with Base metadata
from app.models import models

# Import API routers
from app.api.auth import router as auth_router
from app.api.assignments import router as assignments_router
from app.api.submissions import router as submissions_router
from app.api.evaluation import router as evaluation_router
from app.api.similarity import router as similarity_router
from app.api.analytics import router as analytics_router

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent AI-powered programming assignment assessment, static analysis, complexity analyzer, and secure execution engine.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(assignments_router, prefix=settings.API_V1_STR)
app.include_router(submissions_router, prefix=settings.API_V1_STR)
app.include_router(evaluation_router, prefix=settings.API_V1_STR)
app.include_router(similarity_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "api_docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "operational",
        "sandbox_executor": "ready"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

