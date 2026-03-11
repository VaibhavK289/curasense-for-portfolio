from app.services.chat_service import ChatService

chat = ChatService()
session = "user1"

print(chat.chat(session, "I am pregnant"))
print(chat.chat(session, "I have fever"))

