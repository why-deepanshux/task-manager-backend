const express = require("express");
const { register, login } = require("../Controllers/authControllers");
const { protect } = require("../Middleware/authMiddleware");
const {
  addTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../Controllers/taskControllers");

const router = express.Router();

// Authentication Routes
router.post("/register", register);
router.post("/login", login);

// Task Routes (Protected by JWT Middleware)
router.post("/tasks", protect, addTask); // Add a new task
router.get("/tasks", protect, getAllTasks); // Get all tasks for a user
router.put("/tasks", protect, updateTask); // Update a task
router.delete("/tasks/:taskID", protect, deleteTask); // Delete a task by taskID
router.get("/tasks/stats", protect, getTaskStats); // Get task statistics for a user

module.exports = router;
