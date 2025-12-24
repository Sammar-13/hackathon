# AI Chat Backend

This is the FastAPI backend for the Humanoid Robotics Book AI Assistant. It uses Retrieval-Augmented Generation (RAG) with Qdrant and OpenAI.

## 📂 Project Structure

```
backend/
├── app/
│   ├── api/            # API Endpoints
│   ├── core/           # Configuration
│   ├── db/             # Database Models & Session
│   ├── rag/            # RAG Logic
│   ├── services/       # External Services (Qdrant, OpenAI)
│   └── main.py         # App Entrypoint
├── scripts/
│   └── ingest_docs.py  # Script to ingest docs into Qdrant
├── Dockerfile          # Deployment
├── requirements.txt    # Python Dependencies
└── .env                # Environment Variables
```

## 🚀 Local Setup

1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```

2.  **Create virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    *   Copy `.env.example` to `.env` (already done if using provided setup).
    *   Ensure your API keys (OpenAI, Qdrant) are set in `.env`.

5.  **Ingest Documents:**
    This will read markdown files from `../robotics-book-frontend/docs` and upload them to Qdrant.
    ```bash
    python scripts/ingest_docs.py
    ```

6.  **Run the Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.
    Docs at `http://localhost:8000/docs`.

## 🌐 Frontend Integration

A React component has been created at `robotics-book-frontend/src/components/AIChat`.

To use it, simply import it in your Docusaurus layout or root component (e.g., `src/theme/Root.tsx` or `src/pages/index.tsx`).

**Example (`src/theme/Root.tsx`):**
```tsx
import React from 'react';
import AIChat from '@site/src/components/AIChat';

export default function Root({children}) {
  return (
    <>
      {children}
      <AIChat />
    </>
  );
}
```

## ☁️ Deployment

### 1. Docker
Build and run the container:
```bash
docker build -t robotics-backend .
docker run -p 8000:8000 --env-file .env robotics-backend
```

### 2. Railway / Render / Fly.io

**Railway/Render:**
1.  Connect your repository.
2.  Set `Root Directory` to `backend`.
3.  Add the Environment Variables from `.env` into the platform's dashboard.
4.  The `Dockerfile` will be automatically detected.
5.  Deploy.

**Database:**
*   This setup uses `sqlite` or `postgres`.
*   For production, set `DATABASE_URL` to a real Postgres database (e.g., from Neon or Railway).

**Qdrant:**
*   Ensure `QDRANT_URL` and `QDRANT_API_KEY` are set in the deployment environment variables.
