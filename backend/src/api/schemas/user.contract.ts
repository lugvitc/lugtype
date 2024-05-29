import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { MonkeyResponseSchema, MonkeyErrorSchema } from "./common.contract";

const c = initContract();

const UserSchema = z.object({
  uid: z.string().readonly(),
  name: z.string(),
  email: z.string().email(),
});
export type UserType = z.infer<typeof UserSchema>;

const UserCreateSchema = UserSchema.pick({
  name: true,
  email: true,
}).extend({
  captcha: z.string(),
});
export type UserCreateType = z.infer<typeof UserCreateSchema>;

const GetUserSchema = MonkeyResponseSchema.extend({ data: UserSchema });
export type GetUserType = z.infer<typeof GetUserSchema>;

export const userContract = c.router(
  {
    signup: {
      method: "POST",
      path: "/signup",
      body: UserCreateSchema,
      responses: {
        200: MonkeyResponseSchema,
        400: MonkeyErrorSchema,
      },
    },
    get: {
      method: "GET",
      path: "/",
      responses: {
        200: GetUserSchema,
        //404: MonkeyErrorSchema,
      },
    },
  },
  {
    pathPrefix: "/v2/users",
    strictStatusCodes: true,
  }
);
