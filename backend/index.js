import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
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

// Initialize OpenAI
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing in .env");
  process.exit(1);
}
const openai = new OpenAI({
  apiKey: API_KEY,
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// API endpoint with debugging and retry logic
app.post("/api/generate", async (req, res) => {
  console.log("🔥 API endpoint hit:", req.body);
  try {
    const { prompt } = req.body;
    if (!prompt) {
      console.log("❌ No prompt provided");
      return res.status(400).json({ error: "Prompt is required" });
    }
    console.log("📝 Generating response for prompt:", prompt.substring(0, 100));
    
    // Retry logic for OpenAI API
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/3`);
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant. Provide clear, concise, and helpful responses."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });
        
        const text = completion.choices[0]?.message?.content;
        if (!text) {
          throw new Error("No response content received");
        }
        
        console.log("✅ Response generated successfully");
        return res.json({ response: text });
      } catch (err) {
        lastError = err;
        console.log(`❌ Attempt ${attempt} failed:`, err.message);
        
        if (err.status === 429 || err.message.includes('rate limit')) {
          console.log(`⏳ Rate limited, waiting 3 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        if (err.status >= 500 || err.message.includes('server error')) {
          console.log(`⏳ Server error, waiting 2 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // For non-retryable errors (like invalid API key), break immediately
        break;
      }
    }
    
    // All retries failed
    console.error("❌ All retry attempts failed:", lastError.message);
    
    // Provide user-friendly error messages
    let errorMessage = "Sorry, I couldn't generate a response. Please try again.";
    if (lastError.status === 429 || lastError.message.includes('rate limit')) {
      errorMessage = "Rate limit exceeded. Please try again in a moment.";
    } else if (lastError.status === 401 || lastError.message.includes('API key')) {
      errorMessage = "API key is invalid or missing. Please check your configuration.";
    } else if (lastError.status === 403) {
      errorMessage = "Access denied. Please check your API key permissions.";
    } else if (lastError.message.includes('quota') || lastError.message.includes('billing')) {
      errorMessage = "API usage limit or billing issue. Please check your OpenAI account.";
    } else if (lastError.status >= 500) {
      errorMessage = "OpenAI service is temporarily unavailable. Please try again later.";
    }
    
    res.status(500).json({ error: errorMessage });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
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
  console.log(`🤖 AI Provider: OpenAI (GPT-3.5-turbo)`);
  console.log(`🔑 OpenAI API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
  console.log(`📁 Frontend path: ${process.env.NODE_ENV === 'production' ? path.join(__dirname, '../frontend/dist') : 'Development mode'}`);
});
