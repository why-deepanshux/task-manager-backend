const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./Routes/routes"); // Assuming routes are defined in a separate file
const cors = require("cors");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", routes);

// Define API Endpoints for Postman Testing
// Auth Routes
// POST /api/register - Register a new user
// POST /api/login - Login and get JWT token

// Task Routes (Requires Authorization Header with Bearer Token)
// POST /api/tasks - Add a new task
// GET /api/tasks - Get all tasks for the authenticated user
// PUT /api/tasks - Update a task
// DELETE /api/tasks/:taskID - Delete a task by taskID
// GET /api/tasks/stats - Get task statistics for the authenticated user

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
