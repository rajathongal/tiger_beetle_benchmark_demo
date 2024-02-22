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
import { initBatchTransferWorker } from "./controllers/handleTransfers.js";
import pino from "pino-http";
import logger from "./utils/initLogger.js";

async function main() {
  // External Packages Init
  const redisClient = await initRedis();
  await redisClient.connect();
  logger.info("Redis client connected");
  await initMongoDB();
  logger.info("MongoDB client connected");
  await redisService.initializeRedis(redisClient);

  await initBatchTransferWorker();
  logger.info("Batch execution worker started");

  const PORT = process.env.PORT || 5001;
  const server = express();
  /**
   * Server settings
   */
  server.use(cors(corsOptionsDelegate));
  server.use(express.json());
  server.use(pino());
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
    logger.info(`App running on Port ${PORT}`);

    const gracefulShutdown = async () => {
      await scheduler.gracefulShutdown();
      logger.info("Batch Execution workers stopped");
      redisClient.quit();
      logger.info("\nRedis disconnected");
      mongoose.connection.close();
      logger.info("MongoDB disconnected");
      logger.info("Graceful shutdown");
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
      process.on(evt, console.warn);
      process.on(evt, gracefulShutdown);
    });
  });
}

main();
