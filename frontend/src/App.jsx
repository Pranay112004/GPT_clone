import { useState } from "react";
import "./App.css";
import gptLogo from "./assets/chatgpt.svg";
import addBtn from "./assets/add-30.png";
import msgIcon from "./assets/message.svg";
import sendBtn from "./assets/send.svg";
import userIcon from "./assets/IMG_3301.jpg";
import gptImgLogo from "./assets/chatgptLogo.svg";
import { generateResponse } from "./config/generateResponse.js";

function App() {
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt || isLoading) return;

    const userChat = { user: true, text: prompt };
    setChats((prev) => [...prev, userChat]);
    setPrompt("");
    setIsLoading(true);

    try {
      const text = await generateResponse(prompt);
      const botChat = { user: false, text };
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
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={gptLogo} alt="GPT Logo" className="logo" />
            <span className="brand">Chat GPT Clone</span>
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

      <div className="main">
        <div className="chats">
          {chats.length === 0 && !isLoading && (
            <div className="welcome">
              <h2>Welcome to Chat GPT Clone</h2>
              <p>
                Start a conversation by typing a message below or click on one
                of the suggested queries.
              </p>
            </div>
          )}
          {chats.map((chat, index) => (
            <div key={index} className={`chat ${chat.user ? "" : "bot"}`}>
              <img
                src={chat.user ? userIcon : gptImgLogo}
                alt={chat.user ? "User" : "GPT"}
              />
              <p className="txt">{chat.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="chat bot">
              <img src={gptImgLogo} alt="GPT" />
              <p className="txt">Thinking...</p>
            </div>
          )}
        </div>

        <div className="chatFooter">
          <div className="inp">
            <input
              type="text"
              placeholder="Send a message ..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send" onClick={handleSend}>
              <img src={sendBtn} alt="Send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
