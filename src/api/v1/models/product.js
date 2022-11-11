const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    pName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    pDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    pImg: {
      ETag: {
        type: String,
      },
      Location: {
        type: String,
      },
      key: {
        type: String,
      },
      Bucket: {
        type: String,
      },
    },
    pPrice: {
      type: Number,
      required: true,
    },
    pSold: {
      type: Number,
      default: 0,
    },
    pStock: {
      type: Number,
    },
    pCategory: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
