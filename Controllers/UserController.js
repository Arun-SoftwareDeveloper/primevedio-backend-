const User = require("../Models/UserForm");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Import the 'crypto' library for secure token generation

async function registerUser(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(400).send({ message: "User already exists" });
    }

    // Check if a valid password is provided
    if (!password) {
      console.log("Password is required");
      return res.status(400).send({ message: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(200).send({ message: "User Registered Successfully" });
  } catch (error) {
    console.log("Error Occurred: " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      console.log("Unregistered User");
      return res.status(403).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(403).send({ message: "Incorrect password" });
    }

    console.log("User Logged Successfully");
    return res.status(200).send({ message: "User Logged Successfully" });
  } catch (error) {
    console.log("Error Occurred: " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Not a user");
      return res.status(404).send({ message: "User not found" });
    }

    const token = crypto.randomBytes(16).toString("hex"); // Generate a secure random token

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "arunramasamy46@gmail.com",
        pass: "pruxtxnekznczdpc",
      },
    });

    const mailOptions = {
      from: "arunramasamy46@gmail.com",
      to: user.email,
      subject: "Reset your password",
      html: `<h1>Hello ${user.firstName}</h1>
    <p>Here is your reset token: ${token}</p>
<a href="http://localhost:4000/resetPassword">Click here </a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "Failed to send reset password email" });
      }

      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "Reset password email sent" });
    });
  } catch (error) {
    console.log("Error Occurred: " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

const crypto = require("crypto");

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    // Find the user based on the token
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if the token has expired (you can set an expiration date in your database)
    if (user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null; // Clear the reset token
    user.resetTokenExpires = null; // Clear the token expiration

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error Occurred: " + error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
