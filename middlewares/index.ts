import cors from "cors";
import express, { Express } from "express";

const middlewares = (server: Express) => {
  server.use(cors({ maxAge: 84600 }));
  server.use(express.json());
  
  return server;
};

export default middlewares;