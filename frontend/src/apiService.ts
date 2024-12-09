import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json", // Ensure JSON requests/responses
  },
});

// Fetch server status function (testing the /success endpoint)
export const fetchServerStatus = async () => {
  try {
    const response = await apiClient.get("/success");
    return response.data; // Expected: { status: "success", message: "The server is running properly!" }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Failed to fetch server status.");
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};
