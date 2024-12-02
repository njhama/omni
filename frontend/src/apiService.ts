import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // Replace with your backend URL

export const fetchAgentResponses = async (query: string) => {
  const response = await axios.post(`${API_BASE_URL}/agents/chat`, { query });
  return response.data.responses; // Backend should return responses in this format
};
