const express = require("express");
const router = express.Router();

const {
  getUserById,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  addToUserCart,
  updateFromUserCart,
  deleteFromUserCart,
  changePassword,
  getUserCart,
  countCustomers,
  getUserOrders,
  getCustomers,
} = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

// params
router.param("userId", getUserById);

// routes

// getUser
// @type GET
// @route /api/v1/user/:userId
// @desc route to get user By userID
// @access PRIVATE
router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);

// getUserCart
// @type GET
// @route /api/v1/user/cart/:userId
// @desc route to get userCart by userID
// @access PRIVATE
router.get("/user/cart/:userId", isSignedIn, isAuthenticated, getUserCart);

// getAllUsers
// @type GET
// @route /api/v1/user/allusers/:userId
// @desc route to get all users
// @access PRIVATE
router.get(
  "/user/allusers/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllUsers
);

// updateUser
// @type PUT
// @route /api/v1/user/:userId
// @desc route to update user by userId
// @access PRIVATE
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);

// changePassword
// @type PUT
// @route /api/v1/user/password/:userId
// @desc route to change password by userId
// @access PRIVATE
router.put(
  "/user/password/:userId",
  isSignedIn,
  isAuthenticated,
  changePassword
);

// deleteUser
// @type DELETE
// @route /api/v1/user/:customerId/:userId
// @desc route to delete user by customerId
// @access PRIVATE
router.delete(
  "/user/:customerId/:userId",
  isSignedIn,
  isAuthenticated,
  deleteUser
);

// countCustomers
// @type GET
// @route /api/v1/users/countcustomers/:userId
// @desc route to count total customers
// @access PRIVATE
router.get(
  "/users/countcustomers/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  countCustomers
);

// addtousercart
// @type POST
// @route /api/v1/user/addtocart/:userId
// @desc route to add product to userCart by userId
// @access PRIVATE
router.post(
  "/user/addtocart/:userId",
  isSignedIn,
  isAuthenticated,
  addToUserCart
);

// updateusercart
// router.put("/user/cart/:userId", isSignedIn, isAuthenticated, updateQuantity)

// updateFromUserCart
// @type POST
// @route /api/v1/user/updatecart/:userId
// @desc route to update user cart by userId
// @access PRIVATE
router.post(
  "/user/updatecart/:userId",
  isSignedIn,
  isAuthenticated,
  updateFromUserCart
);

// deleteFromUserCart
// @type POST
// @route /api/v1/user/deletecart/:userId
// @desc route to product from userCart by userId
// @access PRIVATE
router.post(
  "/user/deletecart/:userId",
  isSignedIn,
  isAuthenticated,
  deleteFromUserCart
);

// getUserOrders
// @type GET
// @route /api/v1/user/orders/:userId
// @desc route to get all orders of user by id
// @access PRIVATE
router.get("/user/orders/:userId", isSignedIn, isAuthenticated, getUserOrders);

// getCustomers
// @type GET
// @route /api/v1/user/customers/:userId
// @desc route to get all customers
// @access PRIVATE
router.get(
  "/user/customers/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getCustomers
);

module.exports = router;
