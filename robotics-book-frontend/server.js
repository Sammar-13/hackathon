const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3001;

// 1. CORS CONFIGURATION (Strict but allows localhost)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// 2. BODY PARSING
app.use(express.json());

// 3. LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. ROOT ROUTE (Health Check)
app.get('/', (req, res) => {
  res.send('AI Backend Online');
});

// 5. CHAT ROUTE
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fallback if no API key (allows testing connectivity without crashing)
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is missing.");
      return res.json({
        reply: "Backend connected successfully! (Warning: GEMINI_API_KEY is missing in .env, so this is a placeholder response.)"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are the official AI Teaching Assistant for the book 'Physical AI & Humanoid Robotics'.
    Keep answers technical, concise, and related to ROS 2, Gazebo, Isaac Sim, and Transformers.`;

    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}\n\nAssistant:`);
    const response = await result.response;
    const text = response.text();

    return res.json({ reply: text });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({
      error: "Failed to generate response", 
      details: error.message 
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`✅ Chat endpoint ready at http://localhost:${PORT}/api/chat`);
});