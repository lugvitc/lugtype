import { initServer } from "@ts-rest/express";
import {
  authenticateRequest,
  authenticateRequestV2,
} from "../../middlewares/auth";
import * as RateLimit from "../../middlewares/rate-limit";
import * as ConfigController from "../controllers/config";
import { configContract } from "./../../../../shared/contract/config.contract";
import { callHandler } from "./index2";

const s = initServer();
export const configRoutes = s.router(configContract, {
  get: {
    middleware: [authenticateRequest(), RateLimit.configGet],
    handler: (r) => callHandler(ConfigController.getConfigV2)(r),
  },
  getTest: {
    middleware: [authenticateRequestV2(), RateLimit.configGet as any],
    handler: (r) => callHandler(ConfigController.getTestConfigV2)(r),
  },
});
