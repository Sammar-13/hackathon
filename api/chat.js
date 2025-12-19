const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const path = require("path");

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- UTILITY FUNCTIONS ---

/**
 * Loads the content of the book from markdown files.
 * This function reads all .md files from the specified directory,
 * concatenates them, and returns a single string. This provides the
 * context for the AI.
 */
async function loadBookContent() {
  const docsPath = path.join(process.cwd(), "robotics-book-frontend", "docs");
  try {
    const files = await fs.readdir(docsPath);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));

    let content = "";
    for (const file of markdownFiles) {
      const filePath = path.join(docsPath, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      // Add a separator to distinguish between files
      content += fileContent + "\n\n---\n\n";
    }
    return content;
  } catch (error) {
    console.error("Error loading book content:", error);
    // Return empty string if content cannot be loaded, so the bot can at least respond.
    return "";
  }
}

// --- MAIN API HANDLER ---

module.exports = async (req, res) => {
  // 1. Set CORS headers to allow requests from the frontend
  res.setHeader("Access-Control-Allow-Origin", "*"); // In production, restrict this to your frontend's domain
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 2. Handle preflight OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3. Ensure this is a POST request
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 4. Check for API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    return res.status(500).json({ error: "Server configuration error: Missing API key." });
  }

  // 5. Extract user message from request body
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Bad Request: 'message' is required." });
  }

  try {
    // 6. Load the book's content to use as context
    const bookContext = await loadBookContent();

    // 7. Define the system prompt for the AI model
    // This is a critical instruction that tells the AI how to behave.
    const systemPrompt = `You are an expert AI teaching assistant for the book 'Physical AI & Humanoid Robotics'.
You answer strictly from the provided documentation context.
The documentation content is provided below.
If the answer is not found in the documentation, you MUST reply with the exact phrase: "This topic is not covered in the current documentation."
Do not under any circumstance invent content or answer questions outside the scope of the provided text. Your responses should be professional, structured, and concise.`;

    // 8. Select the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // 9. Construct the full prompt for the model
    const fullPrompt = `${systemPrompt}\n\n--- DOCUMENTATION CONTEXT ---\n\n${bookContext}\n\n--- USER QUESTION ---\n\nUser: "${message}"\n\nAssistant:`;

    // 10. Send the prompt to the model and get the response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // 11. Send the AI's answer back to the frontend
    return res.status(200).json({ answer: text });

  } catch (error) {
    console.error("Error generating content:", error);
    // Provide a generic error message to the user
    return res.status(500).json({ error: "An error occurred while processing your request." });
  }
};
