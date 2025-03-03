import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getUserId } from '../utils/user';
import { Send } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

export default function Chat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; }[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const userId = getUserId();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!userId) return;

    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/${userId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'thinking') {
          setIsTyping(true);
        } else if (data.type === 'message') {
          setIsTyping(false);
          setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    websocketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [userId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim() || !isConnected) return;

    const newMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, newMessage]);

    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ type: 'message', content: input }));
    }

    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Chat</h2>

        <div 
          ref={messagesContainerRef}
          className="h-[400px] overflow-y-auto mb-4 bg-gray-50 rounded-lg p-3 space-y-3"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Upload or select a corporate filing to start chatting</p>
              <p className="text-sm mt-2">Ask questions about the ESRS filing to get insights</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-100 ml-auto' 
                  : 'bg-white border shadow-sm'
              }`}
            >
              {message.content.split('\n').map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          ))}

          {isTyping && (
            <div className="p-3 rounded-lg max-w-[80%] bg-white border shadow-sm">
              <p className="text-gray-500">Thinking...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the filing..."
            disabled={!isConnected}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!isConnected || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {!isConnected && (
          <p className="text-red-500 text-sm mt-2">
            Not connected. Please try refreshing the page.
          </p>
        )}
      </CardContent>
    </Card>
  );
}