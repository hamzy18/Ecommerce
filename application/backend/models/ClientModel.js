import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema(
    {
        clientID: {
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
export default ClientSchema;