const Order = require("../models/order");
const User = require("../models/user");
const Employee = require("../models/employee");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");

// getOrderById - Middleware
exports.getOrderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById({ _id: id }).populate("Ouser");
    req.order = order;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      message: "failed to get id from DB",
    });
  }
};

// createOrder
exports.createOrder = async (req, res) => {
  try {
    const response = await User.findById(
      { _id: req.profile._id },
      "cart"
    ).populate("cart.product");
    cart = response.cart;

    const { shippingAddress, paymentMode } = req.body;

    if (!(shippingAddress || paymentMode || cart)) {
      return res.status(400).json({
        message: "Invalid Order request",
      });
    }

    var totalPrice = 0;
    var Oproducts = [];

    cart.map((cartItem) => {
      totalPrice = totalPrice + cartItem.product.pPrice * cartItem.quantity;

      Oproducts.push({
        pId: cartItem.product._id,
        pName: cartItem.product.pName,
        pDescription: cartItem.product.pDescription,
        pCategory: cartItem.product.pCategory,
        pPrice: cartItem.product.pPrice,
        pQuantity: cartItem.quantity,
        pAmount: cartItem.product.pPrice * cartItem.quantity,
      });
    });

    const order = await Order.create({
      Ouser: req.profile._id,
      Oproducts: Oproducts,
      OtotalPrice: totalPrice,
      Oaddress: {
        houseName: shippingAddress.shippingAddress_houseName,
        streetName: shippingAddress.shippingAddress_streetName,
      },
      Ostatus: "Not-Confirmed",
      OpaymentMode: paymentMode,
      OpaymentStatus: "Pending",
    });

    order.save();

    sendEmalUpdate(order, "createOrder");

    await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: { cart: [] } },
      { new: true, useFindAndModify: false }
    );

    const OrdersResponse = await User.findById(
      { _id: req.profile._id },
      "orders"
    );

    const orders = OrdersResponse.orders;

    orders.push(order._id);

    await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: { orders } },
      { new: true, useFindAndModify: false }
    );

    return res.json({ order, message: "created order succesfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      message: "Failed to create order in DB",
    });
  }
};

// plcae orders at razor pay
exports.razorPayOrder = async (req, res) => {
  try {
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      // amount: totalPrice * 100,
      amount: req.body.total * 100,
      currency: "INR",
      receipt: Date.now(),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong" });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    console.log("Error Message", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// payment verfiy
exports.paymentVerify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body.response;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Order.findByIdAndUpdate(
        { _id: req.body.order._id },
        {
          $set: {
            Ostatus: "Ordered",
            OpaymentStatus: "Paid",
            OpaymentId: razorpay_payment_id,
            OrazorPayOrderId: razorpay_order_id,
          },
        },
        { new: true, useFindAndModify: false }
      );
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "invalid signature sent!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// getOrder
exports.getOrder = (req, res) => {
  req.order.Ouser.encry_password = undefined;
  req.order.Ouser.salt = undefined;
  req.order.Ouser.createdAt = undefined;
  req.order.Ouser.updatedAt = undefined;
  return res.json(req.order);
};

// getAllOrders
exports.getAllOrders = async (req, res) => {
  try {
    const status = req.params.status;

    if (status === "pending") {
      const orders = await Order.find({
        $or: [{ Ostatus: "Ordered" }, { Ostatus: "Not-Confirmed" }],
      }).populate("Ouser");

      return res.json(orders);
    }

    if (status === "all") {
      const orders = await Order.find().populate("Ouser");

      return res.json(orders);
    }

    const orders = await Order.find({ Ostatus: status }).populate("Ouser");
    return res.json(orders);
  } catch (error) {
    return res.status(400).json({
      message: "No orders found in DB",
    });
  }
};

// getAllOrders
exports.getAllOrdersWebSocket = async (status) => {
  try {

    if (status === "pending") {
      const orders = await Order.find({
        $or: [{ Ostatus: "Ordered" }, { Ostatus: "Not-Confirmed" }],
      }).populate("Ouser");

      return orders;
    }

    if (status === "all") {
      const orders = await Order.find().populate("Ouser");

      return orders;
    }

    const orders = await Order.find({ Ostatus: status }).populate("Ouser");
    return res.json(orders);
  } catch (error) {
    return "";
  }
};

// deleteOrder
exports.deleteOrder = async (req, res) => {
  try {
    await Order.deleteOne(req.order._id);
    return res.json({
      message: "Order deletion successfull",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Deleting order failed",
    });
  }
};

// updateOrderStatus
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(
      { _id: req.order._id },
      { $set: { Ostatus: status } },
      { new: true, useFindAndModify: false }
    );

    const order = await Order.findById(req.order._id);
    sendEmalUpdate(order, "updateOrderStatus");

    if (status === ("Delivered" || "Cancelled")) {
      const { Eorders } = await Employee.findById(
        { _id: order.OemployeeId },
        "Eorders"
      ).populate("Eorders.EorderId");

      const EordersStatus = Eorders.some(
        (Eorder) => Eorder.EorderId.Ostatus !== ("Delivered" || "Cancelled")
      );

      if (EordersStatus === false) {
        await Employee.findByIdAndUpdate(
          { _id: order.OemployeeId },
          { $set: { Estatus: "Available" } },
          { new: true }
        );
      }
    }

    return res.json({
      message: "Order updated successfully",
    });
  } catch (error) {
    return res.json({
      message: "Updating order Status failed",
    });
  }
};

// updatePaymentStatus
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(
      { _id: req.order._id },
      { $set: { OpaymentStatus: status } },
      { new: true, useFindAndModify: false }
    );

    const order = await Order.findById(req.order._id);
    sendEmalUpdate(order, "updateOrderPaymentStatus");
    if (order.Ostatus === "Not-Confirmed") {
      await Order.findByIdAndUpdate(
        { _id: req.order._id },
        { $set: { Ostatus: "Ordered" } },
        { new: true, useFindAndModify: false }
      );
    }

    return res.json({
      message: "Order updated successfully",
    });
  } catch (error) {
    return res.json({
      message: "Updating payment Status failed",
    });
  }
};

// updateOrder
exports.updateOrder = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(
      { _id: req.order._id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    );

    res.json({
      message: "Order updated successfully",
    });
  } catch (error) {
    return res.json({
      message: "Updating order failed",
    });
  }
};

// countOrders
exports.countOrders = async (req, res) => {
  try {
    const count = await Order.countDocuments({});
    return res.json(count);
  } catch (error) {
    console.log(error.message);
    return res.json({
      message: "Counting orders failed",
    });
  }
};

// exports.countOrders = async () => {
//   try {
//     const count = await Order.countDocuments({});
//     return count;
//   } catch (error) {
//     return "";
//   }
// };

exports.updateOrderEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.employee._id).populate(
      "Euser"
    );
    await Order.findByIdAndUpdate(
      { _id: req.order._id },
      {
        $set: {
          OemployeeId: employee._id,
          OemployeeName: employee.Euser.name,
          OemployeePhoneNumber: employee.Euser.phoneNumber,
          Ostatus: "Processing",
        },
      },
      { new: true, useFindAndModify: false }
    );

    next();
  } catch (error) {
    console.log("ErrorMessageOrder", error.message);
    return res.status(400).json({
      message: "Failed to update order employee",
    });
  }
};

const sendEmalUpdate = async (order, type) => {
  const user = await User.findById(order.Ouser);

  const types = {
    createOrder: {
      subject: `Order Placed (FreshFromFarm) - ${order._id}`,
      content: `<h1>Order Placed Successfully (FreshFromFarm)</h1> 
      <h3>Your order - ${order._id}</h3>
      <br />
      <p>The order has been successfully placed - <b> ${order._id}</b> <p>
      <p>Order Status - ${order.Ostatus} <p>
      <p>Order Amount - ${order.OtotalPrice} <p>
      <p>Payment Mode - ${order.OpaymentMode} <p>
      <p>Payment Status - ${order.OpaymentStatus} <p>
      <h4>Order Address</h4>
      <p>HouseName - ${order.Oaddress.houseName}</p>
      <p>streetName - ${order.Oaddress.streetName}</p>
      `,
    },
    updateOrderStatus: {
      subject: `Order Status Update (FreshFromFarm) - ${order._id}`,
      content: `<h1>Order Status Update (FreshFromFarm)</h1> 
      <h3>Your order - ${order._id}</h3>
      <br />
      <p>The order status has been updated to - <b> ${order.Ostatus}</b> <p>
      <p>Order Amount - ${order.OtotalPrice} <p>
      <p>Payment Mode - ${order.OpaymentMode} <p>
      <p>Payment Status - ${order.OpaymentStatus} <p>
      <h4>Order Address</h4>
      <p>HouseName - ${order.Oaddress.houseName}</p>
      <p>streetName - ${order.Oaddress.streetName}</p>
      `,
    },
    updateOrderPaymentStatus: {
      subject: `Order Payment status Update (FreshFromFarm) - ${order._id}`,
      content: `<h1>Order Payment Status Update (FreshFromFarm)</h1> 
      <h3>Your order - ${order._id}</h3>
      <br />
      <p>The order payment status has been updated to - <b> ${order.OpaymentStatus}</b> <p>
      <p>Order Status - ${order.Ostatus} <p>
      <p>Order Amount - ${order.OtotalPrice} <p>
      <p>Payment Mode - ${order.OpaymentMode} <p>
      <h4>Order Address</h4>
      <p>HouseName - ${order.Oaddress.houseName}</p>
      <p>streetName - ${order.Oaddress.streetName}</p>
      `,
    },
  };

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "aashiq5342@gmail.com",
      pass: "mwkrpgmjakpjemrc",
    },
  });

  var mailOptions = {
    from: "aashiq5342@gmail.com",
    // to: user.email,
    to: "aashiq5342@gmail.com",
    subject: types[type].subject,
    html: types[type].content,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.status(500).json({ error: "Internal error" });
    } else {
      return res.status(200).json({ message: "Reset email send successfully" });
    }
  });
};
