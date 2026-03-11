from app.services.retrieval_service import RetrievalService

retriever = RetrievalService()

context = retriever.retrieve_context("Paracetamol 500mg")

print(context[:2000])
