const User = require("../models/user");
const Order = require("../models/order");

// getUserById- Middleware
exports.getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findById({ _id: id });
    req.profile = user;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "User by this id not found in the DB",
    });
  }
};

// updateUserRole- Middleware
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.employeeUser._id },
      { $set: { role: 1 } },
      { new: true, useFindAndModify: false }
    );
    await user.save();
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Updating user role failed",
    });
  }
};

// addToUserCart
exports.addToUserCart = async (req, res) => {
  try {
    const response = await User.findById({ _id: req.profile._id }, "cart");

    cart = response.cart;

    console.log("cart", cart);

    const { productId, quantity } = req.body;

    console.log("cartLength", cart.length);

    if (cart.length === 0) {
      cart.push({ product: productId, quantity: quantity });
      await User.findByIdAndUpdate(
        { _id: req.profile._id },
        {
          $set: {
            cart: {
              product: productId,
              quantity: quantity,
            },
          },
        },
        { new: true, useFindAndModify: false }
      );
      return res.json({
        message: "Successfully added to cart 1",
      });
    }

    const cartItem = cart.some((cartItem) => cartItem.product == productId);

    if (cartItem) {
      cart.map(async (cartItem) => {
        if (cartItem.product == productId) {
          cartItem.quantity = parseInt(cartItem.quantity) + parseInt(quantity);
          console.log("reacher here");

          await User.findByIdAndUpdate(
            { _id: req.profile._id },
            { $set: { cart } },
            { new: true, useFindAndModify: false }
          );

          return res.json({
            message: "Successfully added to cart 2",
          });
        }
      });
    } else {
      cart.push({
        product: productId,
        quantity: quantity,
      });

      await User.findByIdAndUpdate(
        { _id: req.profile._id },
        { $set: { cart } },
        { new: true, useFindAndModify: false }
      );

      return res.json({
        message: "Successfully added to cart 3",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Adding to cart failed",
    });
  }
};

// updateFromUserCart
exports.updateFromUserCart = async (req, res) => {
  try {
    response = await User.findById({ _id: req.profile._id }, "cart");

    cart = response.cart;

    cart.map((cartItem) => {
      if (cartItem.product == req.body.productId) {
        cartItem.quantity = req.body.quantity;
      }
    });

    await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: { cart } },
      { new: true, useFindAndModify: false }
    );

    return res.json({
      message: "Successfully updated from cart",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Updating from cart failed",
    });
  }
};

// deleteFromUserCart
exports.deleteFromUserCart = async (req, res) => {
  try {
    response = await User.findById({ _id: req.profile._id }, "cart");

    cart = response.cart;

    cart = cart.filter((cartItem) => cartItem.product != req.body.productId);

    await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: { cart } },
      { new: true, useFindAndModify: false }
    );

    return res.json({
      message: "Successfully deleted from cart",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Deleting from cart failed",
    });
  }
};

// getUser
exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;

  return res.json(req.profile);
};

// getUserCart
exports.getUserCart = async (req, res) => {
  try {
    var response = await User.findById(
      { _id: req.profile._id },
      { cart: 1 }
    ).populate("cart.product");
    res.json(response);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      message: "Fetching cart failed",
    });
  }
};

// getAllUsers
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return res.json({
      message: "No users found in DB",
    });
  }
};

// updateUser
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    );
    await user.save();
    return res.json({
      message: "User updation successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "User updation failed",
    });
  }
};

// changePassword
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: req.profile.email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    if (!(await user.authenticate(oldPassword))) {
      return res.status(400).json({
        error: "Invalid old Password",
      });
    }

    const updatedPassordEncry = await user.securePassword(newPassword);
    if (updatedPassordEncry) {
      const userDetail = await User.findByIdAndUpdate(
        { _id: req.profile._id },
        { $set: { encry_password: updatedPassordEncry } },
        { new: true, useFindAndModify: false }
      );
      await userDetail.save();
      return res.json({
        message: "Password updation successfull",
      });
    }

    return res.status(400).json({
      error: "Password updation failed",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      error: "Invalid request",
    });
  }
};

// deleteUser
exports.deleteUser = async (req, res) => {
  const { customerId } = req.params;
  console.log("CustomerId", customerId);
  try {
    await User.deleteOne({ _id: customerId });

    return res.json({
      message: "User successfully deleted from DB",
    });
  } catch (error) {
    return res.status(400).json({
      message: "User deletion failed",
    });
  }
};

// getUserOrders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ Ouser: req.profile._id });
    if (!orders) {
      return res.status(400).json({
        message: "No orders for this user",
      });
    }

    return res.json(orders);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Order retriving failed",
    });
  }
};

// countCustomers
exports.countCustomers = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "0" });
    return res.json(count);
  } catch (error) {
    return res.status(400).json("Failed to count customers");
  }
};
// exports.countCustomers = async (req, res) => {
//   try {
//     const count = await User.countDocuments({ role: "0" });
//     return count;
//   } catch (error) {
//     return "";
//   }
// };

// getCustomers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "0" }).populate("orders");
    return res.json(customers);
  } catch (error) {
    return res.status(400).json("Failed to get customers");
  }
};

// getCustomers
// exports.getCustomers = async () => {
//   try {
//     const customers = await User.find({ role: "0" }).populate("orders");
//     return customers;
//   } catch (error) {
//     return "";
//   }
// };
