const API_BASE_URL =
  globalThis?.config?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export const api = {
    upload: async (file: File, userId: string) => {  // <-- CHANGED
      const formData = new FormData();
      formData.append("file", file);
      formData.append("websocket_user_id", userId); // <-- ADDED
  
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      return response.json();
    },

  chat: async (message: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, user_id: userId }),
    });
    return response.json();
  },
};
