require("dotenv").config();

console.log("KEY:", process.env.GEMINI_API_KEY);

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello in one sentence.",
    });

    console.log("\nSUCCESS:");
    console.log(response.text);
  } catch (error) {
    console.error("\nERROR:");
    console.error(error);
  }
}

test();