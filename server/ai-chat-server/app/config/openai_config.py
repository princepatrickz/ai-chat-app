from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL")
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_OUTPUT_TOKENS", "500"))

if not OPENAI_API_KEY:
    raise ValueError("Token not configured")
    