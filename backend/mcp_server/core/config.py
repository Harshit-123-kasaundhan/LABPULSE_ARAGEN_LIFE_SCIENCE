import os
from dotenv import load_dotenv

# Load environment variables from .env
# Go up two directories from core/config.py to find the backend root
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

class Config:
    # --- Groq (primary LLM provider) ---
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    GROQ_TIMEOUT_SECONDS = int(os.getenv("GROQ_TIMEOUT_SECONDS", "20"))

    # --- Gemini (fallback LLM provider) ---
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    LLM_TIMEOUT_SECONDS = int(os.getenv("LLM_TIMEOUT_SECONDS", "20"))
    LLM_MAX_RETRIES = int(os.getenv("LLM_MAX_RETRIES", "2"))

    # --- MCP ---
    MCP_SERVER_HOST = os.getenv("MCP_SERVER_HOST", "127.0.0.1")
    MCP_SERVER_PORT = int(os.getenv("MCP_SERVER_PORT", "8001"))
    MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://127.0.0.1:8001")
    
    # --- API ---
    API_HOST = os.getenv("API_HOST", "127.0.0.1")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    MAX_RESULTS_PER_REQUEST = int(os.getenv("MAX_RESULTS_PER_REQUEST", "25"))
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

config = Config()
