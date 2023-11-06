const express = require("express");
const UserController = require("../Controllers/UserController");
const app = express();

const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/forgotPassword", UserController.forgotPassword);
router.post("/resetPassword", UserController.resetPassword);

module.exports = router;
