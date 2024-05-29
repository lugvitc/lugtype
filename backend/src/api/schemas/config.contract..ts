import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { MonkeyResponseSchema } from "./common.contract";

const c = initContract();

const ConfigSchema = z.object({
  test: z.string().readonly(),
});
export type ConfigType = z.infer<typeof ConfigSchema>;

const GetConfigSchema = MonkeyResponseSchema.extend({ data: ConfigSchema });
export type GetConfigType = z.infer<typeof GetConfigSchema>;

export const configContract = c.router(
  {
    get: {
      method: "GET",
      path: "/",
      responses: {
        200: GetConfigSchema,
      },
    },
  },
  {
    pathPrefix: "/v2/configs",
    strictStatusCodes: true,
  }
);
