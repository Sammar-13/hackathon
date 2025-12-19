const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- MAIN API HANDLER ---

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // --- Main Logic ---
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[FATAL] GEMINI_API_KEY environment variable is not set.");
      // Do not expose detailed error to client
      return res.status(500).json({ error: "Internal server configuration error." });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Bad Request: 'message' is required." });
    }

    const bookContext = `The book 'Physical AI & Humanoid Robotics' teaches how to build production-ready autonomous systems. It covers ROS 2, Simulation, and AI. The book has 6 chapters:
- Chapter 1: Introduction to Physical AI (Fundamentals, History, Applications).
- Chapter 2: ROS 2 Fundamentals (Nodes, Topics, Services, Actions).
- Chapter 3: Gazebo Simulation (URDF, Physics, Sensors, Integration).
- Chapter 4: NVIDIA Isaac Platform (Isaac Sim, Perception, Navigation, Manipulation).
- Chapter 5: Vision-Language-Action Models (VLA Architecture, Training, Deployment).
- Chapter 6: Capstone Project (End-to-End System Integration).
The course teaches designing ROS 2 software, creating simulations, integrating AI models, and building autonomous systems.`;

    const systemPrompt = `You are an expert AI teaching assistant for the book 'Physical AI & Humanoid Robotics'.
You answer strictly from the provided documentation context.
The documentation content is provided below.
If the answer is not found in the documentation, you MUST reply with the exact phrase: "This topic is not covered in the current documentation."
Do not under any circumstance invent content or answer questions outside the scope of the provided text. Your responses should be professional, structured, and concise.`;

    // Corrected model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `${systemPrompt}\n\n--- DOCUMENTATION CONTEXT ---\n\n${bookContext}\n\n--- USER QUESTION ---\n\nUser: "${message}"\n\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Return the response with the correct "reply" key
    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Error in /api/chat handler:", error);
    // Return a generic server error
    return res.status(500).json({ error: "An unexpected error occurred on the server." });
  }
};