// src/api/auth.ts
import axios from "axios";

const API_URL = "https://expensetracker-nhrt.onrender.com/api/users";

// Ensure cookies are sent with requests.
axios.defaults.withCredentials = true;

/**
 * Registers a new user.
 */
export const registerUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Logs in a user.
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};

/**
 * Fetches the authenticated user's profile.
 */
export const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
