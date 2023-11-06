const User = require("../Models/UserForm");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
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
      console.log("UnRegisterd User");
      return res.status(403).send({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      console.log("Incorrect password");
    } else if (isMatch) {
      console.log("User Logged Successfully");
      return res.status(209).send({ message: "User Logged Successfully" });
    }
  } catch (error) {
    console.log("Error Occurred" + " " + error);
    return res.status(402).send({ message: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Not a user");
      return res.status(406).send({ message: "User not found" });
    }

    const token = Math.random().toString(36).slice(-8);

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
<a href="http://localhost:4000/resetPassword/${token}">Click here </a>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Failed to send reset password email" });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "Reset password email sent" });
    });
  } catch (error) {
    console.log("Error Occurred" + " " + error);
    return res.status(402).send({ message: "Internal Server Error" });
  }
}
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body; // Assuming the token is in the request body

    // Find the user based on the token (you may need to adjust your data model)
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      console.log("User not found or invalid token");
      return res
        .status(404)
        .send({ message: "User not found or invalid token" });
    }

    // Generate a new hashed password for the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;

    // Clear the reset token (assuming you store it in your data model)
    user.resetToken = null;

    // Save the user's updated information
    await user.save();

    console.log("Password reset successfully");
    return res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error Occurred: " + error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
