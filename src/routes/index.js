import { Router } from "express";
import { ApiResponse } from "../utils/apiErrorHandler.js";

const indexRouter = Router();

indexRouter.get("/", async (_, res, next) => {
  next(ApiResponse.goodRequest(200, 'Icons service Kitme.ru'))
});

export default indexRouter;
