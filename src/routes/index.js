import { Router } from "express";
import { ApiResponse } from "../utils/apiErrorHandler.js";

import {
  getCollections,
  getIconsByCollection,
  searchIconsInCollection
} from '../controllers/icons.controller.js'

const indexRouter = Router();

indexRouter.get("/", async (_, res, next) => {
  next(ApiResponse.goodRequest(200, 'Icons service Kitme.ru'))
})

indexRouter.get('/collections', getCollections)
indexRouter.get('/collections/:collection', getIconsByCollection)
indexRouter.get('/search', searchIconsInCollection)

export default indexRouter;
