import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory users store (session-lifetime only)
const users = new Map([
  ["admin", { username: "admin", password: "1234" }]
]);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Root route: serve UI
app.get("/", (req, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url).pathname);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const record = users.get(username);
  if (record && record.password === password) {
    return res.status(200).json({ success: true, message: "Login successful!" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Sign up route (no DB; in-memory only)
app.post("/signup", (req, res) => {
  const { username, password, confirmPassword } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }
  if (users.has(username)) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }
  users.set(username, { username, password });
  return res.status(201).json({ success: true, message: "Signup successful! You can now sign in." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});