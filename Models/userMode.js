const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const taskSchema = new mongoose.Schema({
  taskID: { type: Number, required: true },
  title: { type: String, required: true },
  priority: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, required: true, enum: ["pending", "finished"] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tasks: [taskSchema], // Embedded tasks array
});

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
