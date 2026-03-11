from app.schemas.medicine import Medicine
from app.services.medicine_insight_service import MedicineInsightService

from app.core.logger import get_logger

logger = get_logger(__name__)

class CompareService:

    def __init__(self):
        self.insight = MedicineInsightService()

    # ----------------------------
    # TEXT NORMALIZATION
    # ----------------------------
    def _normalize(self, text: str) -> str:
        if not text:
            return ""
        return (
            text.lower()
            .replace("(acetaminophen)", "")
            .replace("acetaminophen", "paracetamol")
            .strip()
        )

    # ----------------------------
    # PUBLIC ENTRY (BY NAME)
    # ----------------------------
    def compare_by_name(self, name1: str, name2: str):

        med1 = self.insight.get_medicine(name1)
        med2 = self.insight.get_medicine(name2)

        comparison = self._compare_raw(med1, med2)

        # 🔥 Enrich both medicines
        enriched1 = self.insight.enrich_medicine(med1)
        enriched2 = self.insight.enrich_medicine(med2)

        return {
            "medicine_1": enriched1,
            "medicine_2": enriched2,
            "comparison_summary": comparison
        }

    # ----------------------------
    # CORE COMPARISON LOGIC
    # ----------------------------
    def _compare_raw(self, med1: Medicine, med2: Medicine):

        result = {}

        # Higher dosage
        if med1.dosage_mg and med2.dosage_mg:
            if med1.dosage_mg > med2.dosage_mg:
                result["higher_dosage"] = med1.name
            elif med2.dosage_mg > med1.dosage_mg:
                result["higher_dosage"] = med2.name
            else:
                result["higher_dosage"] = "Equal"
        else:
            result["higher_dosage"] = None

        # Price difference
        if med1.price and med2.price:
            result["price_difference"] = round(med1.price - med2.price, 2)
        else:
            result["price_difference"] = None

        # Normalize ingredients
        norm1 = {self._normalize(x) for x in med1.composition}
        norm2 = {self._normalize(x) for x in med2.composition}

        result["common_ingredients"] = list(norm1 & norm2)
        result["unique_to_med1"] = list(norm1 - norm2)
        result["unique_to_med2"] = list(norm2 - norm1)

        # Normalize uses
        uses1 = {self._normalize(x) for x in med1.uses}
        uses2 = {self._normalize(x) for x in med2.uses}

        result["common_uses"] = list(uses1 & uses2)

        # Safety comparison
        if len(med1.warnings) > len(med2.warnings):
            result["more_warnings"] = med1.name
        elif len(med2.warnings) > len(med1.warnings):
            result["more_warnings"] = med2.name
        else:
            result["more_warnings"] = "Equal"

        # Side effects comparison
        if len(med1.side_effects) > len(med2.side_effects):
            result["higher_side_effect_count"] = med1.name
        elif len(med2.side_effects) > len(med1.side_effects):
            result["higher_side_effect_count"] = med2.name
        else:
            result["higher_side_effect_count"] = "Equal"

        # 🔥 Safety scoring
        result["safer_option"] = (
            med1.name if len(med1.warnings) + len(med1.side_effects)
            < len(med2.warnings) + len(med2.side_effects)
            else med2.name
        )

        return result
