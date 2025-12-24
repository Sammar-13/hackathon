from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router, rag_engine
from app.db.database import engine, Base
import asyncio
import os

app = FastAPI(title="Robotics Book AI Assistant")

# CORS Setup
origins = [
    "http://localhost:3000",
    "https://hackathon-lilac-alpha.vercel.app",
    "https://ai-humanoid-robotics-textbook.vercel.app",
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")

@app.get("/")
async def root():
    return {"status": "ok", "service": "Robotics AI Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup():
    print("Starting up...")
    
    # Initialize RAG Engine in background
    asyncio.create_task(rag_engine.initialize())

    # Create Tables
    if os.getenv("DATABASE_URL"):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Database tables created.")
        except Exception as e:
            print(f"Warning: Database initialization failed: {e}")
    else:
        print("No DATABASE_URL found, skipping DB initialization.")
