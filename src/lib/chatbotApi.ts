// Chatbot API service for React frontend
const API_BASE_URL = "http://localhost:5000/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  timestamp?: string;
  error?: string;
}

export interface MemoryResponse {
  success: boolean;
  memory: string;
  error?: string;
}

class ChatbotApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.makeRequest("/health");
  }

  // Doctor chatbot
  async doctorChat(
    message: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>("/doctor/chat", {
      method: "POST",
      body: JSON.stringify({message, history}),
    });
  }

  // Patient chatbot
  async patientChat(
    message: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>("/patient/chat", {
      method: "POST",
      body: JSON.stringify({message, history}),
    });
  }

  // User chatbot
  async userChat(
    message: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>("/user/chat", {
      method: "POST",
      body: JSON.stringify({message, history}),
    });
  }

  // Doctor memory
  async getDoctorMemory(): Promise<MemoryResponse> {
    return this.makeRequest<MemoryResponse>("/doctor/memory");
  }

  // Clear doctor memory
  async clearDoctorMemory(): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    return this.makeRequest("/doctor/clear-memory", {
      method: "POST",
    });
  }
}

export const chatbotApi = new ChatbotApiService();
