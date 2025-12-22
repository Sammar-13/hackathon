const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.log("Missing API Key");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent("Hello");
    console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}

testGemini();