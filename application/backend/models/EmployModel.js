import mongoose from "mongoose";
const EmploySchema = new mongoose.Schema(
    {
        employID: {
            type: Number,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        department: {
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
export default EmploySchema;