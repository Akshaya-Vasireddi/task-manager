const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: "https://task-manager-card.vercel.app"
}));
app.use(express.json());

// 🔥 DEBUG MIDDLEWARE
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

console.log("TASK ROUTES LOADED");

// Test route
app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
