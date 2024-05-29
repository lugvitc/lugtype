import { createExpressEndpoints, initServer } from "@ts-rest/express";
import { contract } from "../schemas/index.contract";
import { userRoutes } from "./usersV2";
import { IRouter } from "express";
import { configRoutes } from "./configsV2";

const s = initServer();
const router = s.router(contract, {
  users: userRoutes,
  configs: configRoutes,
});

export function applyApiRoutes(app: IRouter): void {
  createExpressEndpoints(contract, router, app);
}
