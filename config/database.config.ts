import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    mongoose.connection.on("disconnected", (error) => {
      console.error(`MongoDB disconnected, connection error: ${error}`);
    });
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error}`);
  }
};

export default connectDatabase;
