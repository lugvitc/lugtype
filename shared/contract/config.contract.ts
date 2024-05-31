import { initContract } from "@ts-rest/core";
import {extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from "zod";
extendZodWithOpenApi(z);
import { MonkeyResponseSchema } from "./common.contract";

const c = initContract();

const ConfigSchema = z.object({
  test: z.string().readonly().openapi({ description: "some description" }),
});
const GetConfigSchema = MonkeyResponseSchema.extend({
  data: ConfigSchema,
}).openapi({
  title: "the config schema",
  description: "The config schema",
});
export type GetConfig = z.infer<typeof GetConfigSchema>;

const GetTestConfigParamsSchema = z.object({
  id: z.string().openapi({ description: "The id of the config" }),
});
export type GetTestConfigParams = z.infer<typeof GetTestConfigParamsSchema>;

const GetTestConfigQuerySchema = z.object({
  noCache: z.boolean().optional().default(false).openapi({description: "use cache or not"}),
  includes: z
    .array(z.enum(["server", "client"] as const))
    .optional()
    .default(["server"]).openapi({description: "include scoped configuration"}),
});
export type GetTestConfigQuery = z.infer<typeof GetTestConfigQuerySchema>;
export const configContract = c.router(
  {
    get: {
      method: "GET",
      path: "/",
      responses: {
        200: GetConfigSchema,
      },
    },
    getTest: {
      method: "GET",
      path: "/test/:id/",
      pathParams: GetTestConfigParamsSchema,
      query: GetTestConfigQuerySchema,
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
