// src/StyledComponents.js

import styled from 'styled-components';

export const Container = styled.div`
  max-width: 90%; /* Increase the maximum width */
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const Header = styled.header`
  background-color: ${(props) => props.theme.headerBg};
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${(props) => props.theme.textColor};
`;

export const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${(props) => props.theme.textColor};
`;

export const ChatWindow = styled.div`
  flex-grow: 1;
  background-color: ${(props) => props.theme.chatBg};
  padding: 20px;
  overflow-y: auto;
`;

export const MessageBubble = styled.div`
  max-width: 70%;
  margin-bottom: 15px;
  align-self: ${(props) => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${(props) =>
    props.sender === 'user' ? props.theme.userMessageBg : props.theme.botMessageBg};
  color: ${(props) => props.theme.textColor};
  padding: 10px 15px;
  border-radius: 15px;
  position: relative;
  word-wrap: break-word;

  & > * {
    margin: 0;
  }

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

export const TypingIndicator = styled.div`
  font-style: italic;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 10px;
`;

export const Form = styled.form`
  display: flex;
  padding: 10px;
  background-color: ${(props) => props.theme.headerBg};
`;

export const Input = styled.input`
  flex-grow: 1;
  padding: 15px;
  font-size: 16px;
  border-radius: 25px;
  border: none;
  outline: none;
  background-color: ${(props) => props.theme.inputBg};
  color: ${(props) => props.theme.textColor};
`;

export const SendButton = styled.button`
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
export const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const FileInput = styled.input`
  margin: 20px 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const UploadButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: ${(props) => props.theme.buttonBg};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

export const SkipButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #888;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

export const StatusMessage = styled.div`
  padding: 10px;
  background-color: ${(props) => props.theme.headerBg};
  color: ${(props) => props.theme.textColor};
  text-align: center;
`;
