import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export const useFirestoreData = (currentMonth, userId) => {
    const [monthData, setMonthData] = useState({});
  
    useEffect(() => {
      // Only set up the listener if a valid userId exists
      if (!userId) {
        return; // or you could optionally set monthData to a default value
      }
  
      const docRef = doc(db, "users", userId, "months", currentMonth);
      const unsub = onSnapshot(docRef, (docSnap) => {
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
  