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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// Helper function to parse a month id string (e.g., "February 2025") into a Date object.
const parseMonthId = (monthId) => {
  // Create a Date from a string like "February 2025 1" (using day 1)
  return new Date(`${monthId} 1`);
};

const HistoryTab = ({ monthsHistory }) => {
  // Progressive loading: show initially 10 items.
  const [visibleCount, setVisibleCount] = useState(10);
  // Filter state for period range.
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Sort the history in descending order (most recent first).
  const sortedHistory = monthsHistory
    ? [...monthsHistory].sort((a, b) => parseMonthId(b.id) - parseMonthId(a.id))
    : [];

  // For the dropdown filter options, sort the available month IDs in ascending order.
  const filterOptions = monthsHistory
    ? [...monthsHistory]
        .map((item) => item.id)
        .sort((a, b) => parseMonthId(a) - parseMonthId(b))
    : [];

  // Filter the history if both a start and an end period are selected.
  const filteredHistory =
    filterStart && filterEnd
      ? sortedHistory.filter((item) => {
          const itemDate = parseMonthId(item.id);
          return (
            itemDate >= parseMonthId(filterStart) &&
            itemDate <= parseMonthId(filterEnd)
          );
        })
      : sortedHistory;

  // Reset visibleCount when filtered history changes.
  useEffect(() => {
    setVisibleCount(10);
  }, [filteredHistory]);

  const visibleHistory = filteredHistory.slice(0, visibleCount);

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="text.primary">
        History
      </Typography>

      {/* Filter controls */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="filter-start-label">Start Period</InputLabel>
          <Select
            labelId="filter-start-label"
            value={filterStart}
            label="Start Period"
            onChange={(e) => setFilterStart(e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {filterOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="filter-end-label">End Period</InputLabel>
          <Select
            labelId="filter-end-label"
            value={filterEnd}
            label="End Period"
            onChange={(e) => setFilterEnd(e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {filterOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => {
            setFilterStart("");
            setFilterEnd("");
          }}
        >
          Clear Filter
        </Button>
      </Box>

      {filteredHistory.length > 0 ? (
        <>
          {visibleHistory.map((month) => {
            // Calculate breakdowns for this month.
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
                sx={{ mb: 2, backgroundColor: "background.paper" }}
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
                      sx={{ backgroundColor: "background.paper", mt: 1 }}
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
          {visibleCount < filteredHistory.length && (
            <Box textAlign="center" sx={{ mt: 2 }}>
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
        <Typography color="text.primary">
          No history available for the selected period.
        </Typography>
      )}
    </Box>
  );
};

export default HistoryTab;
