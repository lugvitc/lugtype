import { initServer } from "@ts-rest/express";
import {
  authenticateRequest,
  authenticateRequestV2,
} from "../../middlewares/auth";
import * as RateLimit from "../../middlewares/rate-limit";
import * as ConfigController from "../controllers/config";
import { configContract } from "./../../../../shared/contract/config.contract";
import { callController } from "./index2";

const s = initServer();
export const configRoutes = s.router(configContract, {
  get: {
    middleware: [authenticateRequest(), RateLimit.configGet],
    handler: async (r) => callController(ConfigController.getConfigV2)(r),
  },
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  getTest: {
    middleware: [authenticateRequestV2(), RateLimit.configGet as any],
    handler: async (r) => callController(ConfigController.getTestConfigV2)(r),
  },
  /* eslint-enable  @typescript-eslint/no-explicit-any */
});
