// App.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import { auth, db } from "./firebase/config";
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
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import "animate.css";
import IncomeComponent from "./components/IncomeComponent";
import ExpenseTable from "./components/ExpenseTable";
import HistoryTab from "./components/HistoryTab";
import {
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  validateBills,
} from "./helpers";
import { useFirestoreMonthsHistory } from "./hooks/useFirestoreMonthsHistory";
import { useFirestoreData } from "./hooks/useFirestoreData";
import { setDoc, doc } from "firebase/firestore";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const App = () => {
  // Define a list of months and a range of years
  const monthsArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYearNum = new Date().getFullYear();
  const yearsArray = Array.from({ length: 21 }, (_, i) => currentYearNum - 10 + i);

  // Get the current month string (e.g., "February 2025") from the helper
  const currentMonthStr = getCurrentMonth();
  const initialMonth = currentMonthStr.split(" ")[0];
  const initialYear = currentMonthStr.split(" ")[1];

  // Use separate states for month and year selection
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Derive the full current month string from the selections
  const currentMonth = `${selectedMonth} ${selectedYear}`;

  const [income, setIncome] = useState(0);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState(0); // 0: Home, 1: History
  const [pendingExpenseChange, setPendingExpenseChange] = useState(false);
  // The initial userId is hardcoded for testing. In production, it should be null until login.
  const [userId, setUserId] = useState("JtyyGgCQLcOBFXDXnxxI4Bv9Wl23");

  // Load month history and current month data from Firebase
  const monthsHistory = useFirestoreMonthsHistory(userId);
  const monthData = useFirestoreData(currentMonth, userId);

  // Update local state when monthData changes
  useEffect(() => {
    if (monthData) {
      setIncome(monthData.income || 0);
      setBills(monthData.bills || []);
      // Reset the pending flag since we just loaded the saved data.
      setPendingExpenseChange(false);
    }
  }, [monthData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!userId) {
    return <Login setUserId={setUserId} />;
  }

  // Save (or update) the current month's data in Firebase
  const saveMonthData = async () => {
    if (!validateBills(bills)) {
      setError("Invalid bill entries. Ensure all bills have a name and a positive amount.");
      return;
    }

    setLoading(true);

    const updatedMonthData = {
      income: income,
      bills: bills,
      remainingBalance: income - bills.reduce((sum, bill) => sum + bill.amount, 0),
    };

    try {
      await setDoc(doc(db, "users", userId, "months", currentMonth), updatedMonthData);
      // Clear the pending expense change flag since we have recalculated.
      setPendingExpenseChange(false);
    } catch (error) {
      setError("Error saving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigation buttons update the dropdown selections as well.
  const handleMonthChange = (direction) => {
    const newMonthStr =
      direction === "prev" ? getPreviousMonth(currentMonth) : getNextMonth(currentMonth);
    const [newMonth, newYear] = newMonthStr.split(" ");
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const deleteExpense = (index) => {
    const updatedBills = bills.filter((_, i) => i !== index);
    setBills(updatedBills);
    setPendingExpenseChange(true);
  };

  const addExpense = () => {
    setBills([...bills, { name: "", amount: 0 }]);
    setPendingExpenseChange(true);
  };

  const handleBillChange = (index, field, value) => {
    const updatedBills = [...bills];
    updatedBills[index][field] = field === "amount" ? parseFloat(value) : value;
    setBills(updatedBills);
    setPendingExpenseChange(true);
  };

  // Calculate remaining balance (either from monthData or compute on the fly)
  const remainingBalance =
    monthData && monthData.remainingBalance !== undefined
      ? monthData.remainingBalance
      : income - bills.reduce((sum, bill) => sum + bill.amount, 0);

  // Chart data for current month
  const chartData = {
    labels: ["Income", "Expenses", "Remaining Balance"],
    datasets: [
      {
        data: [
          income,
          bills.reduce((sum, bill) => sum + bill.amount, 0),
          remainingBalance,
        ],
        backgroundColor: ["#4CAF50", "#FF5252", "#2196F3"],
      },
    ],
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f5f5f5" }}>
      <Typography variant="h3" gutterBottom align="center" color="text.primary">
        Monthly Expense Tracker
      </Typography>
      {/* Display a header based on the selected tab */}
      {selectedTab === 0 ? (
        <Typography variant="h5" align="center" color="primary" sx={{ marginBottom: "20px" }}>
          Currently Viewing: {currentMonth}
        </Typography>
      ) : (
        <Typography variant="h5" align="center" color="primary" sx={{ marginBottom: "20px" }}>
          Monthly Expense History
        </Typography>
      )}

      {/* Navigation buttons */}
      <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
        <Grid item xs={12} md={6}>
          <Button
            onClick={() => handleMonthChange("prev")}
            startIcon={<ArrowBack />}
            variant="contained"
            color="primary"
          >
            Previous Month
          </Button>
        </Grid>
        <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
          <Button
            onClick={() => handleMonthChange("next")}
            endIcon={<ArrowForward />}
            variant="contained"
            color="primary"
          >
            Next Month
          </Button>
        </Grid>
      </Grid>

      {/* Dropdown selectors for month and year */}
      <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="month-select-label">Month</InputLabel>
            <Select
              labelId="month-select-label"
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthsArray.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearsArray.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ marginBottom: "20px" }}
      >
        <Tab label="Home" />
        <Tab label="History" />
      </Tabs>

      {selectedTab === 0 && (
        <>
          <IncomeComponent
            income={income}
            setIncome={setIncome}
            monthData={monthData}
            currentMonth={currentMonth}
            setError={setError}
            userId={userId}
          />

          <Card sx={{ margin: "20px 0", backgroundColor: "background.paper" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="text.primary">
                Expenses for {currentMonth}
              </Typography>
              <Button
                onClick={addExpense}
                variant="contained"
                color="primary"
                sx={{ marginBottom: "20px" }}
              >
                Add Expense
              </Button>
              <ExpenseTable
                bills={bills}
                handleBillChange={handleBillChange}
                deleteExpense={deleteExpense}
              />
            </CardContent>
          </Card>

          {/* Tooltip wraps the calculate button */}
          <Tooltip
            title={
              pendingExpenseChange
                ? "Expenses have changed. Click 'Calculate Remaining Balance' to update figures."
                : ""
            }
            arrow
          >
            <span>
              <Button
                onClick={saveMonthData}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ marginBottom: "20px" }}
              >
                {loading ? <CircularProgress size={24} /> : "Calculate Remaining Balance"}
              </Button>
            </span>
          </Tooltip>

          {/* Display an alert if there are pending expense changes */}
          {pendingExpenseChange && (
            <Alert severity="warning" sx={{ marginBottom: "20px" }}>
              Expense changes detected. Click "Calculate Remaining Balance" to update figures.
            </Alert>
          )}

          <Card sx={{ margin: "20px 0", backgroundColor: "background.paper" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="text.primary">
                Current Month Summary for {currentMonth}
              </Typography>
              <Typography color="text.primary">Income: ${income.toFixed(2)}</Typography>
              <Typography color="text.primary">
                Total Expenses: ${bills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
              </Typography>
              <Typography color="text.primary">
                Remaining Balance: ${remainingBalance.toFixed(2)}
              </Typography>
              <Box sx={{ maxWidth: 400, margin: "20px auto" }}>
                <Pie data={chartData} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {selectedTab === 1 && <HistoryTab monthsHistory={monthsHistory} />}

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
