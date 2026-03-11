from app.services.rag_service import RAGService

rag = RAGService()

medicine = rag.get_medicine_info("Paracetamol 500mg")

print("\n=== STRUCTURED OUTPUT ===\n")
print(medicine.model_dump())
