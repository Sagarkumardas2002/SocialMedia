import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected Successfully to host ${conn.connection.host} `.bgYellow.black);
    } catch (error) {
        console.log(`Error: ${error.message}`.bgRed.black);
        process.exit(1);
    }
};

export default connectDB;
