import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 64 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, match: /^[0-9]{10}$/ },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB-backed users via Mongoose

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Root route: serve UI
app.get("/", (req, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

app.post("/login", async (req, res) => {
  try {
    const { identifier, username, email, password } = req.body || {};
    const id = (identifier || username || email || "").trim();
    if (!id || !password) {
      return res.status(400).json({ success: false, message: "Identifier and password are required" });
    }
    const isEmail = id.includes("@");
    const filter = isEmail ? { email: id.toLowerCase() } : { username: id };
    const user = await User.findOne(filter);
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });
    return res.status(200).json({ success: true, message: "Login successful!" });
  } catch (err) {
    console.error("/login error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Sign up route (DB-backed)
app.post("/signup", async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body || {};
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "Username, email, phone and password are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone must be exactly 10 digits" });
    }
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, email, phone, passwordHash });
    return res.status(201).json({ success: true, message: "Signup successful! You can now sign in." });
  } catch (err) {
    console.error("/signup error", err);
    if (err && err.name === "ValidationError") {
      const firstError = Object.values(err.errors || {})[0];
      const msg = firstError?.message || "Validation error";
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/simple-login-sim";

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();