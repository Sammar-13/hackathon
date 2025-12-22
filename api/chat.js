const { GoogleGenerativeAI } = require("@google/generative-ai");

// Allow CORS for the frontend
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  console.log(`[API] ${req.method} /api/chat received`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. ENV SETUP & SECURITY
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
    // Return a generic error to client, log specific error on server
    return res.status(500).json({ 
      error: 'Service configuration error. Please contact the administrator.' 
    });
  } else {
    console.log("[API] GEMINI_API_KEY is present (masked: " + apiKey.substring(0, 4) + "...)");
  }

  const { message } = req.body;
  console.log("[API] Request body message:", message);

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    // 3. GEMINI CONFIG
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Context for the specific book domain
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

    console.log("[API] Gemini Raw Response:", JSON.stringify(response, null, 2));
    console.log("[API] Gemini Extracted Text:", text);

    return res.status(200).json({ reply: text });

  } catch (error) {
    // 4. ERROR HANDLING & FALLBACK
    // Log the error message but NOT the stack trace or env vars to avoid leaking secrets
    console.error("Gemini API Request Failed:", error);
    console.error("Stack Trace:", error.stack);

    // Return a safe fallback response so the chat UI doesn't break
    const fallbackMessage = "I'm experiencing high traffic right now and couldn't process that request. However, you can read about ROS 2 and Simulation in Chapters 2 and 3 of the book!";
    
    return res.status(200).json({ reply: fallbackMessage });
  }
};

module.exports = allowCors(handler);