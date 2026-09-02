import json
import logging
import re
import time
from typing import Any, Dict, Optional

import httpx

from ..core.config import config

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Best-effort JSON extraction. First tries a direct parse, then falls back to
    locating the outermost {...} block. This tolerates reasoning models that
    prefix their answer with a thinking trace.
    """
    text = text.strip()
    try:
        return json.loads(text)
    except (ValueError, TypeError):
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except (ValueError, TypeError):
        return None


class GroqClient:
    """OpenAI-compatible client for Groq's chat completions API."""

    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.model_name = config.GROQ_MODEL
        self.base_url = config.GROQ_BASE_URL.rstrip("/")
        self.max_retries = config.LLM_MAX_RETRIES
        self.timeout = config.GROQ_TIMEOUT_SECONDS

    def generate_json(self, prompt: str, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
        """
        Generates structured JSON via Groq's chat completions endpoint.
        Returns the parsed dictionary, or None if it fails.
        """
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not set. Skipping Groq.")
            return None

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                content = data["choices"][0]["message"]["content"]
                return _extract_json(content)
            except Exception as e:
                logger.warning(f"Groq generation failed on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries:
                    time.sleep(2 ** attempt)
                else:
                    logger.error("Max retries reached for Groq generation.")
                    return None


groq_client = GroqClient()
