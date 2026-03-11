from app.services.vision_service import VisionService
from app.services.medicine_insight_service import MedicineInsightService
from app.core.logger import get_logger

logger = get_logger(__name__)

class VisionRAGService:

    def __init__(self):
        self.vision = VisionService()
        self.insight = MedicineInsightService()

    def process_image(self, image_bytes):

        extracted = self.vision.extract_medicine_info(image_bytes)

        name = extracted.get("brand") or extracted.get("generic")

        if not name:
            raise ValueError("Medicine not detected")

        enriched = self.insight.get_full_insight(name)

        return {
            "image_extracted_info": extracted,
            "medicine_insight": enriched
        }
