const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  const { name, email, phoneNumber, password, address } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password,
      address,
    });
    await user.save();
    user.encry_password = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;
    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Failed to create a user in DB",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    if (await user.authenticate(password)) {
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);
      // res.cookie("token", token, { expires: new Date() + 9999 });

      const { _id, name, email, role } = user;

      return res.json({ token, user: { _id, name, email, role } });
    }

    return res.status(400).json({
      error: "Invalid email or password",
    });
  } catch (error) {
    return res.status(400).json({
      error: "Invalid email or password",
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully",
  });
};

exports.forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Invalid email",
      });
    }
    const secret = process.env.SECRET + user.encry_password;
    const payload = {
      email: user.email,
      id: user._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost:3000/resetpassword/${user.id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aashiq5342@gmail.com",
        pass: "mwkrpgmjakpjemrc",
      },
    });

    var mailOptions = {
      from: "aashiq5342@gmail.com",
      // to: email,
      to: "aashiq5342@gmail.com",
      subject: "Password Reset (FreshFromFarm)",
      html: `<h1>Password Reset</h1> 
      <h3>Link to reset your FreshFromFarm password</h3>
      <br />
      <a href=${link}>${link}</a>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).json({ error: "Internal error" });
      } else {
        return res
          .status(200)
          .json({ message: "Reset email send successfully" });
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { userId, token } = req.params;

  try {
    const user = await User.findById({ _id: userId });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }
    console.log("user", user)
    const secret = process.env.SECRET + user.encry_password;
    const payload = jwt.verify(token, secret);
    console.log(payload);

    if (payload.email !== user.email || payload.id != user._id) {
      return res.status(401).json({
        error: "token failure",
      });
    }
    const updatedPassordEncry = await user.securePassword(password);
    if (updatedPassordEncry) {
      const userDetail = await User.findByIdAndUpdate(
        { _id: req.profile._id },
        { $set: { encry_password: updatedPassordEncry } },
        { new: true, useFindAndModify: false }
      );
      await userDetail.save();
      console.log("password updation successfull");
      return res.json({
        message: "Password updation successfull",
      });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      error: "Internal error",
    });
  }
};

// isSignedIN
exports.isSignedIn = expressJWT({
  secret: process.env.SECRET,
  algorithms: ["HS256"],
  userProperty: "user",
});

// isAuthenticated
exports.isAuthenticated = (req, res, next) => {
  const checker = req.profile && req.user && req.profile._id == req.user._id;
  if (!checker) {
    return res.status(403).json({
      message: "Authentication failed",
    });
  }
  next();
};

// isAdmin
exports.isAdmin = (req, res, next) => {
  if (req.profile.role !== 2) {
    return res.status(403).json({
      message: "You are not admin, Access denied",
    });
  }
  next();
};

// isEmployee
exports.isEmployee = (req, res, next) => {
  if (req.profile.role !== 1) {
    return res.status(403).json({
      message: "You are not employee, Access denied",
    });
  }
  next();
};

// isCustomer
exports.isCustomer = (req, res, next) => {
  if (req.profile.role !== 0) {
    return res.status(403).json({
      message: "You are not custoer, Access denied",
    });
  }
  next();
};
