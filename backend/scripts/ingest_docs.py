import os
import glob
from typing import List
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables from backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "robotics-book")

# Initialize Clients
openai_client = OpenAI(api_key=OPENAI_API_KEY)
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

def get_embedding(text: str) -> List[float]:
    response = openai_client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def process_docs():
    # Path to docs - relative to this script
    docs_path = os.path.join(os.path.dirname(__file__), '..', '..', 'robotics-book-frontend', 'docs', '*.md')
    files = glob.glob(docs_path)
    
    if not files:
        print(f"No files found at {docs_path}")
        return

    print(f"Found {len(files)} documents.")

    # Re-create collection
    qdrant_client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),
    )

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )

    total_chunks = 0
    points = []

    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            filename = os.path.basename(file_path)
            
            chunks = text_splitter.split_text(content)
            print(f"Processing {filename}: {len(chunks)} chunks")

            for i, chunk in enumerate(chunks):
                vector = get_embedding(chunk)
                
                payload = {
                    "source": filename,
                    "content": chunk,
                    "chunk_index": i
                }

                points.append(models.PointStruct(
                    id=total_chunks, # Simple incremental ID
                    vector=vector,
                    payload=payload
                ))
                total_chunks += 1

                # Batch upload every 50 chunks
                if len(points) >= 50:
                    qdrant_client.upsert(
                        collection_name=COLLECTION_NAME,
                        points=points
                    )
                    points = []
                    print(f"Uploaded batch...")

    # Upload remaining
    if points:
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Uploaded final batch.")

    print(f"Ingestion complete! Total chunks: {total_chunks}")

if __name__ == "__main__":
    process_docs()
