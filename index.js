import express from "express";
import mongoose from "mongoose";
import User from "./model/User.js";
import cron from "node-cron";

const app = express();
const PORT = 3000;

let message_cron = "Cron Job not started yet.....!!";

mongoose
  .connect("mongodb://localhost:27017/practiceMongoD")
  .then(() => console.log("✅ Connected to MongoDB Database"))
  .catch((error) => console.error("❌ MongoDB connection error:", error));

cron.schedule("* * * * *", () => {
  message_cron = `Cron Job ran @ : ${new Date().toLocaleTimeString()}`;
  console.log(message_cron);
});

app.use(express.json());

app.get("/check-cron", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: message_cron,
    });
  } catch (error) {
    console.log("Some error in cron job arises.....!", error.message);
  }
});

app.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfullyy.....",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/allUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(201).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.delete("/delete/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const deleted = await User.findOneAndDelete({ name });
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "User not found...",
      });
    }
    res.status(201).json({
      success: true,
      message: "User deleted successfully....",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/update/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User with this email does not exists.....!!!",
      });
    }
    const updateUser = await User.findOneAndUpdate(
      { email },
      { name },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User name updated successfully......",
      user: updateUser,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is runnning at PORT ${PORT}`);
});
