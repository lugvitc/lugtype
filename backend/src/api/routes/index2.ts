import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { IRouter } from "express";
import { MonkeyStatusAware } from "../../utils/monkey-response";
import { contract } from "../schemas/index.contract";
import { configRoutes } from "./configsV2";
import { userRoutes } from "./usersV2";

const s = initServer();
const router = s.router(contract, {
  users: userRoutes,
  configs: configRoutes,
});

export function applyApiRoutes(app: IRouter): void {
  createExpressEndpoints(contract, router, app);
}

export function callHandler<ResponseType extends MonkeyStatusAware>(
  handler: (req: MonkeyTypes.Request) => Promise<ResponseType>
): (all: any) => Promise<any> {
  return async (all) => {
    const result = await handler(all.req);
    return { status: result.status, body: result };
  };
}

export function callHandlerWithBody<
  ResponseType extends MonkeyStatusAware,
  BodyType
>(
  handler: (req: MonkeyTypes.Request, body: BodyType) => Promise<ResponseType>
): (all: any) => Promise<any> {
  return async (all) => {
    const result = await handler(all.req, all.body);
    return { status: result.status, body: result };
  };
}
