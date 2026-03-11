import google.generativeai as genai
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)


class VisionService:

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def extract_medicine_info(self, image_bytes: bytes):

        prompt = """
Extract the following from this medicine image:

1. Brand name (e.g., Dolo 650, Crocin 500)
2. Generic name (active ingredient)
3. Strength (e.g., 500mg, 650mg)

Return strictly in this format:

Brand: <brand name>
Generic: <generic name>
Strength: <strength>

No extra explanation.
"""


        response = self.model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": image_bytes},
                prompt
            ]
        )

        text = response.text.strip()

        import re

        brand = re.search(r"Brand:\s*(.*)", text)
        generic = re.search(r"Generic:\s*(.*)", text)
        strength = re.search(r"Strength:\s*(.*)", text)

        return {
            "brand": brand.group(1).strip() if brand else None,
            "generic": generic.group(1).strip() if generic else None,
            "strength": strength.group(1).strip() if strength else None
        }
