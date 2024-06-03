import { initServer } from "@ts-rest/express";
import { resultsContract } from "../../../../shared/contract/results.contract";
import { withApeRateLimiter } from "../../middlewares/ape-rate-limit";
import { validateConfiguration } from "../../middlewares/api-utils";
import { authenticateRequestV2 } from "../../middlewares/auth";
import * as RateLimit from "../../middlewares/rate-limit";
import * as ResultController from "../controllers/result";
import { callController } from "./index2";

const s = initServer();
export const resultsRoutes = s.router(resultsContract, {
  get: {
    middleware: [
      authenticateRequestV2({ acceptApeKeys: true }),
      withApeRateLimiter(RateLimit.resultsGet, RateLimit.resultsGetApe) as any, //TODO
    ],
    handler: async (r) => callController(ResultController.getResults)(r),
  },
  save: {
    middleware: [
      validateConfiguration({
        criteria: (configuration) => {
          return configuration.results.savingEnabled;
        },
        invalidMessage: "Results are not being saved at this time.",
      }),
      authenticateRequestV2(),
      RateLimit.resultsAdd,
    ],
    handler: async (r) => callController(ResultController.addResult)(r),
  },

  updateTags: {
    middleware: [authenticateRequestV2(), RateLimit.resultsTagsUpdate],
    handler: async (r) => callController(ResultController.updateTags)(r),
  },
  delete: {
    middleware: [authenticateRequestV2()],
    handler: async (r) => callController(ResultController.deleteAll)(r),
  },
  getLast: {
    middleware: [authenticateRequestV2({ acceptApeKeys: true })],
    handler: async (r) => callController(ResultController.getLastResult)(r),
  },
});
