// src/components/SavingsComponent.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const SavingsComponent = ({ savings, setSavings, monthData, currentMonth, setError, userId }) => {
  const [open, setOpen] = useState(false);
  const [newSavings, setNewSavings] = useState(savings || 0);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setNewSavings(savings || 0);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const updateSavings = async () => {
    const updatedSavings = parseFloat(newSavings);
    if (isNaN(updatedSavings) || updatedSavings < 0) {
      setError("Invalid savings value. Please enter a non-negative number.");
      return;
    }
    setLoading(true);
    // Get existing month data (or default values)
    const existingMonthData = monthData || { income: 0, bills: [], savings: 0 };
    const totalExpenses = existingMonthData.bills
      ? existingMonthData.bills.reduce((sum, bill) => sum + bill.amount, 0)
      : 0;
    const remainingBalance = existingMonthData.income - updatedSavings - totalExpenses;
    const updatedMonthData = {
      ...existingMonthData,
      savings: updatedSavings,
      remainingBalance,
    };
    try {
      await setDoc(doc(db, "users", userId, "months", currentMonth), updatedMonthData);
      setSavings(updatedSavings);
      handleClose();
    } catch (error) {
      setError("Error updating savings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Savings
          </Typography>
          {savings > 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">Current Savings: ${savings.toFixed(2)}</Typography>
              <Button onClick={handleOpen} variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Update Savings"}
              </Button>
            </div>
          ) : (
            <Button onClick={handleOpen} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Add Savings"}
            </Button>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{savings > 0 ? "Update Savings" : "Add Savings"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Savings"
            type="number"
            fullWidth
            value={newSavings}
            onChange={(e) => setNewSavings(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={updateSavings} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavingsComponent;
