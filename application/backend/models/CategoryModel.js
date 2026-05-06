import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
    {
        categoryID: {
            type: Number,
            required: true
        },
        categoryName: {
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
export default CategorySchema;