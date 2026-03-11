from app.services.extraction_service import ExtractionService

context = """
Paracetamol 500mg tablet.
Used for fever and mild pain.
Common side effects include nausea.
Manufactured by ABC Pharma.
Price: ₹20 per strip.
"""

extractor = ExtractionService()
medicine = extractor.extract_medicine(context)

print(medicine.model_dump())
