// components/IncomeComponent.jsx
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

const IncomeComponent = ({ income, setIncome, monthData, currentMonth, setError, userId }) => {
  const [open, setOpen] = useState(false);
  const [newIncome, setNewIncome] = useState(income || 0);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setNewIncome(income || 0);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const updateIncome = async () => {
    const updatedIncome = parseFloat(newIncome);
    if (isNaN(updatedIncome) || updatedIncome <= 0) {
      setError("Invalid income value. Please enter a positive number.");
      return;
    }

    setLoading(true);
    // Use monthData directly (it's already the current month's data)
    const existingMonthData = monthData || { income: 0, bills: [] };
    const totalBillsAmount = existingMonthData.bills
      ? existingMonthData.bills.reduce((sum, bill) => sum + bill.amount, 0)
      : 0;
    const remainingBalance = updatedIncome - totalBillsAmount;
    const updatedMonthData = {
      ...existingMonthData,
      income: updatedIncome,
      remainingBalance,
    };

    try {
      await setDoc(doc(db, "users", userId, "months", currentMonth), updatedMonthData);
      setIncome(updatedIncome);
      handleClose();
    } catch (error) {
      setError("Error updating income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card style={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Income
          </Typography>
          {income > 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">Current Income: ${income.toFixed(2)}</Typography>
              <Button onClick={handleOpen} variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Update Income"}
              </Button>
            </div>
          ) : (
            <Button onClick={handleOpen} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Add Income"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{income > 0 ? "Update Income" : "Add Income"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Income"
            type="number"
            fullWidth
            value={newIncome}
            onChange={(e) => setNewIncome(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={updateIncome} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IncomeComponent;
