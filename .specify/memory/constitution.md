# Physical AI & Humanoid Robotics Book Platform Constitution

## Core Principles

### I. Learning-First Architecture
Every feature MUST prioritize learner outcomes and content accessibility. Educational value must be defensible and measurable. Features are ranked by priority (P1: core reading, P2: personalization, P3: advanced interactions). P1 features are non-negotiable and MUST be functional before any P2/P3 work begins.

### II. User Profile-Driven Personalization
System MUST collect user context (OS, GPU, experience level, robotics background) at signup and use it to customize content delivery. Personalization is additive—never hide core content behind personalization barriers. Fallback to original content on all personalization failures.

### III. Content Integrity and Language Support
Chapter content integrity MUST be preserved across all transformations (personalization, translation, RAG). Code blocks MUST never be translated or modified during language adaptation. Original English content MUST always be accessible alongside translations (Urdu and future languages).

### IV. RAG Grounding (Non-Negotiable)
Chatbot responses MUST be grounded exclusively in book content with citations. Hallucinations outside book scope are explicitly prohibited. Off-topic queries MUST receive polite decline with offer to refocus on book content. Every chatbot response MUST include source attribution (chapter + section).

### V. Authentication and Session Management
User authentication MUST use BetterAuth with session-based tokens. Passwords MUST be hashed (never stored in plain text). Sessions MUST expire after 24 hours of inactivity. Session timeouts MUST NOT break reading experience—original content remains accessible, personalization features require re-auth.

### VI. Performance and Reliability Budgets
Response latency for personalization and translation MUST fall within 10–25 seconds (acceptable for hackathon timeline). System MUST gracefully degrade: timeout messaging, fallback to original content, cached results. Success rate target: ≥90% of personalization/translation attempts MUST complete (failures <10%).

### VII. Simplicity and YAGNI
Start with the minimum viable feature set aligned to P1 priorities. Pre-generate embeddings for chapters (no on-the-fly generation). Do not add admin features, real-time collaboration, or offline modes during MVP. Deployment targets free/low-cost tiers (GitHub Pages, Render/Heroku free).

## Technology Stack & Constraints

**Frontend**: Docusaurus (static site generator) with React for interactive components (Sign Up, Personalize, Translate, Chatbot UI)
**Backend**: FastAPI (Python 3.11+) for API endpoints
**Database**: Neon PostgreSQL (user profiles, sessions, chat history)
**Vector Store**: Qdrant (chapter embeddings, RAG retrieval)
**Auth**: BetterAuth (session-based authentication)
**LLM**: Claude API (personalization, translation, RAG response generation)
**Deployment**: GitHub Pages (frontend), Render/Heroku/GCP free tier (backend)

**Constraints**:
- Response latency: 10–25 seconds for personalization/translation (acceptable for hackathon)
- Concurrent users: Minimum 100 without degradation
- Page load time: ≥95% pages load in <3 seconds
- Urdu translation: Automated only (quality may vary)
- Vector embeddings: Pre-generated before launch (not on-the-fly)
- PII minimization: Collect only name, email, OS, GPU, experience level, robotics background

## Data Model & Entities

**User**: id, name, email (unique), password_hash, os (dropdown), gpu (dropdown), experience_level (beginner/intermediate/advanced), robotics_background (text), created_at, last_login
**Chapter**: id, title, slug, content (Markdown), metadata (order, section count), created_at
**Session**: session_token (hashed/signed), user_id, created_at, expires_at, is_active
**Chat Message**: id, user_id, chapter_context (chapter_id/section), message_type (user/assistant), content, timestamp
**Chapter Embedding**: id, chapter_id, section (if applicable), embedding_vector, stored_in_qdrant
**Personalized Content** (optional cache): id, user_id, chapter_id, personalized_text, created_at

## Development Workflow & Quality Gates

1. **Feature Development Order (P1 → P2 → P3)**:
   - P1: Book content readable, signup/signin, deployment live
   - P2: Personalization, Urdu translation, RAG chatbot (only after P1 stable)
   - P3: Text selection highlighting, advanced interactions

2. **Testing Requirements**:
   - Unit tests for all API endpoints (signup, signin, personalize, translate, chat)
   - Integration tests for database and vector store connectivity
   - Contract tests for BetterAuth session flow
   - End-to-end tests for user journeys (signup → read → personalize)

3. **Code Review Standards**:
   - All PRs MUST verify no plain-text passwords or secrets committed
   - All API changes MUST be tested against acceptance scenarios from spec
   - Personalization/translation responses MUST be spot-checked for accuracy (sample 3–5 examples per PR)
   - RAG chatbot responses MUST include citations (verified manually or via regex check)

4. **Deployment Gate**:
   - All P1 features MUST be functional and tested before production deployment
   - Environment variables MUST be configured (database URLs, API keys, CORS origins)
   - CORS setup MUST allow frontend-backend cross-domain communication
   - Deployment checklist: frontend live, backend live, database online, vector store online

## Observability & Logging

- Authentication events (signup, signin, signout, session expiry) MUST be logged
- API request/response times for personalization and translation MUST be tracked
- RAG chatbot queries and response quality (accuracy, citation presence) MUST be monitored
- Error rates and timeout occurrences MUST be logged for debugging

## Governance

**Amendments**: Changes to core principles require team consensus and MUST be documented with rationale in this file. Non-principle updates (clarifications, constraint adjustments) may be made without consensus but MUST be logged in commit history.

**Compliance Review**: Every PR merging to main MUST include a compliance comment referencing relevant principles (e.g., "Ensures IV. RAG Grounding by validating all chatbot responses include citations").

**Runtime Guidance**: Development teams MUST reference this constitution during planning (`/sp.plan`) and task generation (`/sp.tasks`) to ensure alignment.

**Version Policy**:
- MAJOR: Principle removals or backward-incompatible redefinitions
- MINOR: New principles or material clarifications
- PATCH: Wording refinements, typo fixes, constraint value adjustments

## Sign-Off Criteria

Constitution is approved once:
- All functional requirements (FR-001 to FR-033) align with principles
- Success criteria (SC-001 to SC-012) are measurable and achievable
- User stories (P1–P3) map to principle priorities
- Technology stack selections are justified by constraints
- No unresolved [NEEDS CLARIFICATION] markers remain
- Data model supports all user entities and workflows

**Version**: 1.0.0 | **Ratified**: 2025-12-16 | **Last Amended**: 2025-12-16
