import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./routes/index.js";
import middlewares from "./middlewares/index.js";
import { createServer } from "http";
import connectDatabase from "./services/database.js";

dotenv.config();

const start = async () => {
  let app = express();
  app = middlewares(app);
  app.use(router);

  const server = createServer(app);
  server.listen(process.env.PORT as string, async () => {
    try {
      await connectDatabase();
      console.log(`🚀 Server running on port ${process.env.PORT as string}`);
    } catch (err) {
      gracefulShutdown();
      console.log(err);
    }
  });
};

async function gracefulShutdown() {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

start();
