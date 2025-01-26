const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const User = require("../Models/userMode");

// Add a Task
exports.addTask = async (req, res) => {
  try {
    const { title, priority, status, startTime, endTime } = req.body;
    const userId = req.user.id;

    // Validation: Ensure required fields and valid priority/status values
    if (!title || !priority || !status || !startTime || !endTime) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (priority < 1 || priority > 5) {
      return res
        .status(400)
        .json({ error: "Priority must be between 1 and 5" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate taskID
    const nextTaskID = user.tasks.length
      ? user.tasks[user.tasks.length - 1].taskID + 1
      : 1;

    // Add new task
    user.tasks.push({
      taskID: nextTaskID,
      title,
      priority,
      status,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    await user.save();
    res
      .status(201)
      .json({ message: "Task added successfully", task: user.tasks });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ tasks: user.tasks });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a Task
exports.updateTask = async (req, res) => {
  try {
    const { taskID, status } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const task = user.tasks.find((t) => t.taskID === taskID);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status=status;
    await user.save();

    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a Task
exports.deleteTask = async (req, res) => {
  try {
    const { taskID } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.tasks = user.tasks.filter((t) => t.taskID !== Number(taskID));
    await user.save();

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Task Statistics
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tasks = user.tasks;

    // Total count of tasks
    const totalTasks = tasks.length;

    // Count completed and pending tasks
    const completedTasks = tasks.filter((t) => t.status === "finished").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const completedPercent = ((completedTasks / totalTasks) * 100).toFixed(2);
    const pendingPercent = ((pendingTasks / totalTasks) * 100).toFixed(2);

    // Pending tasks grouped by priority
    const now = new Date();
    const pendingStats = tasks
      .filter((t) => t.status === "pending")
      .reduce((stats, task) => {
        const lapsedTime = Math.max(
          0,
          (now - task.startTime) / (1000 * 60 * 60)
        ); // Lapsed time in hours
        const balanceTime = Math.max(
          0,
          (task.endTime - now) / (1000 * 60 * 60)
        ); // Balance time in hours

        if (!stats[task.priority]) {
          stats[task.priority] = { lapsedTime: 0, balanceTime: 0, count: 0 };
        }

        stats[task.priority].lapsedTime += lapsedTime;
        stats[task.priority].balanceTime += balanceTime;
        stats[task.priority].count += 1;

        return stats;
      }, {});

    // Average completion time for completed tasks
    const avgCompletionTime =
      tasks
        .filter((t) => t.status === "finished")
        .reduce(
          (total, task) =>
            total + (task.endTime - task.startTime) / (1000 * 60 * 60),
          0
        ) / (completedTasks || 1); // To prevent division by zero

    res.json({
      totalTasks,
      completedPercent,
      pendingPercent,
      pendingStats,
      avgCompletionTime: avgCompletionTime.toFixed(2),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
