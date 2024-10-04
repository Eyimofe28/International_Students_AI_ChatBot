'use client'

import { Box, Button, Stack, TextField, ThemeProvider, createTheme, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Zizi✨, an international student's support assistant. How can I help you today?",
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
    if (!message.trim()) return;
    setIsLoading(true);

    if (showHeading) {
      setShowHeading(false);
    }

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    await reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value, { stream: true });

      // Format the text here by replacing asterisks and ensuring new lines
      const formattedText = text
        .replace(/\*\*/g, '')  // Remove asterisks used for bold text
        .replace(/(\d\.)/g, '<br />$1');  // Ensure that numbered items are on new lines

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + formattedText },  // Append formatted text
        ];
      });
      return reader.read().then(processText);
    });
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
          // variant="h1"
          sx={{
            color: 'white',
            fontSize: {
              xs: '18px', // font size for small screens (mobile)
              sm: '45px', // font size for larger screens (tablet and up)
            },
            fontFamily: 'Mina',
            position: 'fixed',
            mt: '20px',
            // zIndex: 1, // Ensure it's on top of other elements
          }}
        >
          International Students Helper ChatBot 🤖
        </Typography>
      )}

      {/* Chatbox */}
        <Stack
          direction={'column'}
          width= {{xs:"95%", sm:"80%"}}  //width by screen
          height="90%"
          border="1px solid black"
          bgcolor={'black'}
          p={2}
          spacing={3}
          mt={10}
          mb={5}
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
                  // fontSize={{sx: "12px", sm: "25px"}}
                  sx={{ whiteSpace: 'pre-wrap' }}  // Ensure proper white space handling for line breaks
                >
                  {/*message.content*/}
                  <span dangerouslySetInnerHTML={{ __html: message.content }} />
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
            multiline // Allow multi-line input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default Enter behavior (new line)
                sendMessage(); // Send the message
              }
            }}
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
