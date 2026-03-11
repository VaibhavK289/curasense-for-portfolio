from app.services.medicine_insight_service import MedicineInsightService
from app.services.llm_service import LLMService
from app.core.logger import get_logger

logger = get_logger(__name__)


class InteractionService:

    def __init__(self):
        self.insight = MedicineInsightService()
        self.llm = LLMService()

    # ----------------------------------------
    # MAIN ENTRY
    # ----------------------------------------
    def check_interaction(self, med1_name: str, med2_name: str):

        # 🔹 Get raw structured data
        med1 = self.insight.get_medicine(med1_name)
        med2 = self.insight.get_medicine(med2_name)

        # 🔹 Generate interaction analysis
        analysis = self._analyze_interaction(med1, med2)

        return {
            "medicine_1": med1.name,
            "medicine_2": med2.name,
            "interaction_analysis": analysis,
            "disclaimer": "Always consult a healthcare professional before combining medications."
        }

    # ----------------------------------------
    # INTERNAL ANALYSIS
    # ----------------------------------------
    def _analyze_interaction(self, med1, med2):

        prompt = f"""
Analyze drug interaction between:

Medicine 1: {med1.name}
Ingredients: {med1.composition}

Medicine 2: {med2.name}
Ingredients: {med2.composition}

Return ONLY valid JSON:

{{
  "risk_level": "Low/Moderate/High",
  "explanation": "",
  "recommendation": ""
}}
"""

        response = self.llm.generate(prompt, json_mode=False)
    
        cleaned = response.replace("```json", "").replace("```", "").strip()
    
        try:
            import json
            return json.loads(cleaned)
        except:
            return {
                "risk_level": "Unknown",
                "explanation": response,
                "recommendation": "Consult doctor."
            }

