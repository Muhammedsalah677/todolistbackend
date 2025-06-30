const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const port = process.env.port || 8080;
const MONGOURL = process.env.MONGOURL;

app.use(express.json());

mongoose.connect(MONGOURL);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const user = mongoose.model("User", userSchema);
const taskSchema = new mongoose.Schema({
  text: String,
  status: String,
  priority: String,
  userId: mongoose.Schema.Types.ObjectId,
});
const Task = mongoose.model("Task", taskSchema);
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bycrypt(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "user have been registered" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await findone({ username });
  if (!user || (await bycrypt.compare(password, user, password))) {
    return res.status(401).json({ mesasage: "invalid creditionals" });
  }
  const token = jwt.sign({ userId: user._id }, "secret", { expireIn: "1h" });
  res.json({ token });
});

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer", "");
  if (!token) return res.status(401).json({ message: "no token" });
  try {
    const decode = jwt.verify(token, "secret");
    req, (userId = decode.userId);
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
};
// get task request
app.get("/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(task);
});
//post task request
app.post("/tasks", authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.userId });
  await task.save();
  res.json(task);
});
//delete task request
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  await Task.findoneAndDelet({ _id: req.params.id, userId });
  res.json({ mesage: "task deleted" });
});
//update status
app.patch("/tasks/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const task = await Task.findoneAndupdate(
    {
      _id: req.params.id,
      userId: req.userId,
    },
    {
      status,
    },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "task does not exist " });
  res.json(task);
});

app.patch("/tasks/:id/priority", authMiddleware, async (req, res) => {
  const { priority } = req.body;
  const task = await Task.findoneAndUpdate(
    {
      _id: req.params.id,
      userId: userId,
    },
    { priority },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "task not found" });
  res.json(task);
});

app.listen(port, () => console.log("server is running on port:8080"));


