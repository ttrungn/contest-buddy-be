import express from "express";
import { handleLoging } from "../controllers/userController.js";

let router = express.Router();

let initWebRoutes = (app) => {
  router.post("/api/login", handleLoging);

  return app.use("/", router);
};

export default initWebRoutes;
