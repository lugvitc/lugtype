import { initServer } from "@ts-rest/express";

import { MonkeyResponse2 } from "../../utils/monkey-response";
import * as UserController from "../controllers/user";
import MonkeyError from "../../utils/error";
import { GetUserType, UserType, userContract } from "../schemas/user.contract";
const s = initServer();
export const userRoutes = s.router(userContract, {
  signup: async ({ body }) => {
    console.log(body);
    const result = await UserController.createNewUserV2(body);

    if (result.status === 200) {
      return {
        status: 200,
        body: result,
      };
    }
    return {
      status: 400,
      body: result as MonkeyError,
    };
  },
  get: async () => {
    return {
      status: 200,
      body: new MonkeyResponse2<UserType>(
        "getUser",
        { uid: "new", name: "name", email: "email" },
        200
      ) as GetUserType,
    };
  },
});
