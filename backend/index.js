import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Setup Express app
const app = express();
const port = process.env.PORT || 3001;

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// API endpoint with debugging
app.post("/api/generate", async (req, res) => {
  console.log("🔥 API endpoint hit:", req.body);
  try {
    const { prompt } = req.body;
    if (!prompt) {
      console.log("❌ No prompt provided");
      return res.status(400).json({ error: "Prompt is required" });
    }
    console.log("📝 Generating response for prompt:", prompt.substring(0, 100));
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("✅ Response generated successfully");
    res.json({ response: text });
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

// Serve frontend (React/Vite) in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔑 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
  console.log(`📁 Frontend path: ${process.env.NODE_ENV === 'production' ? path.join(__dirname, '../frontend/dist') : 'Development mode'}`);
});
