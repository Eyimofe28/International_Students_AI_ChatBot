{/* Conditionally render the heading */}
{showHeading && (
    <Box alignItems={"center"} bgcolor={"#34ebe8"}>
      <Typography
        variant="h1"
        sx={{
          color: 'white',
          fontSize: '45px',
          position: 'fixed',
          top: '20px',
          // zIndex: 1, // Ensure it's on top of other elements
        }}
      >
        International Students Helper ChatBot 🤖
      </Typography>
    </Box>
    )}