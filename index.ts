import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import routes from "./routes/MarketplaceRouter";

const app = express();
const port = 8800;

dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error}`);
  }
};

mongoose.connection.on("disconnected", (error) => {
  console.error(`MongoDB disconnected, connection error: ${error}`);
});

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors());

// routes
app.use("/marketplace", routes);

app.get("/", async (req, res) => {
  res.send("heloo world");
});

app.listen(port, () => {
  connect();
  console.log(`Server running on port ${port}`);
});
