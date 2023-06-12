import joi from "joi";
import { Router } from "express";
import {
  asyncHandler,
  checkUserPermissions,
  useInProduction,
  validateRequest,
} from "../../middlewares/api-utils";
import * as ConfigurationController from "../controllers/configuration";
import { authenticateRequest } from "../../middlewares/auth";
import { adminLimit } from "../../middlewares/rate-limit";

const router = Router();

const checkIfUserIsConfigurationMod = checkUserPermissions({
  criteria: (user) => {
    return !!user.configurationMod;
  },
});

router.get("/", asyncHandler(ConfigurationController.getConfiguration));

router.patch(
  "/",
  adminLimit,
  useInProduction([authenticateRequest(), checkIfUserIsConfigurationMod]),
  validateRequest({
    body: {
      configuration: joi.object(),
    },
  }),
  asyncHandler(ConfigurationController.updateConfiguration)
);

router.get(
  "/schema",
  adminLimit,
  useInProduction([authenticateRequest(), checkIfUserIsConfigurationMod]),
  asyncHandler(ConfigurationController.getSchema)
);

export default router;
