export const getCurrentMonth = () => {
    const date = new Date();
    return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
  };
  
  export const getPreviousMonth = (currentMonth) => {
    const [month, year] = currentMonth.split(" ");
    const date = new Date(`${month} 1, ${year}`);
    date.setMonth(date.getMonth() - 1);
    return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
  };
  
  export const getNextMonth = (currentMonth) => {
    const [month, year] = currentMonth.split(" ");
    const date = new Date(`${month} 1, ${year}`);
    date.setMonth(date.getMonth() + 1);
    return `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
  };
  
  export const calculateRemainingBalance = (income, bills) => {
    return income - bills.reduce((sum, bill) => sum + bill.amount, 0);
  };
  
  export const validateBills = (bills) => {
    return bills.every((bill) => bill.name.trim() !== "" && bill.amount > 0);
  };