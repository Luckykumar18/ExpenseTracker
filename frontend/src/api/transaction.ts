// src/api/transactions.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

// Ensure cookies are sent with requests.
axios.defaults.withCredentials = true;

/**
 * Fetches all transactions for the authenticated user.
 */
export const fetchTransactions = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

/**
 * Creates a new transaction.
 */
export const createTransaction = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

/**
 * Updates an existing transaction.
 */
export const updateTransaction = async (id: string, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

/**
 * Deletes a transaction.
 */
export const deleteTransaction = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};
