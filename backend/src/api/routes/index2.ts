import { AppRoute, AppRouter } from "@ts-rest/core";
import {
  TsRestRequestHandler,
  createExpressEndpoints,
  initServer,
} from "@ts-rest/express";
import { IRouter, NextFunction } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { MonkeyResponse2 } from "../../utils/monkey-response";
import { configRoutes } from "./configsV2";
import { userRoutes } from "./usersV2";
import { contract } from "./../../../../shared/contract/index.contract";

const s = initServer();
const router = s.router(contract, {
  users: userRoutes,
  configs: configRoutes,
});

export function applyApiRoutes(app: IRouter): void {
  createExpressEndpoints(contract, router, app, { jsonQuery: true });
}

export function callHandler<
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

export function rateLimit<T extends AppRouter | AppRoute>(
  handler: RateLimitRequestHandler
): TsRestRequestHandler<T> {
  return async (req: any, _res: any, next: NextFunction): Promise<void> => {
    await handler(req, _res, next);
  };
}
