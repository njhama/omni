import React, { useState } from "react";
import "./styles.css";
import { fetchRAGResults } from "./apiService";

interface Message {
  role: "user" | "bot";
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    try {
      const response = await fetchRAGResults(input);
      const firstResult = response.results[0];
      
      if (firstResult) {
        const botResponse = `Solution:\n${firstResult.solution_code}`;
        setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "No results found." },
        ]);
      }
    } catch (error) {
      console.error("Error fetching RAG results:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Error fetching results." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chat-app">
      <div className="chat-header">coderRAG</div>

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
