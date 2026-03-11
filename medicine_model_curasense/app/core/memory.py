class ConversationMemory:

    def __init__(self):
        self.sessions = {}
        self.user_context = {}

    def add_message(self, session_id: str, role: str, content: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = []

        self.sessions[session_id].append({
            "role": role,
            "content": content
        })

    def get_history(self, session_id: str):
        return self.sessions.get(session_id, [])

    def set_context(self, session_id: str, context: dict):
        self.user_context[session_id] = context

    def get_context(self, session_id: str):
        return self.user_context.get(session_id, {})

    def clear(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.user_context:
            del self.user_context[session_id]
