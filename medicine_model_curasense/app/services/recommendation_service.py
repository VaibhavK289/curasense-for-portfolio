from app.services.medicine_insight_service import MedicineInsightService
from app.services.llm_service import LLMService
from app.core.cache import SimpleCache
from app.core.logger import get_logger

logger = get_logger(__name__)


class RecommendationService:

    def __init__(self):
        self.insight = MedicineInsightService()  # 🔥 Centralized layer
        self.llm = LLMService()
        self.cache = SimpleCache(ttl_seconds=1800)

    # ------------------------------------
    # MAIN ENTRY
    # ------------------------------------
    def recommend(self, illness_text: str, user_context: dict = None):

        context_str = str(user_context) if user_context else ""
        cache_key = (illness_text + context_str).lower()

        cached = self.cache.get(cache_key)
        if cached:
            return cached

        symptoms = self._extract_symptoms_llm(illness_text)

        candidate_names = self._generate_candidate_medicines(symptoms)
        candidate_names = candidate_names[:3]  # limit heavy calls

        medicines = []

        for name in candidate_names:
            try:
                # 🔥 Use centralized raw medicine retrieval
                med = self.insight.get_medicine(name)
                medicines.append(med)
            except:
                continue

        ranked = self._rank_medicines(medicines, symptoms, user_context)

        # 🔥 Enrich only top 2 medicines
        enriched_results = []
        for item in ranked[:2]:
            enriched = self.insight.get_full_insight(item["name"])
            enriched_results.append(enriched)

        result = {
            "symptoms_detected": symptoms,
            "recommended_medicines": enriched_results,
            "disclaimer": "This is informational only. Please consult a healthcare professional before taking any medication."
        }

        self.cache.set(cache_key, result)

        return result

    # ------------------------------------
    # STEP 1: Extract Symptoms
    # ------------------------------------
    def _extract_symptoms_llm(self, text: str):

        prompt = f"""
Extract medical symptoms from the following text.
Return comma-separated list only.

Text: "{text}"
"""

        response = self.llm.generate(prompt, json_mode=False)

        cleaned = (
            response.replace("```json", "")
            .replace("```", "")
            .replace("[", "")
            .replace("]", "")
            .replace('"', "")
        )

        return [
            s.strip().lower()
            for s in cleaned.split(",")
            if s.strip()
        ]

    # ------------------------------------
    # STEP 2: Generate Candidate Medicines
    # ------------------------------------
    def _generate_candidate_medicines(self, symptoms):

        symptom_text = ", ".join(symptoms)

        prompt = f"""
List 5 commonly used medicines for treating:
{symptom_text}

Return comma-separated names only.
"""

        response = self.llm.generate(prompt, json_mode=False)

        return [
            m.strip()
            for m in response.split(",")
            if m.strip()
        ]

    # ------------------------------------
    # STEP 3: Rank (Lightweight)
    # ------------------------------------
    def _rank_medicines(self, medicines, symptoms, user_context=None):

        scored = []

        for med in medicines:
            score = 0

            # Symptom match scoring
            for symptom in symptoms:
                for use in med.uses:
                    if symptom.lower() in use.lower():
                        score += 2

            score -= len(med.warnings) * 0.5
            score -= len(med.side_effects) * 0.3

            # Context filtering
            if user_context:
                warnings_text = " ".join(med.warnings).lower()
                contraindications_text = " ".join(med.contraindications).lower()
                composition_text = " ".join(med.composition).lower()

                age = user_context.get("age")
                if age and age < 12:
                    if "children under 12" in warnings_text:
                        score -= 5

                if user_context.get("pregnant"):
                    if "pregnancy" in warnings_text:
                        score -= 6

                for condition in user_context.get("conditions", []):
                    if condition.lower() in contraindications_text:
                        score -= 7

                for allergy in user_context.get("allergies", []):
                    if allergy.lower() in composition_text:
                        score -= 10

            scored.append((score, med))

        scored.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "name": med.name,
                "score": round(score, 2)
            }
            for score, med in scored
        ]
