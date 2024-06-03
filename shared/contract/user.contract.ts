import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { MonkeyResponseSchema, MonkeyErrorSchema } from "./common.contract";

const c = initContract();

const UserSchema = z.object({
  uid: z.string().readonly(),
  name: z.string(),
  email: z.string().email(),
});
export type User = z.infer<typeof UserSchema>;

const UserCreateBodySchema = UserSchema.pick({
  name: true,
  email: true,
}).extend({
  captcha: z.string(),
});
export type UserCreateBody = z.infer<typeof UserCreateBodySchema>;

export const userContract = c.router(
  {
    signup: {
      method: "POST",
      path: "/signup",
      body: UserCreateBodySchema,
      responses: {
        200: MonkeyResponseSchema,
        400: MonkeyErrorSchema,
      },
    },
    get: {
      method: "GET",
      path: "/",
      responses: {
        200: MonkeyResponseSchema.extend({ data: UserSchema }),
        400: MonkeyErrorSchema,
      },
    },
  },
  {
    pathPrefix: "/v2/users",
    strictStatusCodes: true,
  }
);
