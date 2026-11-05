"use client";

import React, { createContext, useContext } from "react";

const ExpenseContext = createContext<any>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  return <ExpenseContext.Provider value={{}}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  return useContext(ExpenseContext);
}

