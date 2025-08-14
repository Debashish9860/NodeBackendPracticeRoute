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

//Cron job for showing minutes and to delete the user older than 7 days
cron.schedule("* * * * *", async () => {
  message_cron = `Cron Job ran @ : ${new Date().toLocaleTimeString()}`;
  console.log(message_cron);

  const cutOffDate = new Date();
  cutOffDate.setDate(cutOffDate.getDate() - 7);

  try {
    const deleted = await User.deleteMany({ createdAt: { $lt: cutOffDate } });
    if (deleted.deletedCount > 0) {
      console.log(
        `🗑 Deleted ${
          deleted.deletedCount
        } old users at ${new Date().toLocaleTimeString()}`
      );
      F;
    }
  } catch (error) {
    console.log("Error deleting old users:", error);
  }
});

app.use(express.json());

//Cron job route for checking in postman
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

//To add the user
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

//To get all the users
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

//Delete the user by name
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

//Update the user name by using email to find
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

//Delete all exisiting user data
app.post("/deleteAllUser", async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All user deleted successfully....!!!",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

//Get all user greater than give age in url
app.get("/userGreaterThanAge/:age", async (req, res) => {
  try {
    const { age } = req.params;
    const users = await User.find({ age: { $gt: age } });
    if (!users) {
      res.status(404).json({
        success: false,
        message: `No user found of age greater than ${age}`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Users Found....!!!",
      users,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

//Get first user or given email
app.get("/getFirstUser/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No user found ....!!!!",
      });
    }

    res.status(200).json({
      success: true,
      message: "First Users Found....!!!",
      user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

//Get users created in last 7 days
app.get("/getUserofSevenDays", async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const users = await User.find({ createdAt: { $gte: lastWeek } });
    if (!users) {
      res.status(404).json({
        success: false,
        message: "No user found ....!!!!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Found users of last 7 days....",
      users,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

//Get user sort by age in ascending order
app.get("/getUserSoretdAsce", async (req, res) => {
  try {
    const users = await User.find().sort({ age: 1 });
    if (!users) {
      res.status(404).json({
        success: false,
        message: "No user found ....!!!!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Found users sorted by age in ascending order...",
      users,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

//Total User count
app.get("/getUserCount", async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (!count) {
      res.status(404).json({
        success: false,
        message: "No user found ....!!!!",
      });
    }
    res.status(200).json({
      success: true,
      message: `Total users are ${count}`,
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
