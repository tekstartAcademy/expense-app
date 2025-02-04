import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import { auth } from "./firebase/config";
import {
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Typography,
  Snackbar,
  CircularProgress,
  Grid,
  Box,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "animate.css";
import IncomeComponent from "./components/IncomeComponent";
import ExpenseTable from "./components/ExpenseTable";
import { getCurrentMonth, getPreviousMonth, getNextMonth, calculateRemainingBalance, validateBills } from "./helpers";
import { useFirestoreData } from "./hooks/useFirestoreData";
import { db } from "./firebase/config";
import { setDoc, doc } from "firebase/firestore";

ChartJS.register(ArcElement, Tooltip, Legend);

const App = () => {
  const [income, setIncome] = useState(0);
  const [bills, setBills] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("user1"); // Replace with actual user ID from Firebase Auth

  const monthData = useFirestoreData(currentMonth, userId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set the authenticated user's ID
      } else {
        setUserId(null); // No user is signed in
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userId) {
    return <Login setUserId={setUserId} />;
  }

  const saveMonthData = async () => {
    if (!validateBills(bills)) {
      setError("Invalid bill entries. Ensure all bills have a name and a positive amount.");
      return;
    }

    setLoading(true);
    const existingMonthData = monthData[currentMonth] || { income: 0, bills: [], remainingBalance: 0 };

    const newBillsTotal = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const remainingBalance =
      (income || existingMonthData.income) -
      (existingMonthData.bills.reduce((sum, bill) => sum + bill.amount, 0) + newBillsTotal);

    const updatedMonthData = {
      ...monthData,
      [currentMonth]: {
        income: income || existingMonthData.income,
        bills: [...existingMonthData.bills, ...bills],
        remainingBalance,
      },
    };

    try {
      await setDoc(doc(db, "users", userId, "months", currentMonth), updatedMonthData);
      setBills([]);
    } catch (error) {
      setError("Error saving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = (index) => {
    const updatedBills = bills.filter((_, i) => i !== index);
    setBills(updatedBills);
  };

  const addExpense = () => {
    setBills([...bills, { name: "", amount: 0 }]);
  };

  const handleBillChange = (index, field, value) => {
    const updatedBills = [...bills];
    updatedBills[index][field] = field === "amount" ? parseFloat(value) : value;
    setBills(updatedBills);
  };

  const handleMonthChange = (direction) => {
    const newMonth = direction === "prev" ? getPreviousMonth(currentMonth) : getNextMonth(currentMonth);
    setCurrentMonth(newMonth);
  };

  const chartData = {
    labels: ["Income", "Expenses", "Remaining Balance"],
    datasets: [
      {
        data: [
          income,
          monthData[currentMonth]?.bills.reduce((sum, bill) => sum + bill.amount, 0) || 0,
          monthData[currentMonth]?.remainingBalance || 0,
        ],
        backgroundColor: ["#4CAF50", "#FF5252", "#2196F3"],
      },
    ],
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Typography variant="h3" gutterBottom align="center">
        Monthly Expense Tracker
      </Typography>

      <Tabs value={0} indicatorColor="primary" textColor="primary" sx={{ marginBottom: "20px" }}>
        <Tab label="Expenses" />
        <Tab label="Calculate" />
        <Tab label="History" />
      </Tabs>

      <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
        <Grid item xs={12} md={6}>
          <Button onClick={() => handleMonthChange("prev")} startIcon={<ArrowBack />}>
            Previous Month
          </Button>
        </Grid>
        <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
          <Button onClick={() => handleMonthChange("next")} endIcon={<ArrowForward />}>
            Next Month
          </Button>
        </Grid>
      </Grid>

      <IncomeComponent
        income={income}
        setIncome={setIncome}
        monthData={monthData}
        setMonthData={() => {}}
        currentMonth={currentMonth}
        setError={setError}
        userId={userId}
      />

      <Card sx={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Expenses for {currentMonth}
          </Typography>
          <Button onClick={addExpense} variant="contained" color="primary" sx={{ marginBottom: "20px" }}>
            Add Expense
          </Button>
          <ExpenseTable bills={bills} handleBillChange={handleBillChange} deleteExpense={deleteExpense} />
        </CardContent>
      </Card>

      <Card sx={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Calculate Remaining Balance
          </Typography>
          <Button onClick={saveMonthData} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Calculate Remaining Balance"}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Monthly History
          </Typography>
          {Object.entries(monthData).map(([month, data]) => (
            <Box key={month} sx={{ marginBottom: "20px" }}>
              <Typography variant="h6">{month}</Typography>
              <Typography>Income: ${data.income.toFixed(2)}</Typography>
              <Typography>Bills:</Typography>
              {data.bills.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.bills.map((bill, index) => (
                      <TableRow key={index}>
                        <TableCell>{bill.name}</TableCell>
                        <TableCell>${bill.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography>No bills recorded.</Typography>
              )}
              <Typography>Remaining Balance: ${data.remainingBalance.toFixed(2)}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Income vs Expenses
          </Typography>
          <Pie data={chartData} />
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </Box>
  );
};

export default App;