// src/components/Login.jsx
import React, { useState } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Alert 
} from "@mui/material";
import { FcGoogle } from "react-icons/fc";

const Login = ({ setUserId, setUser, toggleAuthMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUserId(userCredential.user.uid);
      setUser(userCredential.user);
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      setUserId(userCredential.user.uid);
      setUser(userCredential.user);
    } catch (error) {
      setError("Google sign in failed. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    const auth = getAuth();
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent.");
      setError("");
    } catch (error) {
      setError("Error sending password reset email. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        sx={{
          padding: 4,
          width: "100%",
          maxWidth: "400px",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Welcome Back
        </Typography>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ backgroundColor: "#fff", borderRadius: 1 }}
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2, py: 1.5 }}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={handleGoogleLogin}
        >
          <FcGoogle size={24} style={{ marginRight: 8 }} />
          Login with Google
        </Button>
        <Button
          variant="text"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleResetPassword}
        >
          Forgot Password?
        </Button>
        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => toggleAuthMode("register")}
        >
          Don't have an account? Register
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
