// src/App.js

import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import GlobalStyles from './GlobalStyles';
import remarkGfm from 'remark-gfm';
import { lightTheme, darkTheme } from './themes';
import {
  Container,
  Header,
  Title,
  ThemeToggle,
  ChatWindow,
  MessageBubble,
  TypingIndicator,
  Form,
  Input,
  SendButton,
  UploadForm,
  FileInput,
  ButtonContainer,
  UploadButton,
  SkipButton,
  StatusMessage,
} from './StyledComponents';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatWindowRef = useRef(null);
  const [theme, setTheme] = useState('light');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [conversionInProgress, setConversionInProgress] = useState(false);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Read environment variables (fallback to localhost if missing)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/chat';

  // Establish WebSocket connection on component mount
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to the server');
      setWebsocketConnected(true);
    };

    ws.onmessage = (event) => {
      const data = event.data;

      if (data.startsWith('[USER_ID]:')) {
        const newUserId = data.replace('[USER_ID]:', '').trim();
        setUserId(newUserId);
      } else if (data.startsWith('[STATUS_UPDATE]:')) {
        const statusMessage = data.replace('[STATUS_UPDATE]:', '').trim();
        if (statusMessage === 'Conversion started.') {
          setConversionInProgress(true);
        } else if (statusMessage === 'Conversion completed.') {
          setConversionInProgress(false);
          alert('File conversion completed. You can now start chatting.');
        } else if (statusMessage.startsWith('Error during conversion:')) {
          setConversionInProgress(false);
          alert(statusMessage);
        }
      } else {
        // Add the bot's full message to chat messages
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', message: data, complete: true },
        ]);

        // Set isTyping to false
        setIsTyping(false);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from the server');
      setWebsocketConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [WS_URL]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.fileInput;
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!userId) {
      alert('WebSocket connection not established. Please wait and try again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the environment variable for your upload endpoint
      const response = await fetch(`${API_URL}/upload?user_id=${userId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setFileUploaded(true);
      } else {
        const errorResult = await response.json();
        alert(`Error: ${errorResult.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`An error occurred during file upload: ${error.message}`);
    }
  };

  // Handle skipping upload
  const handleSkipUpload = () => {
    if (!websocketConnected) {
      alert('WebSocket connection not established. Please wait and try again.');
      return;
    }
    setFileUploaded(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (userMessage.trim() !== '' && socket && socket.readyState === WebSocket.OPEN) {
      // Send the user's message to the backend
      socket.send(userMessage);

      // Add user's message to chat messages
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', message: userMessage, complete: true },
      ]);

      // Reset input field
      setUserMessage('');

      // Set isTyping to true
      setIsTyping(true);
    }
  };

  // Scroll to the bottom when messages update
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <Container>
        {!fileUploaded ? (
          <UploadForm onSubmit={handleFileUpload}>
            <Title>Upload Your Document</Title>
            <FileInput type="file" name="fileInput" accept=".xbrl, .xml, .zip" />
            <ButtonContainer>
              <UploadButton type="submit">Upload</UploadButton>
              <SkipButton type="button" onClick={handleSkipUpload}>
                Skip Upload
              </SkipButton>
            </ButtonContainer>
          </UploadForm>
        ) : (
          <>
            <Header>
              <Title>Chatbot Assistant</Title>
              <ThemeToggle onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </ThemeToggle>
            </Header>
            {conversionInProgress && (
              <StatusMessage>Conversion in progress. Please wait...</StatusMessage>
            )}
            <ChatWindow ref={chatWindowRef}>
              {chatMessages.map((msg, index) => (
                <MessageBubble key={index} sender={msg.sender}>
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.message}
                    </ReactMarkdown>
                  ) : (
                    msg.message
                  )}
                </MessageBubble>
              ))}
              {isTyping && <TypingIndicator>Chatbot is typing...</TypingIndicator>}
            </ChatWindow>
            <Form onSubmit={handleSendMessage}>
              <Input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={conversionInProgress || !websocketConnected}
              />
              <SendButton
                type="submit"
                disabled={conversionInProgress || !websocketConnected}
              >
                Send
              </SendButton>
            </Form>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
