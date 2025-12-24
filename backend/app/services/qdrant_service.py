from qdrant_client import QdrantClient
from app.core.config import get_settings
from openai import AsyncOpenAI

settings = get_settings()

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL, 
            api_key=settings.QDRANT_API_KEY
        )
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.collection_name = settings.QDRANT_COLLECTION_NAME

    async def get_embedding(self, text: str):
        response = await self.openai_client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

    async def search(self, query: str, limit: int = 5):
        embedding = await self.get_embedding(query)
        hits = self.client.search(
            collection_name=self.collection_name,
            query_vector=embedding,
            limit=limit
        )
        return hits
