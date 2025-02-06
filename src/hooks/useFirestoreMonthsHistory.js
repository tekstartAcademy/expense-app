// src/hooks/useFirestoreMonthsHistory.js
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export const useFirestoreMonthsHistory = (userId) => {
  const [monthsHistory, setMonthsHistory] = useState([]);

  useEffect(() => {
    if (!userId) return; // Guard: only query if we have a valid user ID

    // Reference the "months" collection under the current user
    const monthsCollectionRef = collection(db, "users", userId, "months");

    // Listen to real-time updates on the entire collection
    const unsubscribe = onSnapshot(
      monthsCollectionRef,
      (snapshot) => {
        const monthsData = snapshot.docs.map((doc) => ({
          id: doc.id, // assuming the doc ID is something like "January 2025"
          ...doc.data(),
        }));
        setMonthsHistory(monthsData);
      },
      (error) => {
        console.error("Error fetching months history:", error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return monthsHistory;
};
