import mongoose from "mongoose"
// const { default: mongoose } = require("mongoose")

const connectDb = async ()=>{
try {
const connect = await mongoose.connect(process.env.MONGO_URI)
    console.log("Database Connected")
 } catch (error) {
    console.log(error.message)
    process.exit(1)
}
}
// module.exports = connectDb;
export default connectDb;