'use client'

import { Box, Button, Stack, TextField, ThemeProvider, createTheme, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Zizi, an international student's support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHeading, setShowHeading] = useState(true); // New state to track heading visibility

  const chatEndRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages
    setIsLoading(true);

    // Hide the heading after the first message is sent
    if (showHeading) {
      setShowHeading(false);
    }

    // Add the user's message to the chat
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
    ]);
    setMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok. Try again');
      }

      const data = await response.json(); // Parse the JSON response

      // Add the AI's response to the chat
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: data.content }, // Assuming `data.content` contains the AI's response
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Create a custom theme
  const theme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: '#cfcbca',
            borderRadius: '4px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: 'green',
            '&:hover': {
              backgroundColor: 'darkgreen',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        bgcolor={"#34ebe8"}
        alignItems="center"
        overflow="hidden" // Prevent scrolling on the entire page
        position="relative"
      >
        {/* Conditionally render the heading */}
        {showHeading && (
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              fontSize: '45px',
              position: 'fixed',
              top: '20px',
              zIndex: 1, // Ensure it's on top of other elements
            }}
          >
            International Students Helper ChatBot 🤖
          </Typography>
        )}

        {/* Chatbox */}
        <Stack
          direction={'column'}
          width="500px"
          height="700px"
          border="1px solid black"
          bgcolor={'black'}
          p={2}
          spacing={3}
          marginTop="100px" // Space for the fixed heading
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto" // Allow scrolling inside the chat box only
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color={'white'}
                  borderRadius={12}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            {/* Add a reference to the bottom of the chat */}
            <div ref={chatEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
