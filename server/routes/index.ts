import { type Express } from "express";
import exportRouter from "./export";
import configRouter from "./config";
// import other routers here e.g. import trafficRouter from "./traffic";

export async function registerRoutes(app: Express) {
  // mount API routers under /api
  app.use("/api/export", exportRouter);
  app.use("/api/config", configRouter);

  // mount other routers:
  // app.use("/api/traffic", trafficRouter);
  // app.use("/api/alerts", alertsRouter);

  // return a simple object as the server reference if needed
  return app;
}

export default registerRoutes;
