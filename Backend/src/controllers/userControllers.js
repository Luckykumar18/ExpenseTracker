import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Generate JWT token valid for 7 days
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Registers a new user.
 */
export const registerUser = async (req, res) => {
  try {
    console.log("Incoming registration request:", req.body); // Debugging log

    const { email, password } = req.body;

    // Check if required fields are present
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({ email, password: hashedPassword, username: email });
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Set cookie (remove domain for local testing)
    res.cookie("token", token, {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "none",
    });

    console.log("User registered successfully:", user.email);
    return res.status(201).json({ message: "User registered", user, token });

  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Logs in a user.
 */
export const loginUser = async (req, res) => {
  try {
    console.log("Incoming login request:", req.body); // Debugging log

    const { email, password } = req.body;

    // Check if required fields are present
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "none",
    });

    console.log("User logged in:", user.email);
    return res.status(200).json({ message: "Login successful", user, token });

  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Fetches the authenticated user's profile along with aggregated transaction totals.
 */
export const getUserProfile = async (req, res) => {
  try {
    console.log("Fetching user profile...");

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Aggregate transaction totals
    const transactions = await Transaction.find({ user: user._id });
    const totalExpenses = transactions
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => acc + tx.amount, 0);
    const totalIncome = transactions
      .filter(tx => tx.type === "income")
      .reduce((acc, tx) => acc + tx.amount, 0);

    user = user.toObject();
    user.totalExpenses = totalExpenses;
    user.totalIncome = totalIncome;

    return res.status(200).json({ user });

  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Fetches a user by ID.
 */
export const getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (user) return res.status(200).json({ exists: true, user });
    return res.status(404).json({ exists: false });
  } catch (error) {
    console.error("Error in getUserProfileById:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Logs out a user.
 */
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "none",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

