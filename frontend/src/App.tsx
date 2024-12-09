import React, { useState } from "react";
import "./styles.css";
import { fetchServerStatus } from "./apiService";

interface Message {
  role: "user" | "bot";
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add the user's message to the chat
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    try {
      // Fetch server status from the /success endpoint
      const response = await fetchServerStatus();
      
      // Add the server's response to the chat
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: response.message }, // Display server message
      ]);
    } catch (error) {
      console.error("Error fetching server status:", error);

      // Add an error message to the chat if fetching the server status fails
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Error: Could not fetch server status." },
      ]);
    }

    // Clear the input field
    setInput("");
  };

  return (
    <div className="chat-app">
      <div className="chat-header">omni</div>

      {/* Chat Functionality */}
      <div className="chat-container">
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.role === "user" ? "user" : "bot"}`}
            >
              {msg.role === "bot" ? (
                <pre>{msg.content}</pre>
              ) : (
                msg.content
              )}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
