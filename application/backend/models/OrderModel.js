import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema(
    {
        orderID: { 
            type: Number,
            required: true
        },
        customerID: {
            type: Number,
            required: true
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentModeID: {
            type: Number,
            required: true
        },
        orderStatus: {
            type: String,
            required: true
        },
        createdBy: {
            type: String,
            required: true
        },
        createdDate: {
            type: Date,
            default: Date.now
        }
    }
)
export default OrderSchema;