import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "./ui/card";
import LoadingDots from "./LoadingDots";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EnhancedContextToggle from './EnhancedContextToggle';

interface Message {
  text: string;
  isUser: boolean;
}

const WS_ORIGIN = globalThis.config?.BACKEND_WS_ORIGIN || 'ws://localhost:8000';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContext, setEnhancedContext] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const websocket = new WebSocket(`${WS_ORIGIN}/ws/chat?user_id=${userId}`);

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    websocket.onmessage = (event) => {
      setIsLoading(false);
      const message = event.data;
      if (message.startsWith('[USER_ID]:')) {
        localStorage.setItem('userId', message.split(':')[1].trim());
      } else {
        setMessages(prev => [...prev, { text: message, isUser: false }]);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ws) return;

    setIsLoading(true);
    ws.send(input);
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Chat</h2>
        <EnhancedContextToggle
          isEnabled={enhancedContext}
          onToggle={(enabled) => setEnhancedContext(enabled)}
        />
        <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${inline ? 'bg-opacity-20 bg-gray-500 rounded px-1' :
                          'block bg-opacity-10 bg-gray-500 p-2 rounded-lg my-2'}`}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  // Style links
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  // Style lists
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-4 my-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal ml-4 my-2" {...props} />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && <LoadingDots />}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </CardContent>
    </Card>
  );
}