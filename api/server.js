const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log(`[API] POST /api/chat received`);

  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
    return res.status(500).json({ 
      error: 'Service configuration error. Please contact the administrator.' 
    });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    console.log("[API] Sending prompt to Gemini...");
    const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}\n\nAnswer:`);
    const response = await result.response;
    const text = response.text();

    console.log("[API] Gemini Response:", text);
    return res.json({ reply: text });

  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    
    const fallbackMessage = "I'm experiencing high traffic right now and couldn't process that request. However, you can read about ROS 2 and Simulation in Chapters 2 and 3 of the book!";
    return res.json({ reply: fallbackMessage });
  }
});

// Handle GET requests to /api/chat (Common user error)
app.get('/api/chat', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed. Use POST to interact with the chat.' });
});

// Health Check
app.get('/', (req, res) => {
  res.send('AI Chat Backend is running. Use POST /api/chat to interact.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`\n🚀 AI Chat Backend running at http://localhost:${port}`);
  console.log(`👉 Endpoint: http://localhost:${port}/api/chat`);
});

