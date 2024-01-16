import express from "express";
import path from "path";
import cors from "cors";
import { corsOptionsDelegate } from "./utils/cors.js";

async function main() {
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
  server.get("/", (resquest, response) =>
    response.sendFile(path.join(__dirname, "public", "index.html"))
  );
  server.get("/health", (resquest, response) => {
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

  server.listen(PORT, async () => {

    console.info(`App running on Port ${PORT}`);
    
    const gracefulShutdown = async() => {
        console.info("Graceful shutdown")
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
    ].forEach((evt) => process.on(evt, gracefulShutdown));
});
}

main()
  
