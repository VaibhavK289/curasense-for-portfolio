from app.services.rag_service import RAGService
from app.services.compare_service import CompareService
from app.services.recommendation_service import RecommendationService
from app.services.llm_service import LLMService
from app.core.memory import ConversationMemory
from app.services.medicine_insight_service import MedicineInsightService
from app.services.interaction_service import InteractionService
from app.core.logger import get_logger

logger = get_logger(__name__)

class ChatService:

    def __init__(self):
        self.insight = MedicineInsightService()
        self.recommend = RecommendationService()
        self.interaction = InteractionService()
        self.memory = ConversationMemory()
        self.llm = LLMService()

    # ------------------------------------
    # MAIN CHAT ENTRY
    # ------------------------------------
    def chat(self, session_id: str, user_message: str):

        self.memory.add_message(session_id, "user", user_message)

        # Extract context
        new_context = self._extract_user_context(user_message)
        existing_context = self.memory.get_context(session_id)
        merged_context = {**existing_context, **new_context}
        self.memory.set_context(session_id, merged_context)

        intent = self._detect_intent(user_message)

        if intent == "recommendation":
            response = self.recommend.recommend(
                user_message,
                user_context=merged_context
            )

        elif intent == "medicine_info":
            response = self.insight.get_full_insight(user_message)

        elif intent == "comparison":
            # You can add similar extraction logic for comparison
            response = {"message": "Comparison detected"}

        elif intent == "interaction":
            response = self._handle_interaction(user_message)

        else:
            response = self._handle_general_question(user_message)

        self.memory.add_message(session_id, "assistant", str(response))

        return response

    # ------------------------------------
    # INTENT DETECTION
    # ------------------------------------
    def _detect_intent(self, text: str):

        prompt = f"""
Classify the user query into one of these intents:

- medicine_info
- recommendation
- comparison
- interaction
- general

Text: "{text}"

Return only one word.
"""

        response = self.llm.generate(prompt, json_mode=False)

        return response.strip().lower()


    # ------------------------------------
    # HANDLERS
    # ------------------------------------
    def _handle_medicine_info(self, text):

        medicine_name = text.strip()

        return self.insight.get_full_insight(medicine_name)


    def _handle_recommendation(self, text: str):

        result = self.recommend.recommend(text)

        return {
            "type": "recommendation",
            "data": result
        }

    def _handle_comparison(self, text: str):

        prompt = f"""
Extract two medicine names from this text.
Return them separated by comma.
Text: "{text}"
"""

        response = self.llm.generate(prompt, json_mode=False)

        names = [n.strip() for n in response.split(",")]

        if len(names) < 2:
            return {"error": "Could not detect two medicines to compare."}

        med1 = self.rag.get_medicine_info(names[0])
        med2 = self.rag.get_medicine_info(names[1])

        comparison = self.compare.compare(med1, med2)

        return {
            "type": "comparison",
            "medicine_1": med1.model_dump(),
            "medicine_2": med2.model_dump(),
            "comparison": comparison
        }

    def _handle_general_question(self, text: str):

        prompt = f"""
Answer the medical question safely.
Never prescribe.
Encourage consulting doctor.

Question: "{text}"
"""

        response = self.llm.generate(prompt, json_mode=False)

        return {
            "type": "general",
            "answer": response
        }

    def stream_chat(self, session_id: str, user_message: str):

        self.memory.add_message(session_id, "user", user_message)

        prompt = f"""
You are a safe medical assistant.
Conversation history:
{self.memory.get_history(session_id)}

User: {user_message}
"""

        for chunk in self.llm.stream_generate(prompt):
            yield chunk

    def _extract_user_context(self, text: str):

        prompt = f"""
Extract medical user context from the following text.

Return in simple comma-separated format like:
age: <number>
pregnant: true/false
conditions: condition1|condition2
allergies: allergy1|allergy2

If not mentioned, leave blank.

Text: "{text}"
"""

        response = self.llm.generate(prompt, json_mode=False)

        context = {
            "age": None,
            "pregnant": False,
            "conditions": [],
            "allergies": []
        }

        lines = response.lower().split("\n")

        for line in lines:
            if "age:" in line:
                try:
                    context["age"] = int(line.split(":")[1].strip())
                except:
                    pass

            elif "pregnant:" in line:
                if "true" in line:
                    context["pregnant"] = True

            elif "conditions:" in line:
                values = line.split(":")[1].strip()
                if values:
                    context["conditions"] = [c.strip() for c in values.split("|")]

            elif "allergies:" in line:
                values = line.split(":")[1].strip()
                if values:
                    context["allergies"] = [a.strip() for a in values.split("|")]

        return context

    def _handle_interaction(self, text: str):

    # Extract two medicine names
        prompt = f"""
Extract exactly two medicine names from this text.
Return them comma-separated.
No explanation.

Text: "{text}"
"""

        response = self.llm.generate(prompt, json_mode=False)

        names = [
            n.strip()
            for n in response.split(",")
            if n.strip()
        ]

        if len(names) < 2:
            return {
                "error": "Could not detect two medicines in your query."
            }

        return self.interaction.check_interaction(
            names[0],
            names[1]
        )
