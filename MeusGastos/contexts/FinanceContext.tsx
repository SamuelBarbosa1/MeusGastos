import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string; // Store as string to avoid serialization issues
}

export interface FinanceContextType {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  resetData: () => Promise<void>;
  setInitialBalance: (amount: number) => Promise<void>;
}

// Create context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Provider component
export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedBalance = await AsyncStorage.getItem('balance');
      const savedTransactions = await AsyncStorage.getItem('transactions');
      
      if (savedBalance !== null) {
        const balanceValue = parseFloat(savedBalance);
        setBalance(isNaN(balanceValue) ? 0 : balanceValue);
      } else {
        setBalance(0);
      }
      
      if (savedTransactions !== null) {
        const parsedTransactions = JSON.parse(savedTransactions);
        // Ensure date is properly formatted and all required fields exist
        const validatedTransactions = parsedTransactions.map((t: any) => {
          // Validate and fix date
          let date = new Date().toISOString();
          if (t.date) {
            const parsedDate = new Date(t.date);
            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate.toISOString();
            }
          }
          
          return {
            id: t.id || Date.now().toString() + Math.random(),
            type: t.type === 'income' || t.type === 'expense' ? t.type : 'expense',
            amount: t.amount && !isNaN(parseFloat(t.amount)) ? parseFloat(t.amount) : 0,
            category: t.category || 'Outros',
            description: t.description || undefined,
            date: date
          };
        }).filter((t: any) => t.id && t.type && !isNaN(t.amount));
        
        setTransactions(validatedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Initialize with empty array if there's an error
      setBalance(0);
      setTransactions([]);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('balance', balance.toString());
      // Only save valid transactions
      const validTransactions = transactions.filter(t => 
        t.id && 
        (t.type === 'income' || t.type === 'expense') && 
        !isNaN(t.amount) && 
        t.category
      );
      
      await AsyncStorage.setItem('transactions', JSON.stringify(validTransactions));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Save data whenever balance or transactions change
  useEffect(() => {
    if (balance !== undefined && transactions !== undefined) {
      saveData();
    }
  }, [balance, transactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    // Validate transaction data
    if (!transaction.amount || transaction.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    
    if (!transaction.category) {
      throw new Error('Category is required');
    }
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(), // Store as ISO string
      ...transaction
    };

    setTransactions(prev => [...prev, newTransaction]);
    
    // Update balance
    if (transaction.type === 'income') {
      setBalance(prev => prev + transaction.amount);
    } else {
      setBalance(prev => prev - transaction.amount);
    }
  };

  const resetData = async () => {
    setBalance(0);
    setTransactions([]);
    try {
      await AsyncStorage.removeItem('balance');
      await AsyncStorage.removeItem('transactions');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const setInitialBalance = async (amount: number) => {
    setBalance(amount);
  };

  const contextValue: FinanceContextType = {
    balance,
    transactions,
    addTransaction,
    resetData,
    setInitialBalance
  };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hook to use the finance context
export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};