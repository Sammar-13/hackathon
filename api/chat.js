const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const path = require("path");

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Loads the book's content from the 'docs' directory.
 * In a Vercel environment, files included in the deployment are placed relative
 * to the API function's location. We construct the path to account for this.
 */
async function loadBookContent() {
  // Correctly locate the 'docs' directory within the Vercel deployment structure.
  const docsPath = path.resolve(process.cwd(), "robotics-book-frontend/docs");
  console.log(`Attempting to load book content from: ${docsPath}`);

  try {
    const files = await fs.readdir(docsPath);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));

    if (markdownFiles.length === 0) {
      console.warn("No markdown files found in the docs directory.");
      return "";
    }

    let content = "";
    for (const file of markdownFiles) {
      const filePath = path.join(docsPath, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      content += fileContent + "\n\n---\n\n";
    }
    console.log(`Successfully loaded ${markdownFiles.length} markdown files.`);
    return content;
  } catch (error) {
    console.error(`[FATAL] Error loading book content from ${docsPath}:`, error);
    // This is a critical error, so we throw to stop execution.
    throw new Error("Could not load book content. Check server logs for details.");
  }
}

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

    const bookContext = await loadBookContent();

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