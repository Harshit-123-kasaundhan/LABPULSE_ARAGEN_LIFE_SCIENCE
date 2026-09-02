import json
import logging
import time
import google.generativeai as genai
from typing import Dict, Any, List, Optional
from ..core.config import config
from google.generativeai.types import generation_types

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY
        self.model_name = config.GEMINI_MODEL
        self.max_retries = config.LLM_MAX_RETRIES
        self.timeout = config.LLM_TIMEOUT_SECONDS
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None
            logger.warning("GEMINI_API_KEY is not set. LLM calls will fail.")

    def generate_json(self, prompt: str, schema: Any, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
        """
        Generates structured JSON using Gemini. Handles retries and parsing.
        Returns the parsed dictionary, or None if it fails.
        """
        if not self.model:
            return None

        for attempt in range(self.max_retries + 1):
            try:
                # We use response_mime_type="application/json" and temperature
                # We also provide the schema to guide the output if the model supports it.
                # However, for simplicity and broad compatibility with free tier models, 
                # we just ask for JSON and parse it manually.
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=temperature,
                        response_mime_type="application/json"
                    )
                )
                
                text = response.text
                return json.loads(text)
                
            except Exception as e:
                logger.warning(f"Gemini generation failed on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries:
                    time.sleep(2 ** attempt) # Exponential backoff
                else:
                    logger.error("Max retries reached for Gemini generation.")
                    return None

gemini_client = GeminiClient()
