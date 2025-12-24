"""Qdrant vector database client."""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from typing import List, Dict, Any
from ..config import settings


class QdrantClientWrapper:
    """Wrapper around Qdrant client for vector search."""

    def __init__(self):
        """Initialize Qdrant client."""
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key
        )
        self.collection_name = "chapters"

    def ensure_collection_exists(self):
        """Ensure chapters collection exists."""
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            # Create collection if it doesn't exist
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=1536,
                    distance=Distance.COSINE
                )
            )

    def add_embedding(self, point_id: str, vector: List[float], payload: Dict[str, Any]):
        """Add or update an embedding."""
        self.ensure_collection_exists()

        point = PointStruct(
            id=hash(point_id) % 2147483647,  # Convert string ID to positive integer
            vector=vector,
            payload=payload
        )
        self.client.upsert(
            collection_name=self.collection_name,
            points=[point]
        )

    def search(self, query_vector: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar embeddings."""
        self.ensure_collection_exists()

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            score_threshold=0.0
        )

        return [
            {
                "id": result.id,
                "score": result.score,
                "payload": result.payload
            }
            for result in results
        ]

    def delete_by_id(self, point_id: str):
        """Delete an embedding by ID."""
        self.ensure_collection_exists()
        self.client.delete(
            collection_name=self.collection_name,
            points_selector={"ids": [hash(point_id) % 2147483647]}
        )


# Singleton instance
qdrant_client = QdrantClientWrapper()
