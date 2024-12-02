import React, { useState } from "react";
import "./styles.css";
import { fetchAgentResponses } from "./apiService";

interface Message {
  role: "user" | "agent" | "system";
  content: string;
  agentName?: string;
}

interface AgentResponse {
  agentName: string;
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);

    try {
      const agentResponses: AgentResponse[] = await fetchAgentResponses(input);

      setMessages((prev) => [
        ...prev,
        ...agentResponses.map((response) => ({
          role: "agent",
          content: response.content,
          agentName: response.agentName,
        } as Message)), // Explicitly cast to Message
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "An error occurred while processing your request." },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">omni</div>

      {/* Chat Messages */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.role === "agent" && <strong>{msg.agentName}: </strong>}
            {msg.content}
          </div>
        ))}
        {loading && <div className="chat-message system">Processing...</div>}
      </div>

      {/* Chat Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
