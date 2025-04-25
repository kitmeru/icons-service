import * as path from "path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import { json, urlencoded } from "express";
import logger from "morgan";
import { createServer } from "node:http";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { appConfig } from "./config/appConfig.js";
import indexRouter from "./routes/index.js";
import { apiErrorHandler } from "./utils/apiErrorHandler.js";

function getDirname() {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(__filename);
}

async function startCore(app, port) {
  const server = createServer(app);
  const __dirname = getDirname();

  app.set("views", path.resolve(__dirname, "./views"));

  if (appConfig.runsBehindProxy) app.set("trust proxy", 1);

  app.use(cors());
  app.use(logger("dev"));
  app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use(cookieParser());
  if (appConfig.useCompression) app.use(compression());

  app.use(appConfig.version + "/", indexRouter);

  app.get("/health", (_, res) => {
    res.status(200).json("Server is running...");
  });

  app.use((_, res) => {
    res.status(404).json("Not found");
  });

  app.use(apiErrorHandler);


  server.listen(port || appConfig.port, () => {
    console.log(`Server listening on port ${port || appConfig.port}`);
  });

  return server;
}

export default startCore;
