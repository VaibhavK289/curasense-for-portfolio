from app.services.retrieval_service import RetrievalService
from app.services.extraction_service import ExtractionService
from app.schemas.medicine import Medicine
from app.core.cache import SimpleCache
from app.core.logger import get_logger

logger = get_logger(__name__)


class RAGService:

    def __init__(self):
        self.retriever = RetrievalService()
        self.extractor = ExtractionService()
        self.cache = SimpleCache(ttl_seconds=3600)

    def get_medicine_info(self, medicine_name: str) -> Medicine:

        cache_key = medicine_name.lower()

        # 🔹 Check cache first
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        # 🔹 Run full RAG only if not cached
        context = self.retriever.retrieve_context(medicine_name)

        medicine = self.extractor.extract_medicine(context)

        # 🔹 Store in cache
        self.cache.set(cache_key, medicine)

        return medicine
