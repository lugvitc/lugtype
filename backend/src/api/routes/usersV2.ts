import { initServer } from "@ts-rest/express";

import { validateConfiguration } from "../../middlewares/api-utils";
import { authenticateRequest } from "../../middlewares/auth";
import * as RateLimit from "../../middlewares/rate-limit";

import * as UserController from "../controllers/user";
import {
  GetUserType,
  UserCreateType,
  userContract,
} from "../schemas/user.contract";
import { callHandler, wrap2 } from "./index2";
import {
  EmptyMonkeyResponse2,
  MonkeyResponse2,
  MonkeyStatusAware,
} from "../../utils/monkey-response";

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
    handler: async ({ req, body }) => {
      const result = await UserController.createNewUserV2(
        req as unknown as MonkeyTypes.Request,
        body as unknown as UserCreateType
      );

      return {
        status: 200,
        body: result,
      };
    },
  },
  get: {
    middleware: [authenticateRequest(), RateLimit.userGet],
    //handler: callHandler(UserController.getUser),
    handler: wrap(UserController.getUser),
  },
});

function wrap(
  handler: (req: MonkeyTypes.Request) => Promise<MonkeyStatusAware>
): (all: any) => Promise<any> {
  return async (it) => {
    return await callHandler(handler)(it);
  };
}
