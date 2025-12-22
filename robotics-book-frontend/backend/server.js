const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
app.use(cors({ origin: '*' })); // Allow all for demo/hackathon
app.use(express.json());

// --- Global Knowledge Base ---
let knowledgeBase = [];

// --- 1. DOC PROCESSING & CHUNKING ---

function cleanMarkdown(text) {
    // 1. Remove YAML frontmatter (content between --- and --- at start)
    const frontmatterRegex = /^---\s*[\s\S]*?---\s*/;
    text = text.replace(frontmatterRegex, '');

    // 2. Remove minimal markdown clutter if needed (optional)
    // text = text.replace(/[\[\]\(]+\([^\)]+\)[\s\S]*?[\s\S]*?\]/g, '$1'); // Remove links, keep text

    return text.trim();
}

function chunkText(text, filename) {
    // Split by double newlines to respect paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = "";
    
    // Target chunk size
    const MAX_CHUNK_SIZE = 1000; 

    for (const para of paragraphs) {
        // If adding the next paragraph exceeds the limit, push the current chunk
        if (currentChunk.length + para.length > MAX_CHUNK_SIZE) {
            if (currentChunk.trim()) {
                chunks.push({
                    source: filename,
                    content: currentChunk.trim()
                });
            }
            currentChunk = para + "\n\n"; // Start new chunk
        } else {
            currentChunk += para + "\n\n";
        }
    }
    
    // Push the final remaining chunk
    if (currentChunk.trim()) {
        chunks.push({
            source: filename,
            content: currentChunk.trim()
        });
    }

    return chunks;
}

async function ingestDocs() {
    console.log("📚 Starting Documentation Ingestion...");
    
    // Look for docs INSIDE the backend/docs folder
    const docsPath = path.join(__dirname, 'docs', '**', '*.{md,mdx}');
    console.log(`🔍 Searching in: ${docsPath}`);

    try {
        const files = await glob.glob(docsPath);
        
        if (files.length === 0) {
            console.error("❌ CRITICAL: No documentation files found in backend/docs!");
            console.error("   Please ensure you have copied the .md files to backend/docs/");
            process.exit(1); // Fail loudly
        }

        knowledgeBase = [];

        for (const file of files) {
            const rawContent = fs.readFileSync(file, 'utf-8');
            const cleanContent = cleanMarkdown(rawContent);
            const filename = path.basename(file);
            
            const fileChunks = chunkText(cleanContent, filename);
            knowledgeBase.push(...fileChunks);
        }

        console.log(`✅ SUCCESSFULLY LOADED: ${files.length} files`);
        console.log(`✅ KNOWLEDGE BASE: ${knowledgeBase.length} chunks created`);
        
        if (knowledgeBase.length === 0) {
            console.error("❌ CRITICAL: Files were found but no content chunks could be created.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ FATAL ERROR during ingestion:", error);
        process.exit(1);
    }
}

// --- 2. RETRIEVAL (Cosine Similarity Mock - Keyword Weighted) ---
function retrieveContext(query) {
    if (!query) return "";
    
    const terms = query.toLowerCase().replace(/[^WZWZ\s]/g, '').split(/\s+/).filter(t => t.length > 3);
    
    // Score chunks based on term frequency
    const scoredChunks = knowledgeBase.map(chunk => {
        let score = 0;
        const lowerContent = chunk.content.toLowerCase();
        
        terms.forEach(term => {
            // Simple frequency count
            const regex = new RegExp(`\\b${term}\\b`, 'g');
            const count = (lowerContent.match(regex) || []).length;
            score += count;
        });

        // Boost score if filename is relevant to query (basic heuristic)
        terms.forEach(term => {
            if (chunk.source.toLowerCase().includes(term)) {
                score += 5;
            }
        });

        return { ...chunk, score };
    });

    // Get top 3 most relevant chunks
    const topChunks = scoredChunks
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    if (topChunks.length === 0) return null;

    return topChunks.map(c => `[File: ${c.source}]\n${c.content}`).join("\n---\n");
}

// --- 3. API ENDPOINTS ---

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        docs_loaded: knowledgeBase.length > 0,
        chunk_count: knowledgeBase.length 
    });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) return res.status(400).json({ error: "Message required" });

    // 1. Search for context
    const context = retrieveContext(message);
    console.log(`[CHAT] Query: "${message}" | Context Found: ${!!context}`);

    // 2. Fail if no context found (Strict RAG)
    if (!context) {
        return res.json({
            reply: "I'm sorry, but this specific information is not available in the provided documentation. Please ask about ROS 2, Gazebo, or the book chapters."
        });
    }

    // 3. Generate AI Response
    try {
        // Fallback for demo if no key
        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ No API Key. Returning mock response.");
            return res.json({
                reply: `(Demo Mode) I found relevant info in **${context.split('\n')[0]}**. \n\nNormally I would use Gemini to synthesize this answer, but the API key is missing.`
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `You are a strict technical assistant for a Robotics Book.
        
        INSTRUCTIONS:
        1. Answer the user's question using ONLY the context provided below.
        2. If the answer cannot be found in the context, say "I cannot answer this based on the current documentation."
        3. Do not invent information.
        4. Be helpful and professional.
        
        CONTEXT:
        ${context}`;

        const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
        const response = await result.response;
        
        res.json({ reply: response.text() });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ reply: "I encountered an error processing your request." });
    }
});

// --- START SERVER ---
// Ingest docs *before* listening
ingestDocs().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 SERVER RUNNING on port ${PORT}`);
        console.log(`📚 Knowledge Base: ${knowledgeBase.length} chunks ready.`);
        console.log(`👉 Health Check: http://localhost:${PORT}/`);
    });
});