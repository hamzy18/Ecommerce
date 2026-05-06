import mongoose from "mongoose";
const BrandSchema = new mongoose.Schema(
    {
        brandID: {
            type: Number,
            required: true
        },
        brandName: {
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
export default BrandSchema;