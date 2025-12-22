const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 1. ROBUST CORS (Allows Vercel Frontend to talk to Render Backend)
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'], // Explicitly allow frontend origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. DETAILED LOGGING MIDDLEWARE
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🚀 Incoming Request: ${req.method} ${req.path}`);
  console.log(`[${timestamp}] Origin: ${req.get('origin')}`);
  if (req.method === 'POST') {
    console.log(`[${timestamp}] Payload received:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// 3. MAIN CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  
  // A. TIMEOUT HANDLING (25 seconds max - slightly increased for safety)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("❌ Request timed out after 25s");
      res.status(504).json({ error: "Request timed out. Gemini is taking too long." });
    }
  }, 25000);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[API] Processing POST /api/chat`);

    // B. VALIDATION
    if (!apiKey) {
      clearTimeout(timeout);
      console.error("❌ CRITICAL: GEMINI_API_KEY is missing!");
      return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    const { message } = req.body;
    if (!message) {
      clearTimeout(timeout);
      console.warn("⚠️ Empty message received");
      return res.status(400).json({ error: "Message is required." });
    }

    // C. LOGGING REQUEST (Mandatory)
    console.log(`\n─── [LOG] 1. Incoming Question ───`);
    console.log(`"${message}"`);

    // D. GEMINI CLIENT & PROMPT
    const genAI = new GoogleGenerativeAI(apiKey);
    
    /**
     * MODEL SELECTION LOGIC (Free Tier Optimized)
     * Primary: gemini-2.0-flash (Fastest, latest stable, high free quota)
     * Fallback: gemini-1.5-flash (Reliable alternative if 2.0 is unavailable)
     */
    const PRIMARY_MODEL = "gemini-2.0-flash";
    const FALLBACK_MODEL = "gemini-1.5-flash";
    
    let model;
    try {
        model = genAI.getGenerativeModel({ 
            model: PRIMARY_MODEL,
            generationConfig: {
                maxOutputTokens: 1000, // Safety limit for free tier
                temperature: 0.7,
            }
        });
    } catch (e) {
        console.warn(`[API] Failed to init ${PRIMARY_MODEL}, trying ${FALLBACK_MODEL}`);
        model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    }

    const systemPrompt = `You are the official AI Teaching Assistant for the book 'Physical AI & Humanoid Robotics'.
    
    CORE CONTEXT:
    - You cover: ROS 2 (Robot Operating System), Gazebo Simulation, NVIDIA Isaac Sim, Vision-Language-Action (VLA) models, and Humanoid Hardware.
    - Chapter 1: Intro to Physical AI.
    - Chapter 2: ROS 2 Fundamentals.
    - Chapter 3: Gazebo & URDF.
    - Chapter 4: NVIDIA Isaac & Reinforcement Learning.
    - Chapter 5: VLA Models & Transformers.
    - Chapter 6: Capstone Project.

    INSTRUCTIONS:
    - Answer ONLY questions related to these topics.
    - If asked about unrelated topics (cooking, politics, history), reply: "I can only help with questions about Physical AI and Robotics."
    - Be concise, technical, and encouraging.
    `;
    
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}\n\nAnswer:`;

    console.log(`\n─── [LOG] 2. Gemini Request Sent ───`);
    // Truncate long prompt logs for readability if needed, but keeping full system prompt as requested context
    console.log("(System Prompt + User Message sent to Gemini)");

    // E. GENERATE CONTENT
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    // F. RAW RESPONSE LOGGING (Mandatory)
    console.log(`\n─── [LOG] 3. Gemini Raw Response ───`);
    // Log relevant parts of the response structure
    console.log(JSON.stringify(response, null, 2));

    // G. SAFE TEXT EXTRACTION
    let text = "";
    if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            text = candidate.content.parts.map(part => part.text).join('');
        }
    }
    
    // Fallback if manual extraction fails but helper exists (rare but safe)
    if (!text && typeof response.text === 'function') {
        try {
            text = response.text();
        } catch (e) {
            console.warn("response.text() failed, likely due to safety filters.", e);
        }
    }

    if (!text) {
        console.warn("⚠️ Empty text in response. Checking finishReason...");
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason) {
             console.log(`Finish Reason: ${finishReason}`);
             text = `(No response generated. Reason: ${finishReason})`;
        } else {
             text = "(Empty response from AI)";
        }
    }

    console.log(`\n─── [LOG] 4. Parsed Text ───`);
    console.log(`"${text.substring(0, 100)}..."`); // Log first 100 chars

    clearTimeout(timeout);

    console.log(`[API] Response Time: ${Date.now() - startTime}ms`);

    return res.json({ reply: text });

  } catch (error) {
    clearTimeout(timeout);
    console.log(`\n─── [LOG] 5. Error Status Code/Details ───`);
    console.error("❌ Gemini API Error:", error);

    // H. SPECIFIC ERROR HANDLING
    const errorMessage = error.message || "";
    
    // Check for 429 Quota Exceeded
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("too many requests")) {
        console.warn("⚠️ Detected 429 / Quota Error");
        return res.status(429).json({ 
            error: "I'm experiencing high traffic right now. Please try again in a moment." 
        });
    }

    // Generic Server Error for everything else
    // Return actual error in dev, generic in prod if preferred. 
    // User asked to return "actual Gemini response or a clear technical error"
    return res.status(500).json({ 
      error: `AI Service Error: ${errorMessage}`,
      details: "Check server logs for full raw response."
    });
  }
});

// Handle GET requests (Health check)
app.get('/api/chat', (req, res) => {
  res.send('Gemini Chat API is Ready. Use POST to interact.');
});

// Root Health Check
app.get('/', (req, res) => {
  res.status(200).send('✅ AI Backend Online');
});

// Start Server
app.listen(port, () => {
  console.log(`\n──────────────────────────────────────────`);
  console.log(`✅ Server running on port ${port}`);
  console.log(`👉 Health Check: http://localhost:${port}/`);
  console.log(`👉 Chat Endpoint: http://localhost:${port}/api/chat`);
  console.log(`──────────────────────────────────────────\n`);
});