import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

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
              <IconButton onClick={() => deleteExpense(index)} color="error" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpenseTable;