const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");

dotenv.config();

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      res.status(400).json({
        mssg: "User account already existed.",
      });
      return;
    }
    const salt = 10;
    const hashedPass = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      password: hashedPass,
    });

    await user.save();

    res.status(201).json({
      mssg: "User Created successfully!",
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      mssg: "Something went wrong",
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });

    if (!user) return res.status(400).json({ mssg: "User not found." });

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword)
      return res.status(404).json({ mssg: "Password is incorrect!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      mssg: "User SignedIn Successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({
      mssg: "Something went wrong",
    });
  }
};

module.exports = { signIn, signUp };
