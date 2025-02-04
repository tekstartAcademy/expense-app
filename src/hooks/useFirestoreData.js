import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export const useFirestoreData = (currentMonth, userId) => {
    const [monthData, setMonthData] = useState({});
  
    useEffect(() => {
      const unsub = onSnapshot(doc(db, "users", userId, "months", currentMonth), (docSnap) => {
        if (docSnap.exists()) {
          setMonthData(docSnap.data());
        } else {
          setMonthData({ income: 0, bills: [], remainingBalance: 0 });
        }
      });
  
      return () => unsub();
    }, [currentMonth, userId]);
  
    return monthData;
  };