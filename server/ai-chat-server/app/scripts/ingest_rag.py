from app.db import SessionLocal
from app.openai_services.rag_service import ingest_all_documents
import asyncio


async def main():
    db = SessionLocal()

    try:
        await ingest_all_documents(db)
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())