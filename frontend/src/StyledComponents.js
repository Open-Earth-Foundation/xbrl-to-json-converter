// Define styled components

import styled from 'styled-components';

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
  background-color: ${(props) => props.theme.bodyBg};
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
