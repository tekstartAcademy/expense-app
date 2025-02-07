// src/components/IncomeComponent.jsx
import React, { useState } from "react";
import {
  Box,
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
    const existingMonthData = monthData || { income: 0, bills: [] };
    const totalBills = existingMonthData.bills
      ? existingMonthData.bills.reduce((sum, bill) => sum + bill.amount, 0)
      : 0;
    const remainingBalance = updatedIncome - totalBills;
    const updatedMonthData = { ...existingMonthData, income: updatedIncome, remainingBalance };
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
      <Card
        sx={{
          m: { xs: "10px 0", sm: "20px 0" },
          p: { xs: "10px", sm: "20px" },
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: { xs: 1, sm: 2 } }}>
            Income
          </Typography>
          {income > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: { xs: 1, sm: 0 } }}>
                Current Income: ${income.toFixed(2)}
              </Typography>
              <Button onClick={handleOpen} variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Update Income"}
              </Button>
            </Box>
          ) : (
            <Button onClick={handleOpen} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Add Income"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
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
            sx={{ backgroundColor: "#fff", borderRadius: 1 }}
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
