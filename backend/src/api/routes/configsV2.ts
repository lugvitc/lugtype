import { initServer } from "@ts-rest/express";

import { MonkeyResponse2 } from "../../utils/monkey-response";
import {
  ConfigType,
  GetConfigType,
  configContract as configsContract,
} from "../schemas/config.contract.";
const s = initServer();
export const configRoutes = s.router(configsContract, {
  get: async () => {
    return {
      status: 200,
      body: new MonkeyResponse2<ConfigType>(
        "get Config",
        { test: "true" },
        200
      ) as GetConfigType,
    };
  },
});
