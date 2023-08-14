// here all module required

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const note = require("./models/note");
const User = require("./models/user");

const dcrypt = require("bcryptjs");

const { passwordStrength } = require("check-password-strength");

const app = express();
const port = process.env.PORT || 7000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// to connect mongoose  to localhost(db) and also create a database
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connection Successfully.....");
  })
  .catch((err) => {
    alert("there will be some error due to ", err);
  });

// all file access here
const static_file = path.join(__dirname, "./public");
const login_file = path.join(__dirname, "./public/login.html");
const signup_file = path.join(__dirname, "./public/signup.html");
const error_file = path.join(__dirname, "./public/404.html");

app.use(express.static(static_file));

app.get("/login", (req, res) => {
  res.sendFile(login_file);
});

app.get("/signup", (req, res) => {
  res.sendFile(signup_file);
});

app.get("/*", (req, res) => {
  res.sendFile(error_file);
});

app.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      const passcheck = await dcrypt.compare(req.body.password, user.password);
      if (passcheck) {
        res.status(201).json({
          success: true,
          user: { tokenkey: user.tokenkey, name: user.name },
          message: "Login successfully..",
        });
      } else {
        res.status(401).json({
          success: false,
          message: "password is not correct",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Email is not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error in login , Try after some time",
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    let checkpass = passwordStrength(req.body.password).value;
    if (checkpass == "Strong") {
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        if (req.body.password == req.body.cpassword) {
          let user = await User.create(req.body);
          let key = user.password;
          const tokenkey = await user.generatetokenkey(key);
          res.status(200).json({
            success: true,
            user: { tokenkey: user.tokenkey, name: user.name },
            message: "Signup Successfully...",
          });
        } else {
          res.status(401).json({
            success: false,
            message: "The password and confirm password is not match",
          });
        }
      } else {
        res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message:
          "pass is " +
          checkpass +
          " set strong pass which has lower & upper case, number & special char",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error in Registration , Try after some time",
    });
  }
});

app.post("/getnote", async (req, res) => {
  try {
    let notes = await note.find({ tokenkey: req.body.tokenkey });
    if (notes) {
      if (notes.length != 0) {
        res.status(200).json({
          success: true,
          notes,
          message: "Notes access successfully..",
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error in accessing notes , try after some times",
    });
  }
});

app.post("/addnote", async (req, res) => {
  try {
    let tokenkey = await User.findOne({ tokenkey: req.body.tokenkey });
    if (tokenkey) {
      let notes = await note.create(req.body);
      res
        .status(200)
        .json({ success: true, notes, message: "Notes Added Successfully..." });
    } else {
      res.status(401).json({
        success: false,
        message: "You are not valid user please login now",
      });
    }
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Error to adding notes , try after sometime",
    });
  }
});

app.post("/deletenote", async (req, res) => {
  try {
    let notes = await note.findByIdAndRemove(req.body.id);
    res
      .status(200)
      .json({ success: true, notes, message: "Notes deleted successfully.." });
  } catch (err) {
    res.status(500).json({
      success: false,
      notes,
      message: "Error to deleting notes , try after sometime",
    });
  }
});

app.listen(port, () => {
  console.log(` server listening on port http://localhost:${port}`);
});
