import os
import glob
import asyncio
import numpy as np
from typing import List, Dict
from openai import AsyncOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import get_settings

settings = get_settings()

class RAGEngine:
    def __init__(self):
        self.openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.chunks: List[Dict] = [] # {content, source, vector}
        self.is_initialized = False

    async def initialize(self):
        if self.is_initialized:
            return
        
        print("Initializing RAG Engine...")
        # Load docs - try multiple paths to be safe
        possible_paths = [
            os.path.join(os.path.dirname(__file__), '..', '..', 'docs', '*.md'), # Local dev / relative
            "/app/backend/docs/*.md", # Docker/Railway typical
            "docs/*.md", # If CWD is backend
        ]
        
        files = []
        for p in possible_paths:
            found = glob.glob(p)
            if found:
                files = found
                print(f"Found docs at: {p}")
                break
        
        if not files:
            print(f"WARNING: No documents found. checked: {possible_paths}")
            self.is_initialized = True
            return

        print(f"Found {len(files)} documents. Processing...")
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        
        all_texts = []
        all_metadatas = []

        for fpath in files:
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    fname = os.path.basename(fpath)
                    chunks = text_splitter.split_text(content)
                    for chunk in chunks:
                        all_texts.append(chunk)
                        all_metadatas.append({"source": fname, "content": chunk})
            except Exception as e:
                print(f"Error reading {fpath}: {e}")

        # Batch embed
        if all_texts and settings.OPENAI_API_KEY:
            try:
                print(f"Embedding {len(all_texts)} chunks...")
                # Process in batches to avoid limits
                batch_size = 50
                for i in range(0, len(all_texts), batch_size):
                    batch = all_texts[i:i+batch_size]
                    resp = await self.openai.embeddings.create(
                        input=batch,
                        model=settings.EMBEDDING_MODEL
                    )
                    for j, data in enumerate(resp.data):
                        self.chunks.append({
                            **all_metadatas[i+j],
                            "vector": data.embedding
                        })
                print(f"RAG Engine Initialized with {len(self.chunks)} chunks.")
            except Exception as e:
                print(f"Error embedding documents: {e}")
        else:
            print("Skipping embeddings: No text or No API Key.")
            
        self.is_initialized = True

    async def get_answer(self, query: str, history: list = None) -> str:
        if not settings.OPENAI_API_KEY:
            return "Error: OPENAI_API_KEY is not set in environment."

        # Embed query
        try:
            q_resp = await self.openai.embeddings.create(
                input=query,
                model=settings.EMBEDDING_MODEL
            )
            q_vec = q_resp.data[0].embedding
        except Exception as e:
            return f"Error creating query embedding: {str(e)}"

        # Search
        context_str = ""
        if self.chunks:
            # Cosine similarity
            scores = []
            q_vec_np = np.array(q_vec)
            
            for chunk in self.chunks:
                vec = np.array(chunk['vector'])
                # Cosine similarity for normalized vectors is just dot product
                score = np.dot(q_vec_np, vec)
                scores.append((score, chunk))
            
            # Sort
            scores.sort(key=lambda x: x[0], reverse=True)
            top_k = scores[:5]
            
            context_parts = [f"Source: {c['source']}\nContent: {c['content']}" for _, c in top_k]
            context_str = "\n\n".join(context_parts)
        
        # Build prompt
        system_prompt = (
            "You are a helpful AI assistant for the 'Humanoid Robotics' textbook. "
            "Use the following pieces of retrieved context to answer the user's question. "
            "If the answer is not in the context, say you don't know. "
            "Keep the answer concise and grounded in the provided text."
            "\n\n"
            f"Context:\n{context_str}"
        )
        
        msgs = [{"role": "system", "content": system_prompt}]
        if history:
            for msg in history[-5:]: # Last 5 messages
                # Handle SQLAlchemy model or dict
                role = getattr(msg, 'role', None) or msg.get('role')
                content = getattr(msg, 'content', None) or msg.get('content')
                if role and content:
                    msgs.append({"role": role, "content": content})
        
        msgs.append({"role": "user", "content": query})

        try:
            response = await self.openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=msgs,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating answer: {str(e)}"