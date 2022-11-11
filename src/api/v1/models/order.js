const mongoose= require('mongoose');
const Schema= mongoose.Schema;

const orderSchema = new Schema({
    Ouser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    Oproducts: [
        {
            pId: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            pName: String,
            pDescription: String,
            pCategory: String,
            pPrice: Number,
            pAmount: Number,
            pQuantity: {
                type: Number
            }
        }
    ],
    OtotalPrice: Number,
    Ostatus: {
        type: String,
        enum: ['Not-Confirmed', 'Ordered', 'Processing', 'Picking-Up', 'Out-For-Delivery', 'Delivered', 'Cancelled' ],
        default: 'Not-Confirmed'
    },
    OemployeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employee"
    },
    OemployeeName: {
        type: String
    },
    OemployeePhoneNumber: {
        type: Number
    },
    Oaddress: {
        houseName: {
            type: String 
        },
        streetName: {
            type: String
        }
    },
    OpaymentId: {
        type: String
    },
    OrazorPayOrderId: {
        type: String
    },
    OpaymentMode: {
        type: String,
        enum: ['CashOnDelivery', 'RazorPay'],
        default: 'RazorPay'
    },
    OpaymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    }
}, {timestamps: true})

module.exports= mongoose.model("Order", orderSchema);