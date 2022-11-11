const Product = require("../models/product");
const User = require("../models/user");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const { uploadFile, getFileStream } = require("../s3");

// createProduct
exports.createProduct = async (req, res) => {
  try {
    var obj = {
      pName: req.body.pName,
      pDescription: req.body.pDescription,
      pPrice: req.body.pPrice,
      pStock: req.body.pStock,
      pCategory: req.body.pCategory,
    };
    const product = await Product.create(obj);
    await product.save();

    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file.path);

    await Product.findByIdAndUpdate(
      { _id: product._id },
      {
        $set: {
          pImg: {
            Etag: result.Etag,
            Location: result.Location,
            key: result.key,
            Bucket: result.Bucket,
          },
        },
      },
      { new: true, useFindAndModify: false }
    );

    // setValues();

    return res.json(result);
  } catch (error) {
    console.log("Error Message", error.message);
    return res.status(400).json({
      message: "Failed to create a product in DB",
    });
  }
};

// getProductById
exports.getProductById = async (req, res, next, id) => {
  try {
    const product = await Product.findById({ _id: id });
    req.product = product;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Failed to find the product from DB",
    });
  }
};

// getProduct
exports.getProduct = async (req, res) => {
  try {
    await res.json(req.product);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to get the product from DB",
    });
  }
};

// updateProduct
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      { _id: req.product._id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    );
    await product.save();
    return res.json({
      message: "Product updation successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update the product from DB",
    });
  }
};

// updateProductWithImage
exports.updateProductWithImage = async (req, res) => {
  try {
    var obj = {
      pName: req.body.pName,
      pDescription: req.body.pDescription,
      pPrice: req.body.pPrice,
      pStock: req.body.pStock,
      pCategory: req.body.pCategory,
    };
    // const product = await Product.create(obj);
    // await product.save();

    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file.path);

    obj["pImg"] = {
      Etag: result.Etag,
      Location: result.Location,
      key: result.key,
      Bucket: result.Bucket,
    };

    await Product.findByIdAndUpdate(
      { _id: req.product._id },
      {
        $set: obj,
      },
      { new: true, useFindAndModify: false }
    );

    return res.json("updated succesfully");
  } catch (error) {
    console.log("Error Message", error.message);
    return res.status(400).json({
      message: "Failed to create a product in DB",
    });
  }
};

// deleteProduct
exports.deleteProduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.product._id });

    return res.json({
      message: "Product deleted successfully from Db",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to Delete product from DB",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const category = req.params.category;

    if (category === "all") {
      const products = await Product.find({});
      return res.json(products);
    }

    const products = await Product.find({ pCategory: category }, {});
    return res.json(products);
  } catch (error) {
    return res.json({
      message: "No users found in DB",
    });
  }
};
exports.getAllProductsWebSocket = async (category) => {
  try {
    if (category === "all") {
      const products = await Product.find({});
      return products;
    }

    const products = await Product.find({ pCategory: category }, {});
    return products;
  } catch (error) {
    return "";
  }
};

exports.getAllCategoryProducts = async (req, res) => {
  try {
    const products = await Product.find({ pCategory: req.product.pCategory });
    return res.json(products);
  } catch (error) {
    return res.json({
      message: "No products found in DB",
    });
  }
};

// updateStock-middleware
exports.updateStock = async (req, res, next) => {
  const response = await User.findById(
    { _id: req.profile._id },
    "cart"
  ).populate("cart.product");
  cart = response.cart;

  let myoperations = cart.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod.product },
        update: { $inc: { pStock: -prod.quantity, pSold: +prod.quantity } },
      },
    };
  });

  Product.bulkWrite(myoperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed",
      });
    }
    next();
  });
};

// countProducts
exports.countProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    return res.json(count);
  } catch (error) {
    return res.status(400).json("Failed to count Products");
  }
};

// exports.countProducts = async () => {
//   try {
//     const count = await Product.countDocuments();
//     return count;
//   } catch (error) {
//     // return res.status(400).json("Failed to count Products");
//     return "";
//   }
// };

exports.productSearch = async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    let sort = req.query.sort || "default";
    let category = req.query.category || "all";

    const categories = ["fruit", "vegetable"];

    category === "all"
      ? (category = [...categories])
      : (category = req.query.category.split(","));

    req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

    let sortBy = {};
    if (sort[1]) {
      sortBy[sort[0]] = sort[1];
    } else {
      sortBy[sort[0]] = "asc";
    }

    const products = await Product.find({
      pName: { $regex: search, $options: "i" },
    })
      .where("pCategory")
      .in([...category])
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);

    const total = await Product.countDocuments({
      category: { $in: [...category] },
      pName: { $regex: search, $options: "i" },
    });

    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      categories,
      products,
    };

    res.status(200).json(response);
  } catch (error) {
    return res.status(400).json("Failed to search Products");
  }
};

// middleware
exports.photo = (req, res) => {
  const key = req.params.key;

  const readStream = getFileStream(key);
  readStream.pipe(res);
};
