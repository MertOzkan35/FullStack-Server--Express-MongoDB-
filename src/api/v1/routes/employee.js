const express = require("express");
const router = express.Router();

const {
  getEmployeeUserById,
  getEmployeeById,
  createEmployee,
  getEmployee,
  getAllEmployees,
  updateEmployeeStatus,
  deleteEmployee,
  countEmployers,
  getEmployeeUserByEmail,
  getAllDeliveries,
  getCountDeliveries,
  getCountNewDeliveries,
  getEmployeeStatus,
  addEmplyeeOrder,
} = require("../controllers/employee");
const {
  isSignedIn,
  isAuthenticated,
  isEmployee,
  isAdmin,
} = require("../controllers/auth");
const { getUserById, updateUserRole } = require("../controllers/user");
const {
  updateOrderEmployee,
  getOrderById,
} = require("../controllers/order");

// middleware
router.param("userId", getUserById);
router.param("employeeUserId", getEmployeeUserById);
router.param("employeeUserEmail", getEmployeeUserByEmail);
router.param("employeeId", getEmployeeById);
router.param("orderId", getOrderById);

// routes

// create employee
// @type POST
// @route /api/v1/employee/create/:employeeUserEmail/:userId
// @desc route to create employee
// @access PRIVATE
router.post(
  "/employee/create/:employeeUserEmail/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateUserRole,
  createEmployee
);

// getEmployee
// @type GET
// @route /api/v1/employee/:employeeId/:userId
// @desc route to get employee by userId
// @access PRIVATE
router.get(
  "/employee/:employeeId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getEmployee
);

// getAllEmployees
// @type GET
// @route /api/v1/employee/:status/:userId
// @desc route to get all employees withrespect to their status
// @access PRIVATE
router.get(
  "/employees/:status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllEmployees
);

// updateEmployeeStatus
// @type PUT
// @route /api/v1/employee/updateemployeestatus/:employeeUserId/:userId
// @desc route to update employee status by employee by employeeUserId
// @access PRIVATE
router.put(
  "/employee/updateemployeestatus/:employeeUserId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  updateEmployeeStatus
);

// addEmployeeOrder
// @type POST
// @route /api/v1/employee/addemployeeorder/:employeeId/:orderId/:userId
// @desc route to add delivery order into employee by employeeId
// @access PRIVATE
router.post(
  "/employee/addemployeeorder/:employeeId/:orderId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateOrderEmployee,
  addEmplyeeOrder
);

// deleteEmployee
// @type DELETE
// @route /api/v1/employee/:employeeId/:userId
// @desc route to delete employee by employeeId
// @access PRIVATE
router.delete(
  "/employee/:employeeId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteEmployee
);

// countEmployee
// @type GET
// @route /api/v1/employers/countemployers/:userId
// @desc route to count all employers
// @access PRIVATE
router.get(
  "/employers/countemployers/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  countEmployers
);

// getAllDelveries
// @type GET
// @route /api/v1/employee/alldeliveries/:employeeUserId/:userId
// @desc route to get all delivery orders of employee by employeeUserId
// @access PRIVATE
router.get(
  "/employee/alldeliveries/:employeeUserId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  getAllDeliveries
);

// getCountDeliveries
// @type GET
// @route /api/v1/employee/countdeliveries/:employeeUserId/:userId
// @desc route to count all delivery orders of employee by employeeUserId
// @access PRIVATE
router.get(
  "/employee/countdeliveries/:employeeUserId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  getCountDeliveries
);

// getCountDeliveries
// @type GET
// @route /api/v1/employee/countnewdeliveries/:employeeUserId/:userId
// @desc route to count new delivery orders of employee by employeeUserId
// @access PRIVATE
router.get(
  "/employee/countnewdeliveries/:employeeUserId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  getCountNewDeliveries
);

// getEmployeeStatus
// @type GET
// @route /api/v1/employee/status/:employeeUserId/:userId
// @desc route to get employee status by employeeUserId
// @access PRIVATE
router.get(
  "/employee/status/:employeeUserId/:userId",
  isSignedIn,
  isAuthenticated,
  isEmployee,
  getEmployeeStatus
);

module.exports = router;
