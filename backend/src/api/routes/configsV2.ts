import { initServer } from "@ts-rest/express";
import { authenticateRequest } from "../../middlewares/auth";
import * as RateLimit from "../../middlewares/rate-limit";
import * as ConfigController from "../controllers/config";
import { configContract as configsContract } from "../schemas/config.contract";
import { callHandler } from "./index2";

const s = initServer();
export const configRoutes = s.router(configsContract, {
  get: {
    middleware: [authenticateRequest(), RateLimit.configGet],
    handler: (r) => callHandler(ConfigController.getConfig)(r),
  },
});
