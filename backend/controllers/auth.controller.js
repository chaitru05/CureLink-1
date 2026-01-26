import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PlatformActivity from "../models/PlatformActivity.js";

// ---------------------------
// REGISTER
// ---------------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Log platform activity
    await PlatformActivity.create({
      action: role === "patient" ? "Patient Registered" : role === "doctor" ? "Doctor Registered" : "User Registered",
      userId: user._id,
      targetId: user._id,
      targetType: "User",
      description: `${role === "patient" ? "Patient" : role === "doctor" ? "Doctor" : "User"} ${name} registered with email ${email}`
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    // after generating token

res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

res.status(201).json({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ---------------------------
// LOGIN
// ---------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,       // REQUIRED on Vercel + Railway
      sameSite: "none",   // REQUIRED for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};


// ---------------------------
// GET PROFILE
// ---------------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
