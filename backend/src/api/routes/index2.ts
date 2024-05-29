import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { contract } from "../schemas/index.contract";
import { userRoutes } from "./usersV2";
import { IRouter } from "express";
import { configRoutes } from "./configsV2";
import { MonkeyStatusAware } from "../../utils/monkey-response";

const s = initServer();
const router = s.router(contract, {
  users: userRoutes,
  configs: configRoutes,
});

export function applyApiRoutes(app: IRouter): void {
  createExpressEndpoints(contract, router, app);
}

export function wrap2(
  handler: (req: MonkeyTypes.Request) => Promise<MonkeyStatusAware>
): (all: any) => Promise<any> {
  return async (it) => {
    return await callHandler(handler)(it);
  };
}

export function callHandler<ResponseType extends MonkeyStatusAware>(
  handler: (req: MonkeyTypes.Request) => Promise<ResponseType>
): (all: any) => Promise<any> {
  return async (all) => {
    console.log({ inside: all.req.ctx });
    const result = await handler(all.req);
    return { status: result.status, body: result };
  };
}

export function callHandlerWithBody<ResponseType extends MonkeyStatusAware>(
  handler: (req: MonkeyTypes.Request) => Promise<ResponseType>
): ({ req }: any) => Promise<any> {
  return async (all) => {
    console.log({ inside: all.req.ctx });
    const result = await handler(all.req);
    return { status: result.status, body: result };
  };
}
