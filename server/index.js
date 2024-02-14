import "./utils/initEnv.js";
import express from "express";
import path from "path";
import cors from "cors";
import { corsOptionsDelegate } from "./utils/initCors.js";
import initRedis from "./utils/initRedis.js";
import initMongoDB from "./utils/initMongoDB.js";
import redisService from "./utils/redis.service.js";
import routes from "./routes.js";
import mongoose from "mongoose";
import scheduler from "node-schedule";
import { batchTransferWorker } from "./controllers/handleTransfers.js";

async function main() {
  // External Packages Init
  const redisClient = await initRedis();
  await redisClient.connect();
  console.log("Redis client connected")
  await initMongoDB();
  console.log("MongoDB client connected")
  redisService.initializeRedis(redisClient);
  await batchTransferWorker();
  console.log("Batch execution worker started")

  const PORT = process.env.PORT || 5001;
  const server = express();
  /**
   * Server settings
   */
  server.use(cors(corsOptionsDelegate));
  server.use(express.json());
  /**
   * Routes
   */
  server.get("/", (request, response) =>
    response.sendFile(path.join(__dirname, "public", "index.html"))
  );
  server.get("/health", (request, response) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
    };
    try {
      response.send(healthcheck);
    } catch (err) {
      healthcheck.message = err;
      response.status(503).send();
    }
  });
  server.use(routes);

  server.listen(PORT, async () => {
    console.info(`App running on Port ${PORT}`);

    const gracefulShutdown = async () => {
      
      await scheduler.gracefulShutdown();
      console.info("Batch Execution workers stopped");
      redisClient.quit();
      console.info("\nRedis disconnected");
      mongoose.connection.close();
      console.info("MongoDB disconnected");
      console.info("Graceful shutdown");
      process.exit(0);
    };

    [
      "beforeExit",
      "uncaughtException",
      "unhandledRejection",
      "SIGHUP",
      "SIGINT",
      "SIGQUIT",
      "SIGILL",
      "SIGTRAP",
      "SIGABRT",
      "SIGBUS",
      "SIGFPE",
      "SIGUSR1",
      "SIGSEGV",
      "SIGUSR2",
      "SIGTERM",
    ].forEach((evt) => {
      process.on(evt, gracefulShutdown);
      process.on(evt, console.log);

    });
  });
}

main();
