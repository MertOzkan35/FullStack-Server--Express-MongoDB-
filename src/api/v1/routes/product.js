const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  getProductById,
  createProduct,
  getProduct,
  updateProduct,
  updateProductWithImage,
  deleteProduct,
  getAllProducts,
  photo,
  countProducts,
  productSearch
} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

var upload = multer({ dest: "uploads/" });

// param
router.param("userId", getUserById);
router.param("productId", getProductById);

// routes
// createProduct
// @type POST
// @route /api/v1/product/create/:userId
// @desc route to create product
// @access PRIVATE
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  upload.single("pImg"),
  createProduct
);

// getProduct
// @type GET
// @route /api/v1/product/:productId
// @desc route to get product by productId
// @access PUBLIC
router.get("/product/:productId", getProduct);

// updateProduct
// @type PUT
// @route /api/v1/product/:productId/:userId
// @desc route to update product by productId
// @access PRIVATE
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

// updateProductWithImage
// @type PUT
// @route /api/v1/product/updateproductwithimage/:productId/:userId
// @desc route to update product with produt image by productId
// @access PRIVATE
router.put(
  "/product/updateproductwithimage/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  upload.single("pImg"),
  updateProductWithImage
);

// deleteProduct
// @type DELETE
// @route /api/v1/product/:productId/:userId
// @desc route to delete product by productId
// @access PRIVATE
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

// getAllProducts
// @type GET
// @route /api/v1/products/:category
// @desc route to get all products
// @access PUBLIC
router.get("/products/:category", getAllProducts);

// getProductPhoto
// @type GET
// @route /api/v1/product/photo/:key
// @desc route to get product photo by product key
// @access PRIVATE
router.get("/product/photo/:key", photo);

// countProducts
// @type GET
// @route /api/v1/products/countproducts/:userId
// @desc route to count all products
// @access PRIVATE
router.get(
  "/products/countproducts/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  countProducts
);

// productSearch
// @type GET
// @route /api/v1/productsearch
// @desc route to search all products
// @access PRIVATE
router.get("/productsearch", productSearch);

module.exports = router;
