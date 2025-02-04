import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Typography, Box } from "@mui/material";

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
    <Box sx={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button onClick={handleLogin} variant="contained" color="primary" fullWidth>
        Login
      </Button>
    </Box>
  );
};

export default Login;