import cors from "cors";
import helmet from "helmet";
import { addApiRoutes, applyApiRoutes } from "./api/routes";
import express, { urlencoded, json } from "express";
import contextMiddleware from "./middlewares/context";
import errorHandlingMiddleware from "./middlewares/error";
import {
  badAuthRateLimiterHandler,
  rootRateLimiter,
} from "./middlewares/rate-limit";
import { contract } from "./../../shared/contract/index.contract";
import { generateOpenApi } from "@ts-rest/open-api";
import * as swaggerUi from "swagger-ui-express";

function buildApp(): express.Application {
  const app = express();

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(cors());
  app.use(helmet());

  app.set("trust proxy", 1);

  app.use(contextMiddleware);

  app.use(badAuthRateLimiterHandler);
  app.use(rootRateLimiter);

  applyApiRoutes(app);
  addApiRoutes(app);

  app.use(errorHandlingMiddleware);

  const openApiDocument = generateOpenApi(
    contract,
    {
      info: {
        title: "MonkeyType API",
        version: "1.0.0",
      },
    },
    { jsonQuery: true, setOperationId: "concatenated-path" }
  );
  app.use("/v2/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  const openApiJson = JSON.stringify(openApiDocument);
  app.use("/v2/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(openApiJson);
  });

  return app;
}

export default buildApp();
