import mongoose from "mongoose";
const PaymentSchema = new mongoose.Schema(
    {
        paymentID: {
            type: Number,
            required: true
        },
        clientId: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
                default: Date.now
        },        paymentMethod: {
            type: String,
            required: true
        },
        paymentStatus: {
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
        },
        updatedBy: {
            type: String,
            required: true
        },
        updatedDate: {
            type: Date,
            default: Date.now
        }
        }
    )
    export default PaymentSchema;