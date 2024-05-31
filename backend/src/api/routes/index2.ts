import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { IRouter } from "express";
import { MonkeyResponse2 } from "../../utils/monkey-response";
import { contract } from "./../../../../shared/contract/index.contract";
import { configRoutes } from "./configsV2";
import { userRoutes } from "./usersV2";

const s = initServer();
const router = s.router(contract, {
  users: userRoutes,
  configs: configRoutes,
});

export function applyApiRoutes(app: IRouter): void {
  createExpressEndpoints(contract, router, app, { jsonQuery: true });
}

export function callController<
  TInput,
  TBody,
  TQuery,
  TParams,
  TResponse extends MonkeyResponse2<any>
>(
  handler: (
    req: MonkeyTypes.Request2<TBody, TQuery, TParams>
  ) => Promise<TResponse>
): (all: TInput) => Promise<any> {
  return async (all) => {
    const { req, body, params, query } = all as any;
    const result = await handler({
      body: body as TBody,
      query: query as TQuery,
      params: params as TParams,
      ctx: req.ctx,
      raw: req,
    });
    return { status: result.status, body: result };
  };
}
