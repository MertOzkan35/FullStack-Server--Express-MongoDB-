const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    Euser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Estatus: {
      type: String,
      enum: ["Available", "NotAvailable", "OnDuty", "Deleted"],
      default: "NotAvailable",
      required: true,
    },
    Eorders: [
      {
        EorderId: {
          type: Schema.Types.ObjectId,
          ref: "Order",
        },
        EorderTotal: {
          type: Number,
        },
        EorderPhoneNumber: {
          type: Number,
        },
        EorderAddress: {
          houseName: {
            type: String,
          },
          streetName: {
            type: String,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
