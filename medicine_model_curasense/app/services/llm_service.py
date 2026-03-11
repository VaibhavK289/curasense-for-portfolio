import json
import time
from typing import Optional
from app.core.config import settings

import google.generativeai as genai
from groq import Groq
from app.core.logger import get_logger

logger = get_logger(__name__)


class LLMService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

        self.gemini_model = genai.GenerativeModel("gemini-2.5-flash")

    def generate(self, prompt: str, json_mode: bool = False, temperature: float = 0.1):

       system_prompt = self._build_system_prompt(json_mode)
       final_prompt = f"{system_prompt}\n\nUser Prompt:\n{prompt}"
    
       response_text = None
    
       # Try Gemini
       for attempt in range(settings.MAX_RETRIES):
           try:
               response_text = self._call_gemini(final_prompt, temperature)
               break
           except Exception:
               continue
            
       # Fallback to Groq
       if not response_text:
           try:
               response_text = self._call_groq(final_prompt, temperature)
           except Exception:
               response_text = ""
    
       if not json_mode:
           return response_text.strip()
    
       # 🔥 JSON Mode Handling
       import json
       try:
           return json.loads(response_text)
       except:
           # Try cleaning markdown
           cleaned = (
               response_text
               .replace("```json", "")
               .replace("```", "")
               .strip()
           )
           try:
               return json.loads(cleaned)
           except:
               # 🔥 FINAL SAFE FALLBACK
               return {}
   
    # ------------------------------
    # GEMINI CALL
    # ------------------------------

    def _call_gemini(self, prompt: str, temperature: float):

        response = self.gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "top_p": 0.9,
                "max_output_tokens": 1024

            }
        )

        return response.text.strip()

    # ------------------------------
    # GROQ FALLBACK
    # ------------------------------

    def _call_groq(self, prompt: str, temperature: float):

        chat_completion = self.groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a medical AI assistant."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=temperature,
        )

        return chat_completion.choices[0].message.content.strip()

    # ------------------------------
    # SAFETY SYSTEM PROMPT
    # ------------------------------

    def _build_system_prompt(self, json_mode: bool):

        base_prompt = """
You are a medical information assistant.
You are NOT a licensed doctor.
Never prescribe medications.
Never provide emergency medical decisions.
Always encourage consulting a healthcare professional.
"""

        if json_mode:
            base_prompt += """
Respond ONLY in valid JSON format.
Do not include explanations outside JSON.
"""

        return base_prompt


    def stream_generate(self, prompt: str, temperature: float = 0.1):
        response = self.gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "top_p": 0.9,
                "max_output_tokens": 1024
            },
            stream=True
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text
