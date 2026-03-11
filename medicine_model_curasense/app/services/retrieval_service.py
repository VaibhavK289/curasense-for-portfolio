import chromadb
from sentence_transformers import SentenceTransformer
from tavily import TavilyClient
from bs4 import BeautifulSoup
import requests
import uuid
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)


class RetrievalService:
    def __init__(self):
        # Use PersistentClient to avoid pydantic.v1 incompatibility with Python 3.14
        try:
            self.client = chromadb.PersistentClient(path="./chroma_db")
        except Exception:
            # Fall back to in-memory client if persistence fails
            self.client = chromadb.EphemeralClient()

        self.collection = self.client.get_or_create_collection(
            name="medicine_collection"
        )

        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self.tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

        self.allowed_domains = [
            "drugs.com",
            "1mg.com",
            "netmeds.com",
            "pharmeasy.in",
            "nih.gov",
            "fda.gov",
        ]

    # ----------------------------------
    # PUBLIC ENTRY POINT
    # ----------------------------------

    def retrieve_context(self, medicine_name: str, top_k: int = 5):
        documents = self._search_and_fetch(medicine_name)

        chunks = self._chunk_documents(documents)

        self._store_embeddings(chunks)

        results = self.collection.query(
            query_embeddings=[self.embedder.encode(medicine_name).tolist()],
            n_results=top_k,
        )

        return "\n\n".join(results["documents"][0][:5])

    # ----------------------------------
    # TAVILY SEARCH
    # ----------------------------------

    def _search_and_fetch(self, query: str):
        search_results = self.tavily.search(
            query=query, search_depth="advanced", max_results=5
        )

        documents = []

        for result in search_results["results"]:
            url = result["url"]

            if not any(domain in url for domain in self.allowed_domains):
                continue

            # USE TAVILY EXTRACTED CONTENT DIRECTLY
            content = result.get("content", "")

            if content:
                documents.append({"url": url, "content": content[:5000]})

        return documents

    # ----------------------------------
    # CHUNKING
    # ----------------------------------

    def _chunk_documents(self, documents, chunk_size=500):
        chunks = []

        for doc in documents:
            content = doc["content"]

            for i in range(0, len(content), chunk_size):
                chunk = content[i : i + chunk_size]

                chunks.append(
                    {
                        "id": str(uuid.uuid4()),
                        "text": chunk,
                        "metadata": {"source": doc["url"]},
                    }
                )

        return chunks

    # ----------------------------------
    # STORE IN CHROMA
    # ----------------------------------

    def _store_embeddings(self, chunks):
        if not chunks:
            return

        # 🔥 Extract components properly
        documents = []
        metadatas = []
        ids = []

        for i, chunk in enumerate(chunks):
            if isinstance(chunk, dict):
                documents.append(chunk.get("text", ""))
                metadatas.append(chunk.get("metadata", {}))
                ids.append(chunk.get("id", str(i)))
            else:
                documents.append(str(chunk))
                metadatas.append({})
                ids.append(str(i))

        # Remove empty documents
        filtered = [
            (doc, meta, id_)
            for doc, meta, id_ in zip(documents, metadatas, ids)
            if doc.strip()
        ]

        if not filtered:
            return

        documents, metadatas, ids = zip(*filtered)

        embeddings = self.embedder.encode(list(documents))

        if embeddings is None or len(embeddings) == 0:
            return

        self.collection.add(
            documents=list(documents),
            embeddings=embeddings.tolist(),
            metadatas=list(metadatas),
            ids=list(ids),
        )
