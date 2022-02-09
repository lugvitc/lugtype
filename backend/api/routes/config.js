import { Router } from "express";

import { authenticateRequest } from "../../middlewares/auth";

import { asyncHandler, validateRequest } from "../../middlewares/api-utils";

import configSchema from "../schemas/config-schema";
import ConfigController from "../controllers/config";
import * as RateLimit from "../../middlewares/rate-limit";

const router = Router();

router.get(
  "/",
  RateLimit.configGet,
  authenticateRequest(),
  asyncHandler(ConfigController.getConfig)
);

router.post(
  "/save",
  RateLimit.configUpdate,
  authenticateRequest(),
  validateRequest({
    body: {
      config: configSchema,
    },
  }),
  asyncHandler(ConfigController.saveConfig)
);

export default router;
