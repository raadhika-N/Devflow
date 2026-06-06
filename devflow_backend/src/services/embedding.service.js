const { pipeline } = require("@xenova/transformers");

let extractor = null;

const getExtractor = async () => {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractor;
};

const generateEmbedding = async (text) => {
  try {
    const cleanText = text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);

    const model = await getExtractor();

    const output = await model(cleanText, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
};

module.exports = { generateEmbedding };