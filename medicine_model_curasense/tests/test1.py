from app.services.llm_service import LLMService

llm = LLMService()

response = llm.generate(
    prompt="What is Paracetamol used for?",
    json_mode=False
)

print(response)
