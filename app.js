const dotenv = require("dotenv");
dotenv.config();

const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const port = process.env.PORT || 8000;

// Middlewares
app.use(
  bodyParser.urlencoded({
    extended: false, 
  })
);
app.use(express.static("static"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//DB connection
mongoose.connect(process.env.DATABASE, {}).then(() => {
  console.log("DB connected");
});

// routes
const authRoute = require("./src/api/v1/routes/auth");
const userRoute = require("./src/api/v1/routes/user");
const employeeRoute = require("./src/api/v1/routes/employee");
const productRoute = require("./src/api/v1/routes/product");
const orderRoute = require("./src/api/v1/routes/order");
// const {
//   countOrders,
//   getAllOrdersWebSocket,
// } = require("./src/api/v1/controllers/order");
// const {
//   countProducts,
//   getAllProductsWebSocket,
// } = require("./src/api/v1/controllers/product");
// const {
//   countEmployers,
//   getAllEmployeesWebSocket,
// } = require("./src/api/v1/controllers/employee");
// const {
//   countCustomers,
//   getCustomers,
// } = require("./src/api/v1/controllers/user");

// My routes
app.use("/api/v1/", authRoute);
app.use("/api/v1/", userRoute);
app.use("/api/v1/", productRoute);
app.use("/api/v1/", orderRoute);
app.use("/api/v1/", employeeRoute);

app.get("/", (req, res) => {
  res.send("revenew dipp");
});

// app.get("*", async (req, res) => {
//   res.sendFile(path.join(__dirname, "static/index.html"));
// });

app.listen(port, () => {
  console.log(`Server is running on : ${port}`);
});
