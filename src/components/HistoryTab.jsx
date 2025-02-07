// src/components/HistoryTab.jsx
import React from "react";
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
} from "@mui/material";

const HistoryTab = ({ monthsHistory }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom color="text.primary">
        History
      </Typography>
      {monthsHistory && monthsHistory.length > 0 ? (
        monthsHistory
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((month) => (
            <Card
              key={month.id}
              sx={{ marginBottom: "20px", backgroundColor: "background.paper" }}
            >
              <CardContent>
                <Typography variant="h6" color="text.primary">
                  {month.id}
                </Typography>
                <Typography color="text.primary">
                  Income: ${month.income !== undefined ? month.income.toFixed(2) : "0.00"}
                </Typography>
                <Typography color="text.primary">
                  Total Expenses: $
                  {month.bills
                    ? month.bills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)
                    : "0.00"}
                </Typography>
                <Typography color="text.primary">
                  Remaining Balance: $
                  {month.remainingBalance !== undefined
                    ? month.remainingBalance.toFixed(2)
                    : "0.00"}
                </Typography>
                {month.bills && month.bills.length > 0 && (
                  <Table sx={{ backgroundColor: "background.paper", marginTop: "10px" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "text.primary" }}>Bill</TableCell>
                        <TableCell sx={{ color: "text.primary" }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {month.bills.map((bill, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ color: "text.primary" }}>{bill.name}</TableCell>
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
          ))
      ) : (
        <Typography color="text.primary">No history available.</Typography>
      )}
    </Box>
  );
};

export default HistoryTab;
