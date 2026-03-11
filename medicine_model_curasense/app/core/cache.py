import time


class SimpleCache:
    def __init__(self, ttl_seconds=3600):
        self.store = {}
        self.ttl = ttl_seconds

    def get(self, key):
        if key in self.store:
            value, timestamp = self.store[key]

            if time.time() - timestamp < self.ttl:
                return value
            else:
                del self.store[key]

        return None

    def set(self, key, value):
        self.store[key] = (value, time.time())
