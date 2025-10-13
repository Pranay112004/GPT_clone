import { useState, useEffect } from "react";
import "./App.css";
import gptLogo from "./assets/chatgpt.svg";
import addBtn from "./assets/add-30.png";
import msgIcon from "./assets/message.svg";
import sendBtn from "./assets/send.svg";
import userIcon from "./assets/IMG_3301.jpg";
import gptImgLogo from "./assets/chatgptLogo.svg";
import { generateResponse } from "./config/generateResponse.js";

/* 🔐 Escape HTML for security */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (tag) => {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return chars[tag] || tag;
  });
}

/* 🧠 Format GPT response to support code blocks and line breaks */
function formatGPTText(text) {
  return text
    .replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang}">${escapeHtml(
        code
      )}</code></pre>`;
    })
    .replace(/\n/g, "<br>");
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    const userChat = { user: true, text: prompt };
    setChats((prev) => [...prev, userChat]);
    setPrompt("");
    setIsLoading(true);

    try {
      const text = await generateResponse(prompt);
      const botChat = { user: false, text: text || "No response received." };
      setChats((prev) => [...prev, botChat]);
    } catch (error) {
      console.error("Failed to generate response:", error);
      let errorMessage =
        "Sorry, I couldn't generate a response. Please try again.";

      if (error.message.includes("API key")) {
        errorMessage = "API key not configured. Please check your .env file.";
      } else if (
        error.message.includes("quota") ||
        error.message.includes("limit")
      ) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      const errorChat = { user: false, text: errorMessage };
      setChats((prev) => [...prev, errorChat]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setChats([]);
    setPrompt("");
  };

  const handleQueryClick = (query) => {
    setPrompt(query);
    setIsSidebarOpen(false); // Close sidebar on mobile after selecting query
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Auto-scroll to bottom when chats update
  useEffect(() => {
    const chatContainer = document.querySelector(".chats");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chats, isLoading]);

  return (
    <div className="app">
      {/* Mobile Hamburger Menu */}
      <button className="toggle-sidebar" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={gptLogo} alt="GPT Logo" className="logo" />
            <span className="brand">Chat BOT</span>
          </div>

          <button className="midBtn" onClick={handleNewChat}>
            <img src={addBtn} alt="New Chat" className="addBtn" />
            New Chat
          </button>

          <div className="upperSideBottom">
            <button
              className="query"
              onClick={() => handleQueryClick("What is React?")}
            >
              <img src={msgIcon} alt="React" />
              What is React?
            </button>
            <button
              className="query"
              onClick={() => handleQueryClick("What is a clone?")}
            >
              <img src={msgIcon} alt="Clone" />
              What is clone?
            </button>
          </div>
        </div>
        <div className="lowerSide"></div>
      </div>

      {/* Main Section */}
      <div className="main">
        <div className="chats">
          {chats.length === 0 && !isLoading && (
            <div className="welcome">
              <h2>Welcome User </h2>
              <p>Start a conversation by typing a message below ..</p>
            </div>
          )}

          {chats.map((chat, index) => (
            <div key={index} className={`chat ${chat.user ? "" : "bot"}`}>
              <img
                src={chat.user ? userIcon : gptImgLogo}
                alt={chat.user ? "User" : "GPT"}
              />
              {chat.user ? (
                <p className="txt">{chat.text}</p>
              ) : (
                <div
                  className="txt"
                  dangerouslySetInnerHTML={{ __html: formatGPTText(chat.text) }}
                ></div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="chat bot">
           <img src={gptImgLogo} alt="GPT" /> 
              <p className="txt">Thinking...</p>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="chatFooter">
          <div className="inp">
            <input
              type="text"
              aria-label="Send a message"
              placeholder="Send a message ..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send" onClick={handleSend} aria-label="Send">
              <img src={sendBtn} alt="Send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
