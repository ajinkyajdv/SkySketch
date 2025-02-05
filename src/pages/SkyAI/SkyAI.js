import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./skyai.css"

const genAI = new GoogleGenerativeAI("AIzaSyAKgP7vVI5x8MDUjbdAA7ZNWBzajPEdSo0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const AIChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const normalizeText = (text) => {
    let normalizedText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') 
      .replace(/\n/g, '<br />');       

    return normalizedText.trim();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You ", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInput(""); // Clear input after sending

    try {
      const result = await model.generateContent(input);
      const aiMessage = { sender: "SkyAI ", text: normalizeText(result.response.text()) }; // Normalizing the AI response
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender.toLowerCase()}`}>
            <strong>{msg.sender}:</strong>
            <span dangerouslySetInnerHTML={{ __html: msg.text }} /> {/* Render HTML to handle <br /> */}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any question..."
          className="chat-input"
        />
        <button onClick={handleSend} className="send-btn">Send</button>
      </div>
    </div>
  );
};

export default AIChat;
