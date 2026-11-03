from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from app.api.routes.rag_routes import router as rag_routes
from app.api.routes.chat_routes import router as chat_routes
from app.api.routes.auth_routes import router as auth_routes
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base, engine
from contextlib import asynccontextmanager
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'https://8fstrps9-5173.asse.devtunnels.ms'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'])


app.include_router(chat_routes, prefix="/api")
app.include_router(rag_routes, prefix="/api")
app.include_router(auth_routes, prefix="/api")


@app.get("/")
def root():
    return {"message": "API is running."}