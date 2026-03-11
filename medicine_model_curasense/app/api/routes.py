from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

from app.services.chat_service import ChatService
from app.services.recommendation_service import RecommendationService
from app.services.interaction_service import InteractionService
from app.services.compare_service import CompareService
from app.services.image_compare_service import ImageCompareService
from app.services.medicine_insight_service import MedicineInsightService
from app.services.vision_rag_service import VisionRAGService


router = APIRouter()

chat_service = ChatService()
recommend_service = RecommendationService()
interaction_service = InteractionService()
compare_service = CompareService()
image_compare_service = ImageCompareService()
insight_service = MedicineInsightService()
vision_rag_service = VisionRAGService()


# ----------------------------------------
# REQUEST MODELS
# ----------------------------------------


class ChatRequest(BaseModel):
    session_id: str
    message: str


class RecommendRequest(BaseModel):
    illness_text: str
    user_context: dict | None = None


class InteractionRequest(BaseModel):
    medicine_1: str
    medicine_2: str


class CompareRequest(BaseModel):
    medicine_1: str
    medicine_2: str


# ----------------------------------------
# CHAT
# ----------------------------------------
@router.post("/chat")
def chat(request: ChatRequest):
    return chat_service.chat(
        session_id=request.session_id, user_message=request.message
    )


# ----------------------------------------
# RECOMMENDATION
# ----------------------------------------
@router.post("/recommend")
def recommend(request: RecommendRequest):
    return recommend_service.recommend(request.illness_text, request.user_context)


# ----------------------------------------
# INTERACTION
# ----------------------------------------
@router.post("/interaction")
def interaction(request: InteractionRequest):
    return interaction_service.check_interaction(request.medicine_1, request.medicine_2)


# ----------------------------------------
# COMPARE BY NAME
# ----------------------------------------
@router.post("/compare")
def compare(request: CompareRequest):
    return compare_service.compare_by_name(request.medicine_1, request.medicine_2)


# ----------------------------------------
# IMAGE COMPARE
# ----------------------------------------
@router.post("/compare-images")
async def compare_images(
    image1: UploadFile = File(...), image2: UploadFile = File(...)
):
    img1_bytes = await image1.read()
    img2_bytes = await image2.read()

    return image_compare_service.compare_images(img1_bytes, img2_bytes)


# ----------------------------------------
# ANALYZE MEDICINE IMAGE
# ----------------------------------------
@router.post("/analyze-image")
async def analyze_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    return vision_rag_service.process_image(image_bytes)


# ----------------------------------------
# MEDICINE INSIGHT
# ----------------------------------------
@router.get("/medicine/{name}")
def medicine(name: str):
    med = insight_service.get_medicine(name)
    return insight_service.enrich_medicine(med)
