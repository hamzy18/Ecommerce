import mongoose from "mongoose";
const VendorSchema = new mongoose.Schema(
    {
        vendorName: {
            type: String,
            required: true
        },
        vendorEmail: {
            type: String,
            required: true

        }, vendorContact: {
            type: Number,
            required: true
        },
        vendorPassword: {
            type: String,
            required: true
        },
        vendorAddress: {
            type: String,
            required: true
        },
        vendorRole: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            required: true
        },
    }
)
export default VendorSchema