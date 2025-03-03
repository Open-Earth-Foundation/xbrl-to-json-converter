
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { getUserId } from "../utils/user";
import { Send } from "lucide-react";

const WEBSOCKET_URL =
  globalThis?.config?.BACKEND_WS_ORIGIN ||
  import.meta.env.VITE_WEBSOCKET_URL ||
  "ws://localhost:8000";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("disconnected");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    const userId = getUserId();
    const wsUrl = `${WEBSOCKET_URL}/ws/${userId}`;

    console.log("Connecting to WebSocket:", wsUrl);
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setStatus("connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: data.content },
        ]);
        setIsLoading(false);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setStatus("disconnected");
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeout.current = window.setTimeout(() => {
        console.log("Attempting to reconnect...");
        connectWebSocket();
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.log("WebSocket error:", error);
    };
  };

  const sendMessage = () => {
    if (!message.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const newMessage = { role: "user", content: message };
    setMessages([...messages, newMessage]);
    setIsLoading(true);
    setMessage("");

    ws.current.send(JSON.stringify({
      type: "message",
      content: message,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[calc(100vh-250px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={status !== "connected"}
          />
          <Button 
            onClick={sendMessage} 
            disabled={status !== "connected" || !message.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {status === "connected"
            ? "Connected to chat server"
            : "Connecting to chat server..."}
        </div>
      </div>
    </div>
  );
}
