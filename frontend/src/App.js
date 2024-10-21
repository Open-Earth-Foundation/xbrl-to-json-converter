// src/App.js

import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import GlobalStyles from './GlobalStyles';
import { lightTheme, darkTheme } from './themes';

function App() {
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatWindowRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [theme, setTheme] = useState('light');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [jsonData, setJsonData] = useState(null); // New state variable


  // Handle file upload

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.fileInput;
    const file = fileInput.files[0];
  
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
  
      if (response.ok) {
        const result = await response.json();
        setFileUploaded(true);
        setUserId(result.user_id);
        setJsonData(result.json_data); // Store the JSON data in state
  
        // Remove this line to prevent the download
        // saveJsonToFile(result.json_data, 'converted_data.json');
  
      } else {
        const errorResult = await response.json();
        alert(`Error: ${errorResult.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`An error occurred during file upload: ${error.message}`);
    }
  };

  // Function to save JSON data to a file on the frontend
  const saveJsonToFile = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger a download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  };
  // Establish WebSocket connection after file upload
  useEffect(() => {
    if (fileUploaded && userId) {
      const ws = new WebSocket(`ws://localhost:8000/ws/chat?user_id=${userId}`);
      setSocket(ws);

      ws.onopen = () => {
        console.log('Connected to the server');
      };

      ws.onmessage = (event) => {
        const data = event.data;

        if (data === '[STREAM_END]') {
          // Mark the last bot message as complete
          setChatMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.sender === 'bot' && !msg.complete ? { ...msg, complete: true } : msg
            )
          );
          setIsStreaming(false);
        } else {
          // Append the received message chunk
          setChatMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'bot' && !lastMessage.complete) {
              // Update the last bot message
              const updatedMessage = {
                ...lastMessage,
                message: lastMessage.message + data,
              };
              return [...prevMessages.slice(0, -1), updatedMessage];
            } else {
              // Add new bot message
              return [...prevMessages, { sender: 'bot', message: data, complete: false }];
            }
          });
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from the server');
      };

      return () => {
        ws.close();
      };
    }
  }, [fileUploaded, userId]);

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
      setIsStreaming(true);
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
          // File upload form
          <UploadForm onSubmit={handleFileUpload}>
            <Title>Upload Your Document</Title>
            <FileInput type="file" name="fileInput" accept=".xbrl, .xml, .zip" />
            <UploadButton type="submit">Upload</UploadButton>
          </UploadForm>
        ) : (
          // Chat interface
          <>
            <Header>
              <Title>Chatbot Assistant</Title>
              <ThemeToggle onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </ThemeToggle>
            </Header>
            <ChatWindow ref={chatWindowRef}>
              {chatMessages.map((msg, index) => (
                <MessageBubble key={index} sender={msg.sender}>
                  {msg.message}
                </MessageBubble>
              ))}
              {isStreaming && <TypingIndicator>Chatbot is typing...</TypingIndicator>}
            </ChatWindow>
            <Form onSubmit={handleSendMessage}>
              <Input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isStreaming}
              />
              <SendButton type="submit" disabled={isStreaming}>
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

// Styled Components

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.header`
  background-color: ${(props) => props.theme.headerBg};
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  margin: 0;
  color: ${(props) => props.theme.textColor};
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${(props) => props.theme.textColor};
`;

const ChatWindow = styled.div`
  flex-grow: 1;
  background-color: ${(props) => props.theme.chatBg};
  padding: 20px;
  overflow-y: auto;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  margin-bottom: 15px;
  align-self: ${(props) => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${(props) =>
    props.sender === 'user' ? props.theme.userMessageBg : props.theme.botMessageBg};
  color: ${(props) => props.theme.textColor};
  padding: 10px 15px;
  border-radius: 15px;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    ${(props) => (props.sender === 'user' ? 'right: -10px;' : 'left: -10px;')}
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top-color: ${(props) =>
      props.sender === 'user' ? props.theme.userMessageBg : props.theme.botMessageBg};
    border-bottom: 0;
    margin-top: -5px;
  }
`;

const TypingIndicator = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 10px;
`;

const Form = styled.form`
  display: flex;
  padding: 10px;
  background-color: ${(props) => props.theme.headerBg};
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 15px;
  font-size: 16px;
  border-radius: 25px;
  border: none;
  outline: none;
  background-color: ${(props) => props.theme.inputBg};
  color: ${(props) => props.theme.textColor};
`;

const SendButton = styled.button`
  padding: 0 20px;
  font-size: 16px;
  margin-left: 10px;
  border-radius: 25px;
  border: none;
  background-color: ${(props) => props.theme.buttonBg};
  color: #fff;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// Styled components for the file upload form
const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const FileInput = styled.input`
  margin: 20px 0;
`;

const UploadButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: ${(props) => props.theme.buttonBg};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;
