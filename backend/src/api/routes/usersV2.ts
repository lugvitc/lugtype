import { initServer } from "@ts-rest/express";

import { validateConfiguration } from "../../middlewares/api-utils";
import { authenticateRequest } from "../../middlewares/auth";
import * as RateLimit from "../../middlewares/rate-limit";

import * as UserController from "../controllers/user";
import { userContract } from "./../../../../shared/contract/user.contract";
import { callController } from "./index2";

const s = initServer();
export const userRoutes = s.router(userContract, {
  signup: {
    middleware: [
      validateConfiguration({
        criteria: (configuration) => configuration.users.signUp,
        invalidMessage: "Sign up is temporarily disabled",
      }),
      authenticateRequest(),
      RateLimit.userSignup,
    ],
    handler: async (r) => callController(UserController.createNewUserV2)(r),
  },
  get: {
    middleware: [authenticateRequest(), RateLimit.userGet],
    handler: async (r) => callController(UserController.getUserV2)(r),
  },
});
