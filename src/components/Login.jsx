import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Typography, Box, Container, CssBaseline, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a light theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Classic blue for primary color
    },
    background: {
      default: "#f5f5f5", // Light gray background
      paper: "#ffffff", // White for paper
    },
    text: {
      primary: "#333333", // Dark gray for text
      secondary: "#666666", // Lighter gray for secondary text
    },
  },
});

const Login = ({ setUserId }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUserId(userCredential.user.uid); // Set the authenticated user's ID
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Cover the entire screen height
          backgroundColor: "background.default", // Light gray background
          padding: 2, // Add padding for smaller screens
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 3, sm: 4, md: 5 }, // Responsive padding
            width: "100%",
            maxWidth: "450px", // Wider form for better readability
            borderRadius: "12px", // Rounded corners
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "text.primary" }}>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3, color: "text.secondary" }}>
            Sign in to continue
          </Typography>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            onClick={handleLogin}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none", // Disable uppercase transformation
            }}
          >
            Login
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Login;