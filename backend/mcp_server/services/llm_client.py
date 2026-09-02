from typing import Any, Dict, Optional, Tuple

from ..core.config import config
from .gemini_client import GeminiClient
from .groq_client import GroqClient


class LLMClient:
    """
    Unified LLM entry point.

    Provider priority: Groq first (primary), then Gemini (fallback).
    Each call returns the parsed JSON along with the provider and model that
    actually served it so callers can report provenance.
    """

    def __init__(self):
        self.groq = GroqClient()
        self.gemini = GeminiClient()

    def generate_json(
        self,
        prompt: str,
        schema: Any = None,
        temperature: float = 0.2,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str], Optional[str]]:
        """
        Returns (result, provider, model). If every provider fails,
        result is None and provider/model are None.
        """
        # Primary: Groq
        result = self.groq.generate_json(prompt, temperature=temperature)
        if result is not None:
            return result, "groq", config.GROQ_MODEL

        # Fallback: Gemini
        result = self.gemini.generate_json(prompt, schema=schema, temperature=temperature)
        if result is not None:
            return result, "gemini", config.GEMINI_MODEL

        return None, None, None


llm_client = LLMClient()
