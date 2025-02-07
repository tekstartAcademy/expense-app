// src/components/AccountSettings.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";

const AccountSettings = ({ user, setUser, setError }) => {
  const auth = getAuth();
  const [name, setName] = useState(user.displayName || "");
  const [email, setEmail] = useState(user.email || "");
  // New password update fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Update account details (name, email, and optionally password)
  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      // Update display name if changed
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      // If user has entered a new password, update it after reauthentication
      if (newPassword || confirmNewPassword || currentPassword) {
        if (!currentPassword) {
          throw new Error("Please enter your current password to update your password.");
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error("New password and confirm password do not match.");
        }
        // Reauthenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        // Update password
        await updatePassword(user, newPassword);
      }
      setMessage("Account details updated successfully.");
      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError("Error updating account details: " + err.message);
    }
    setLoading(false);
  };

  // Send a password reset email
  const handleResetPassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage("Password reset email sent.");
    } catch (err) {
      setError("Error sending password reset email: " + err.message);
    }
    setLoading(false);
  };

  // Delete the user account (with confirmation)
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await deleteUser(user);
      // onAuthStateChanged in App.jsx will handle signing out.
    } catch (err) {
      setError("Error deleting account: " + err.message);
    }
    setLoading(false);
  };

  return (
    <Card sx={{ marginTop: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Account Settings
        </Typography>
        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Password Update Section */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Change Password
        </Typography>
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          margin="normal"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          helperText="Enter your current password to verify your identity."
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Update Account"}
        </Button>
        <Button
          variant="outlined"
          onClick={handleResetPassword}
          disabled={loading}
          sx={{ mt: 2, ml: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Reset Password via Email"}
        </Button>
        <Button
          variant="text"
          color="error"
          onClick={handleDeleteAccount}
          disabled={loading}
          sx={{ mt: 2, ml: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Delete Account"}
        </Button>
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
