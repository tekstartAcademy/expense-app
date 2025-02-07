// src/App.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./components/Login";
import Register from "./components/Register";
import AccountSettings from "./components/AccountSettings";
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
  IconButton,
  Menu,
} from "@mui/material";
import { ArrowBack, ArrowForward, AccountCircle } from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import "animate.css";
import IncomeComponent from "./components/IncomeComponent";
import SavingsComponent from "./components/SavingsComponent";
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
  // Authentication state
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"

  // States for month, income, savings, and expenses
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
  const currentMonthStr = getCurrentMonth();
  const initialMonth = currentMonthStr.split(" ")[0];
  const initialYear = currentMonthStr.split(" ")[1];
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const currentMonth = `${selectedMonth} ${selectedYear}`;

  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Tabs: 0: Home, 1: History, 2: Account
  const [selectedTab, setSelectedTab] = useState(0);
  const [pendingExpenseChange, setPendingExpenseChange] = useState(false);

  // For the header menu (to hide welcome/logout in a menu)
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Load month history and current month data from Firebase (only when logged in)
  const monthsHistory = useFirestoreMonthsHistory(userId);
  const monthData = useFirestoreData(currentMonth, userId);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update local state when monthData changes
  useEffect(() => {
    if (monthData) {
      setIncome(monthData.income || 0);
      setSavings(monthData.savings || 0);
      setBills(monthData.bills || []);
      setPendingExpenseChange(false);
    }
  }, [monthData]);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError("Error signing out. Please try again.");
    }
    handleMenuClose();
  };

  // Calculate expense breakdowns
  const totalBillsExpenses = bills
    .filter((exp) => exp.category === "Bills")
    .reduce((sum, exp) => sum + exp.amount, 0);
  const totalOtherExpenses = bills
    .filter((exp) => exp.category === "Other")
    .reduce((sum, exp) => sum + exp.amount, 0);
  const totalExpenses = totalBillsExpenses + totalOtherExpenses;
  const remaining = income - savings - totalExpenses;

  // Save (or update) month data in Firebase
  const saveMonthData = async () => {
    if (!validateBills(bills)) {
      setError("Invalid expense entries. Ensure all expenses have a name, category, and a positive amount.");
      return;
    }
    setLoading(true);
    const updatedMonthData = {
      income,
      savings,
      bills,
      remainingBalance: remaining,
    };
    try {
      await setDoc(doc(db, "users", userId, "months", currentMonth), updatedMonthData);
      setPendingExpenseChange(false);
    } catch (error) {
      setError("Error saving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigation and expense handling functions
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
    setBills([...bills, { name: "", amount: 0, category: "Bills" }]);
    setPendingExpenseChange(true);
  };

  const handleBillChange = (index, field, value) => {
    const updatedBills = [...bills];
    updatedBills[index][field] = field === "amount" ? parseFloat(value) : value;
    setBills(updatedBills);
    setPendingExpenseChange(true);
  };

  // Chart data for the current month
  const chartData = {
    labels: ["Savings", "Bills", "Other", "Remaining"],
    datasets: [
      {
        data: [savings, totalBillsExpenses, totalOtherExpenses, remaining],
        backgroundColor: ["#FFB74D", "#4CAF50", "#FF5252", "#2196F3"],
      },
    ],
  };

  // If not authenticated, show the login/register screen
  if (!user) {
    return authMode === "login" ? (
      <Login setUserId={setUserId} setUser={setUser} toggleAuthMode={setAuthMode} />
    ) : (
      <Register setUserId={setUserId} setUser={setUser} toggleAuthMode={setAuthMode} />
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: 2, sm: 3 },
        maxWidth: { xs: "100%", sm: "1200px" },
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Typography variant="h4" color="text.primary" sx={{ fontWeight: "bold" }}>
          Bexpense
        </Typography>
        <IconButton onClick={handleMenuOpen} sx={{ color: "text.primary" }}>
          <AccountCircle fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem disabled>
            {user.displayName
              ? `Welcome, ${user.displayName.split(" ")[0]}`
              : "Welcome"}
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>

      {/* Subheader for Home tab */}
      {selectedTab === 0 && (
        <Typography variant="h6" align="center" color="primary" sx={{ mb: 3 }}>
          Currently Viewing: {currentMonth}
        </Typography>
      )}

      {/* Render navigation and calendar dropdowns only when not on Account tab */}
      {selectedTab !== 2 && (
        <>
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                onClick={() => handleMonthChange("prev")}
                startIcon={<ArrowBack />}
                variant="contained"
                color="primary"
                fullWidth
              >
                Previous Month
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                onClick={() => handleMonthChange("next")}
                endIcon={<ArrowForward />}
                variant="contained"
                color="primary"
                fullWidth
              >
                Next Month
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
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
            <Grid item xs={6} sm={3}>
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
        </>
      )}

      {/* Tabs for Home, History, and Account */}
      <Tabs
        value={selectedTab}
        onChange={(event, newValue) => setSelectedTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Home" />
        <Tab label="History" />
        <Tab label="Account" />
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
          <SavingsComponent
            savings={savings}
            setSavings={setSavings}
            monthData={monthData}
            currentMonth={currentMonth}
            setError={setError}
            userId={userId}
          />
          <Card sx={{ mb: 2, backgroundColor: "background.paper" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="text.primary">
                Expenses for {currentMonth}
              </Typography>
              <Button
                onClick={addExpense}
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                fullWidth
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
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Calculate Remaining Balance"}
              </Button>
            </span>
          </Tooltip>
          {pendingExpenseChange && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Expense changes detected. Click "Calculate Remaining Balance" to update figures.
            </Alert>
          )}
          <Card sx={{ mb: 2, backgroundColor: "background.paper" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="text.primary">
                Current Month Summary for {currentMonth}
              </Typography>
              <Typography color="text.primary">Income: ${income.toFixed(2)}</Typography>
              <Typography color="text.primary">Savings: ${savings.toFixed(2)}</Typography>
              <Typography color="text.primary">
                Bills Expenses: ${totalBillsExpenses.toFixed(2)}
              </Typography>
              <Typography color="text.primary">
                Other Expenses: ${totalOtherExpenses.toFixed(2)}
              </Typography>
              <Typography color="text.primary">
                Remaining Balance: ${remaining.toFixed(2)}
              </Typography>
              <Box sx={{ maxWidth: { xs: "90%", sm: 400 }, mx: "auto", mt: 2 }}>
                <Pie data={chartData} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {selectedTab === 1 && <HistoryTab monthsHistory={monthsHistory} />}

      {selectedTab === 2 && (
        <AccountSettings user={user} setUser={setUser} setError={setError} />
      )}

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
