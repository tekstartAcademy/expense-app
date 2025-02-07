// src/components/ExpenseTable.jsx
import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const ExpenseTable = ({ bills, handleBillChange, deleteExpense }) => {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Expense Name</TableCell>
            <TableCell>Category</TableCell>
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
                  placeholder="Expense Name"
                  fullWidth
                  variant="standard"
                />
              </TableCell>
              <TableCell>
                <FormControl variant="standard" fullWidth>
                  <Select
                    value={bill.category || "Bills"}
                    onChange={(e) =>
                      handleBillChange(index, "category", e.target.value)
                    }
                  >
                    <MenuItem value="Bills">Bills</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={bill.amount}
                  onChange={(e) => handleBillChange(index, "amount", e.target.value)}
                  placeholder="Amount"
                  fullWidth
                  variant="standard"
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
    </Box>
  );
};

export default ExpenseTable;
