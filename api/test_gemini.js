const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Checking API Key...");
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env file.");
    return;
  }
  console.log("Key found (length: " + apiKey.length + ")");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("✅ Success! Response:", text);

    // console.log("Listing models via REST...");
    // const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const fetch = require('node-fetch'); // Check if node-fetch is available, or use built-in fetch in Node 18+
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
    } catch (e) {
        // If node-fetch is missing, try built-in fetch
        try {
            const response = await global.fetch(url);
             const data = await response.json();
            if (data.models) {
                console.log("Available models:");
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("No models found or error:", JSON.stringify(data));
            }
        } catch (e2) {
             console.error("Fetch failed:", e2);
        }
    }

    // console.log("Listing models...");
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // console.log("Testing fallback model 'gemini-pro'...");
    // const result = await model.generateContent("Hello");
    // console.log("✅ Success with gemini-pro! Response:", await result.response.text());
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
        console.error("Response details:", JSON.stringify(error.response, null, 2));
    }
  }
}

testGemini();
