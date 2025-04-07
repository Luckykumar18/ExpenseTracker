import React, { createContext, useState, useEffect, useContext } from "react";
import { registerUser, signInUser, fetchUserProfile } from "../api/auth";
import axios from "axios";

interface AuthContextType {
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to fetch the user profile from the backend.
  useEffect(() => {
    const getProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        if (profile?.user) {
          console.log("Fetched profile:", profile.user);
          setUser(profile.user);
        }
      } catch (error) {
        console.error("Error fetching profile on mount:", error);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await signInUser(email, password);
      console.log("Sign in response:", data);
      setUser(data.user);
    } catch (error) {
      console.error("Error in signIn:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const data = await registerUser(email, password);
      console.log("Sign up response:", data);
      setUser(data.user);
    } catch (error) {
      console.error("Error in signUp:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Call your backend logout endpoint to clear the cookie
      await axios.post("https://expensetracker-nhrt.onrender.com/api/users/logout", {}, { withCredentials: true });
      setUser(null);
      window.location.href = "/login"; // Redirect after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
