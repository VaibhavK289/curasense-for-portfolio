import json
import re
from app.services.llm_service import LLMService
from app.schemas.medicine import Medicine
from app.core.logger import get_logger

logger = get_logger(__name__)


class ExtractionService:

    def __init__(self):
        self.llm = LLMService()

    def extract_medicine(self, context: str) -> Medicine:

        prompt = self._build_prompt(context)
    
        for attempt in range(2):
        
            raw_output = self.llm.generate(
                prompt=prompt,
                json_mode=True,
                temperature=0.1
            )
    
            try:
                cleaned_json = self._safe_json_parse(raw_output)
                return Medicine(**cleaned_json)
    
            except Exception as e:
                if attempt == 1:
                    raise ValueError(f"Final extraction failed: {e}")
    
        raise ValueError("Extraction failed after retries.")

    # -------------------------
    # PROMPT BUILDER
    # -------------------------

    def _build_prompt(self, context: str) -> str:
        with open("app/prompts/extraction.txt", "r", encoding="utf-8") as f:
            template = f.read()

        return f"{template}\n\nContext:\n{context}"

    # -------------------------
    # SAFE JSON PARSER
    # -------------------------
    def _safe_json_parse(self, text):
        
        import json
        import re
    
        # 🔥 If already parsed dict, return directly
        if isinstance(text, dict):
            return text
    
        if not isinstance(text, str):
            return {}
    
        try:
            return json.loads(text)
        except:
            # Try extracting JSON block
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    return {}
            return {}
    
    # -------------------------
    # AUTO JSON REPAIR
    # -------------------------

    def _repair_json(self, text: str):

        # Remove markdown formatting
        text = re.sub(r"```json|```", "", text)

        # Remove trailing commas
        text = re.sub(r",\s*}", "}", text)
        text = re.sub(r",\s*]", "]", text)

        # Extract first JSON block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return match.group(0)

        raise ValueError("Could not repair JSON output.")

    def _repair_with_llm(self, broken_json: str):

        repair_prompt = f"""
    The following JSON is malformed.
    
    Fix it and return ONLY valid JSON.
    
    Broken JSON:
    {broken_json}
    """
    
        repaired = self.llm.generate(
            prompt=repair_prompt,
            json_mode=True,
            temperature=0
        )
    
        return json.loads(repaired)

    