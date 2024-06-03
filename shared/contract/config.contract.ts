import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { MonkeyErrorSchema, MonkeyResponseSchema } from "./common.contract";

const c = initContract();

const ConfigSchema = z.object({
  test: z.string().readonly(),
});

export type Config = z.infer<typeof ConfigSchema>;

const GetTestConfigParamsSchema = z.object({
  id: z.string(),
});
export type GetTestConfigParams = z.infer<typeof GetTestConfigParamsSchema>;

const GetTestConfigQuerySchema = z.object({
  noCache: z.boolean().optional().default(false),
  includes: z
    .array(z.enum(["server", "client"] as const))
    .optional()
    .default(["server"]),
});
export type GetTestConfigQuery = z.infer<typeof GetTestConfigQuerySchema>;
export const configContract = c.router(
  {
    get: {
      method: "GET",
      path: "/",
      responses: {
        200: MonkeyResponseSchema.extend({ data: ConfigSchema }),
        400: MonkeyErrorSchema,
      },
    },
    getTest: {
      method: "GET",
      path: "/test/:id/",
      pathParams: GetTestConfigParamsSchema,
      query: GetTestConfigQuerySchema,
      responses: {
        200: MonkeyResponseSchema.extend({ data: ConfigSchema }),
        400: MonkeyErrorSchema,
      },
    },
  },
  {
    pathPrefix: "/v2/configs",
    strictStatusCodes: true,
  }
);
