// src/components/HistoryTab.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Button,
} from "@mui/material";

const HistoryTab = ({ monthsHistory }) => {
  // Progressive loading: start by showing 10 items
  const [visibleCount, setVisibleCount] = useState(10);

  // Sort the months in descending order so the most recent appear first.
  // (Assumes the month ID string is in a format that sorts chronologically.)
  const sortedHistory = monthsHistory
    ? [...monthsHistory].sort((a, b) => b.id.localeCompare(a.id))
    : [];

  // Reset visibleCount when the history data changes
  useEffect(() => {
    setVisibleCount(10);
  }, [monthsHistory]);

  const visibleHistory = sortedHistory.slice(0, visibleCount);

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="text.primary">
        History
      </Typography>
      {sortedHistory && sortedHistory.length > 0 ? (
        <>
          {visibleHistory.map((month) => {
            // Calculate breakdowns for the month
            const income = month.income || 0;
            const savings = month.savings || 0;
            const billsExpenses = month.bills
              ? month.bills
                  .filter((exp) => exp.category === "Bills")
                  .reduce((sum, exp) => sum + exp.amount, 0)
              : 0;
            const otherExpenses = month.bills
              ? month.bills
                  .filter((exp) => exp.category === "Other")
                  .reduce((sum, exp) => sum + exp.amount, 0)
              : 0;
            const totalExpenses = billsExpenses + otherExpenses;
            const remaining =
              month.remainingBalance !== undefined
                ? month.remainingBalance
                : income - savings - totalExpenses;

            return (
              <Card
                key={month.id}
                sx={{ marginBottom: "20px", backgroundColor: "background.paper" }}
              >
                <CardContent>
                  <Typography variant="h6" color="text.primary">
                    {month.id}
                  </Typography>
                  <Typography color="text.primary">
                    Income: ${income.toFixed(2)}
                  </Typography>
                  <Typography color="text.primary">
                    Savings: ${savings.toFixed(2)}
                  </Typography>
                  <Typography color="text.primary">
                    Bills Expenses: ${billsExpenses.toFixed(2)}
                  </Typography>
                  <Typography color="text.primary">
                    Other Expenses: ${otherExpenses.toFixed(2)}
                  </Typography>
                  <Typography color="text.primary">
                    Remaining Balance: ${remaining.toFixed(2)}
                  </Typography>
                  {month.bills && month.bills.length > 0 && (
                    <Table
                      sx={{ backgroundColor: "background.paper", marginTop: "10px" }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "text.primary" }}>
                            Expense Name
                          </TableCell>
                          <TableCell sx={{ color: "text.primary" }}>
                            Category
                          </TableCell>
                          <TableCell sx={{ color: "text.primary" }}>
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {month.bills.map((bill, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: "text.primary" }}>
                              {bill.name}
                            </TableCell>
                            <TableCell sx={{ color: "text.primary" }}>
                              {bill.category || "Bills"}
                            </TableCell>
                            <TableCell sx={{ color: "text.primary" }}>
                              ${bill.amount !== undefined ? bill.amount.toFixed(2) : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {visibleCount < sortedHistory.length && (
            <Box textAlign="center" sx={{ marginTop: 2 }}>
              <Button
                variant="contained"
                onClick={() => setVisibleCount(visibleCount + 5)}
              >
                Load More
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography color="text.primary">No history available.</Typography>
      )}
    </Box>
  );
};

export default HistoryTab;
