require("dotenv").config();

console.log("KEY START:", process.env.GEMINI_API_KEY?.slice(0, 15));
console.log("KEY END:", process.env.GEMINI_API_KEY?.slice(-10));

const { GoogleGenAI } = require("@google/genai");

async function run() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: "Say hello",
});


    console.log(response.text);
  } catch (err) {
    console.error(err);
  }
}

run();