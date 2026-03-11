from app.services.vision_service import VisionService
from app.services.compare_service import CompareService


class ImageCompareService:

    def __init__(self):
        self.vision = VisionService()
        self.compare = CompareService()

    def compare_images(self, image1_bytes, image2_bytes):

        info1 = self.vision.extract_medicine_info(image1_bytes)
        info2 = self.vision.extract_medicine_info(image2_bytes)

        name1 = info1.get("brand") or info1.get("generic")
        name2 = info2.get("brand") or info2.get("generic")

        if not name1 or not name2:
            raise ValueError("Could not detect medicine names from images")

        return self.compare.compare_by_name(name1, name2)
