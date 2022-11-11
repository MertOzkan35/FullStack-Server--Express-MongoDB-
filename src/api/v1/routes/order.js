const express = require("express");
const router = express.Router();

const {
  getOrderById,
  createOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  updateOrder,
  razorPayOrder,
  paymentVerify,
  countOrders,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/order");
const { getUserById } = require("../controllers/user");
const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
  isEmployee,
} = require("../controllers/auth");
const { updateStock } = require("../controllers/product");

// param
router.param("userId", getUserById);
router.param("orderId", getOrderById);

// routes

// create order
// @type POST
// @route /api/v1/order/create/:userId
// @desc route to create order
// @access PRIVATE
router.post(
  "/order/create/:userId",
  isSignedIn,
  isAuthenticated,
  updateStock,
  createOrder
);

// getOrder
// @type GET
// @route /api/v1/order/:orderId/:userId
// @desc route to get order by orderId
// @access PRIVATE
router.get("/order/:orderId/:userId", isSignedIn, isAuthenticated, getOrder);

// getAllOrders
// @type GET
// @route /api/v1/orders/:status/:userId
// @desc route to get all orders by status
// @access PRIVATE
router.get(
  "/orders/:status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrders
);

// deleteOrder
// @type DELETE
// @route /api/v1/order/:orderId/:userId
// @desc route to delete order by orderId
// @access PRIVATE
router.delete(
  "/order/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteOrder
);

// AdminUpdateOrderStatus
// @type PUT
// @route /api/v1/order/adminupdateorderstatus/:orderId/:userId
// @desc route to update order staus for admin by orderId
// @access PRIVATE
router.put(
  "/order/adminupdateorderstatus/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateOrderStatus
);

// AdminUpdatePaymentStatus
// @type PUT
// @route /api/v1/order/adminupdatepaymentstatus/:orderId/:userId
// @desc route to update order payment staus for admin by orderId
// @access PRIVATE
router.put(
  "/order/adminupdatepaymentstatus/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updatePaymentStatus
);

// EmployeeUpdateOrderStatus
// @type PUT
// @route /api/v1/order/employeeupdateorderstatus/:orderId/:userId
// @desc route to update order staus for employee by orderId
// @access PRIVATE
router.put(
  "/order/employeeupdateorderstatus/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  updateOrderStatus
);

// EmployeeUpdatePaymentStatus
// @type PUT
// @route /api/v1/order/employeeupdatepaymentstatus/:orderId/:userId
// @desc route to update order payment staus for employee by orderId
// @access PRIVATE
router.put(
  "/order/employeeupdatepaymentstatus/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  updatePaymentStatus
);

// updateOrderConfirmation
// @type PUT
// @route /api/v1/order/orderconfirmation/:orderId/:userId
// @desc route to update order confirmation by orderId
// @access PRIVATE
router.put(
  "/order/orderconfirmation/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  updateOrder
);

// countOrders
// @type GET
// @route /api/v1/order/orders/countorders/:userId
// @desc route to count all orders
// @access PRIVATE
router.get(
  "/order/orders/countorders/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  countOrders
);

// razorPayOrder
// @type POST
// @route /api/v1/order/razorpayorder
// @desc route to razorpay order
// @access PRIVATE
router.post("/order/razorpayorder", razorPayOrder);

// payment Verify
// @type POST
// @route /api/v1/order/verify
// @desc route to verify payment
// @access PRIVATE
router.post("/order/verify", paymentVerify);

module.exports = router;
