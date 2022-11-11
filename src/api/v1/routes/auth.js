const express= require('express');
const router= express.Router();

const {signup, login, logout, forgotpassword, resetPassword} = require('../controllers/auth');
const { getUserById } = require('../controllers/user');

// params
router.param("userId", getUserById);

//signup
// @type POST
// @route /api/v1/signup
// @desc route to signup
// @access PUBLIC
router.post('/signup', signup);

//login
// @type POST
// @route /api/v1/login
// @desc route to login for all customers, employee and admin
// @access PUBLIC
router.post('/login', login);

//logout
// @type GET
// @route /api/v1/logout
// @desc route to logout for all customers, employee and admin
// @access PUBLIC
router.get('/logout', logout);

// forgotpassword
// @type POST
// @route /api/v1/forgotpassword
// @desc route to verify email for reseting password
// @access PUBLIC
router.post('/forgotpassword', forgotpassword);

// resetpassword
// @type POST
// @route /api/v1/resetpassword
// @desc route to reset password
// @access PRIVATE
router.post('/resetpassword/:userId/:token', resetPassword);

module.exports = router;