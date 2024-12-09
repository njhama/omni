import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:8000";

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json", // Ensure JSON requests/responses
  },
});

// Fetch RAG results function
export const fetchRAGResults = async (query: string, k: number = 3) => {
  try {
    // Make POST request
    const response = await apiClient.post("/retrieve", { query, k });
    console.log("API Response:", response.data); // Debugging API response
    return response.data; // Expected to be an object with "results" array
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Handle server-side errors
        console.error("Server Error:", err.response.data);
        console.error("Status Code:", err.response.status);
        throw new Error(err.response.data?.message || "Server error occurred.");
      } else if (err.request) {
        // Handle no response received
        console.error("No Response Received:", err.request);
        throw new Error("No response received from the server.");
      } else {
        // Handle request setup errors
        console.error("Error in Request Setup:", err.message);
        throw new Error(err.message || "Request setup error occurred.");
      }
    } else {
      // Handle unexpected errors
      console.error("Unexpected Error:", err);
      throw new Error("An unexpected error occurred.");
    }
  }
};
