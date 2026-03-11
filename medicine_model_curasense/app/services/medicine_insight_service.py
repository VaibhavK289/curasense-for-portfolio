from app.services.rag_service import RAGService
from app.services.llm_service import LLMService
from app.core.logger import get_logger

logger = get_logger(__name__)

class MedicineInsightService:

    def __init__(self):
        self.rag = RAGService()
        self.llm = LLMService()

    def get_medicine(self, medicine_name: str):
        """Raw structured medicine (from RAG)"""
        return self.rag.get_medicine_info(medicine_name)

    def enrich_medicine(self, med):
        """Add pros, cons, cost, similar meds"""

        pros_cons = self._generate_pros_cons(med)
        similar = self._find_similar_medicines(med)
        cost = self._estimate_cost(med)

        return {
            "basic_info": med.model_dump(),
            "pros": pros_cons["pros"],
            "cons": pros_cons["cons"],
            "similar_medicines": similar,
            "approx_cost": cost
        }

    def get_full_insight(self, medicine_name: str):
        med = self.get_medicine(medicine_name)
        return self.enrich_medicine(med)

    def _generate_pros_cons(self, med):

        prompt = f"""
    You are a medical information assistant.

    Based on the following medicine data:

    Name: {med.name}
    Uses: {med.uses}
    Warnings: {med.warnings}
    Side Effects: {med.side_effects}

    Generate:

    - Pros (benefits)
    - Cons (risks or limitations)

    Return response in JSON format:

    {{
      "pros": ["..."],
      "cons": ["..."]
    }}

    Do not include explanations outside JSON.
    """

        response = self.llm.generate(prompt, json_mode=True)

        try:
            import json
            return json.loads(response)
        except:
            return {
                "pros": [],
                "cons": []
            }

    def _find_similar_medicines(self, med):

        prompt = f"""
    You are a medical assistant.

    Based on this medicine:

    Name: {med.name}
    Composition: {med.composition}
    Uses: {med.uses}

    List 5 similar medicines (same active ingredient or similar therapeutic class).

    Return ONLY a JSON list like:

    ["Medicine A", "Medicine B", "Medicine C"]
    """

        response = self.llm.generate(prompt, json_mode=True)

        try:
            import json
            return json.loads(response)
        except:
            return []
    def _estimate_cost(self, med):

        prompt = f"""
    Based on this medicine:
    
    Name: {med.name}
    Dosage: {med.dosage_mg}
    Composition: {med.composition}
    
    Estimate approximate price range in INR.
    
    Return JSON format:
    
    {{
      "approx_price_range": "₹XX - ₹YY"
    }}
    
    Return JSON only.
    """
    
        response = self.llm.generate(prompt, json_mode=True)
    
        try:
            import json
            data = json.loads(response)
            return data.get("approx_price_range")
        except:
            return None
    