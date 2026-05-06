import mongoose from "mongoose";
const PaymentModeSchema = new mongoose.Schema(
    {
        modeID: {
            type: Number,   
            required: true
        },
        modeName: {
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
export default PaymentModeSchema;