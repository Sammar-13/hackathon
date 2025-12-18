"""Claude API client for LLM features."""
import anthropic
from typing import Optional
from ..config import settings


class ClaudeClientWrapper:
    """Wrapper around Claude API client."""

    def __init__(self):
        """Initialize Claude client."""
        self.client = anthropic.Anthropic(api_key=settings.claude_api_key)
        self.model = "claude-3-5-sonnet-20241022"

    def personalize_chapter(
        self,
        chapter_content: str,
        experience_level: str,
    ) -> str:
        """Personalize chapter content based on experience level."""
        prompt = f"""You are an educational content specialist. Personalize the following chapter content for a {experience_level} level learner.

Keep the same structure and key concepts, but adjust the depth, terminology, and examples appropriately:
- beginner: Use simpler language, more foundational explanations, avoid jargon
- intermediate: Balanced explanations, some advanced concepts, practical examples
- advanced: Deep technical details, research references, advanced patterns

CHAPTER CONTENT:
{chapter_content}

Provide the personalized version maintaining all code blocks and formatting."""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text

    def translate_chapter(
        self,
        chapter_content: str,
        language_code: str,
    ) -> str:
        """Translate chapter content to specified language, preserving code blocks."""
        language_name = "Urdu" if language_code == "ur" else language_code

        prompt = f"""You are a technical translator. Translate the following chapter to {language_name}.

IMPORTANT RULES:
1. Preserve ALL code blocks exactly as-is (do not translate code)
2. Preserve ALL code comments in their original language
3. Maintain all formatting and structure
4. Use technical terminology appropriate for {language_name}

CHAPTER CONTENT:
{chapter_content}

Provide the translated version with code blocks unchanged."""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text

    def rag_response(
        self,
        question: str,
        context_sections: list[dict],
    ) -> str:
        """Generate RAG response with citations."""
        # Format context from retrieved sections
        context_text = "\n\n".join([
            f"[{section.get('chapter_title', 'Unknown')} - Section {section.get('section_idx', 0)}]\n{section.get('section_text', '')}"
            for section in context_sections
        ])

        prompt = f"""You are an expert assistant for the Physical AI & Humanoid Robotics Book.
Answer the user's question using ONLY the provided book content.

If the question cannot be answered from the book content, respond: "I can only answer questions about the Physical AI & Robotics Book content. Your question is outside the scope of this book."

Always cite which section you're referencing when answering.

BOOK CONTENT:
{context_text}

USER QUESTION:
{question}

Provide a clear, concise answer with citations."""

        message = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text


# Singleton instance
claude_client = ClaudeClientWrapper()
