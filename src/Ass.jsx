import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete as DeleteIcon, ArrowBack, ArrowForward } from "@mui/icons-material";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import "animate.css";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZqqJAy3sb2JIEx_WWvOMmEPLUIPs2wIs",
  authDomain: "expense-app-f1939.firebaseapp.com",
  projectId: "expense-app-f1939",
  storageBucket: "expense-app-f1939.appspot.com",
  messagingSenderId: "574620895210",
  appId: "1:574620895210:web:802eb870bbcdb66ce6d493",
  measurementId: "G-J2QZLRMJRT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Helper functions
const getCurrentMonth = () => {
  const date = new Date();
  return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
};

const getPreviousMonth = (currentMonth) => {
  const [month, year] = currentMonth.split(" ");
  const date = new Date(`${month} 1, ${year}`);
  date.setMonth(date.getMonth() - 1);
  return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
};

const getNextMonth = (currentMonth) => {
  const [month, year] = currentMonth.split(" ");
  const date = new Date(`${month} 1, ${year}`);
  date.setMonth(date.getMonth() + 1);
  return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
};

// Income Component with Dialog Refactor
const IncomeComponent = ({ income, setIncome, monthData, setMonthData, currentMonth, setError }) => {
  const [open, setOpen] = useState(false);
  const [newIncome, setNewIncome] = useState(income || 0);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setNewIncome(income || 0); // Reset to current income when opening
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
    const existingMonthData = monthData[currentMonth] || { income: 0, bills: [], remainingBalance: 0 };

    const remainingBalance =
      updatedIncome - existingMonthData.bills.reduce((sum, bill) => sum + bill.amount, 0);

    const updatedMonthData = {
      ...monthData,
      [currentMonth]: {
        ...existingMonthData,
        income: updatedIncome,
        remainingBalance,
      },
    };

    try {
      await setDoc(doc(db, "expenses", "monthData"), updatedMonthData);
      setMonthData(updatedMonthData);
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
      <Card className="animate__animated animate__fadeIn" style={{ margin: "20px 0" }}>
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

// Expense Table Component
const ExpenseTable = ({ bills, handleBillChange, deleteExpense }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Bill</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bills.map((bill, index) => (
          <TableRow key={index}>
            <TableCell>
              <TextField
                value={bill.name}
                onChange={(e) => handleBillChange(index, "name", e.target.value)}
                placeholder="Bill Name"
                fullWidth
              />
            </TableCell>
            <TableCell>
              <TextField
                type="number"
                value={bill.amount}
                onChange={(e) => handleBillChange(index, "amount", e.target.value)}
                placeholder="Amount"
                fullWidth
              />
            </TableCell>
            <TableCell>
              <IconButton onClick={() => deleteExpense(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// App Component
const App = () => {
  const [income, setIncome] = useState(0);
  const [bills, setBills] = useState([]);
  const [monthData, setMonthData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "expenses", "monthData"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMonthData(data);
        const dataForMonth = data[currentMonth];
        if (dataForMonth) {
          setIncome(dataForMonth.income || 0);
        } else {
          setIncome(0); // Reset income for new month if no data
        }
      }
    });

    return () => unsub();
  }, [currentMonth]);

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
      await setDoc(doc(db, "expenses", "monthData"), updatedMonthData);
      setMonthData(updatedMonthData);
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

  const validateBills = (bills) => {
    return bills.every((bill) => bill.name.trim() !== "" && bill.amount > 0);
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Typography variant="h3" gutterBottom align="center">
        Monthly Expense Tracker
      </Typography>

      <Tabs value={0} indicatorColor="primary" textColor="primary" style={{ marginBottom: "20px" }}>
        <Tab label="Expenses" />
        <Tab label="Calculate" />
        <Tab label="History" />
      </Tabs>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
        <Button onClick={() => handleMonthChange("prev")} startIcon={<ArrowBack />}>
          Previous Month
        </Button>
        <Typography variant="h5">{currentMonth}</Typography>
        <Button onClick={() => handleMonthChange("next")} endIcon={<ArrowForward />}>
          Next Month
        </Button>
      </div>

      <IncomeComponent
        income={income}
        setIncome={setIncome}
        monthData={monthData}
        setMonthData={setMonthData}
        currentMonth={currentMonth}
        setError={setError}
      />

      {/* Expenses Section */}
      <Card className="animate__animated animate__fadeIn" style={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Expenses for {currentMonth}
          </Typography>
          <Button onClick={addExpense} variant="contained" color="primary" style={{ marginBottom: "20px" }}>
            Add Expense
          </Button>
          <ExpenseTable bills={bills} handleBillChange={handleBillChange} deleteExpense={deleteExpense} />
        </CardContent>
      </Card>

      {/* Calculate Remaining Balance Section */}
      <Card className="animate__animated animate__fadeIn" style={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Calculate Remaining Balance
          </Typography>
          <Button onClick={saveMonthData} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Calculate Remaining Balance"}
          </Button>
        </CardContent>
      </Card>

      {/* Monthly History Section */}
      <Card className="animate__animated animate__fadeIn" style={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Monthly History
          </Typography>
          {Object.entries(monthData).map(([month, data]) => (
            <div key={month} style={{ marginBottom: "20px" }}>
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
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="animate__animated animate__fadeIn" style={{ margin: "20px 0" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Income vs Expenses
          </Typography>
          <Pie data={chartData} />
        </CardContent>
      </Card>

      {/* Error Snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          message={error}
        />
      )}
    </div>
  );
};

export default App;
