import * as db from "../init/db";
import { v4 as uuidv4 } from "uuid";
import Logger from "../utils/logger";
import MonkeyError from "../utils/error";
import { incrementBadAuth } from "./rate-limit";
import { NextFunction, Response } from "express";
import { MonkeyResponse, handleMonkeyResponse } from "../utils/monkey-response";
import { recordClientErrorByVersion } from "../utils/prometheus";
import { isDevEnvironment } from "../utils/misc";
import { ObjectId } from "mongodb";

type DBError = {
  _id: ObjectId;
  timestamp: number;
  status: number;
  uid: string;
  message: string;
  stack?: string;
  endpoint: string;
  method: string;
  url: string;
};

async function errorHandlingMiddleware(
  error: Error,
  req: MonkeyTypes.Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  try {
    const monkeyError = error as MonkeyError;

    let message = "";
    let status = 500;
    const data: {
      errorId?: string;
      uid: string;
    } = {
      errorId: monkeyError.errorId ?? uuidv4(),
      uid: monkeyError.uid ?? req.ctx?.decodedToken?.uid,
    };

    if (/ECONNREFUSED.*27017/i.test(error.message)) {
      message = "Could not connect to the database. It may be down.";
    } else if (error instanceof URIError || error instanceof SyntaxError) {
      status = 400;
      message = "Unprocessable request";
    } else if (error instanceof MonkeyError) {
      message = error.message;
      status = error.status;
    } else {
      message = `Oops! Our monkeys dropped their bananas. Please try again later. - ${data.errorId}`;
    }

    await incrementBadAuth(req, res, status);

    if (status >= 400 && status < 500) {
      recordClientErrorByVersion(req.headers["x-client-version"] as string);
    }

    if (!isDevEnvironment() && status >= 500 && status !== 503) {
      const { uid, errorId } = data;

      try {
        await Logger.logToDb(
          "system_error",
          `${status} ${errorId} ${error.message} ${error.stack}`,
          uid
        );
        await db.collection<DBError>("errors").insertOne({
          _id: new ObjectId(errorId),
          timestamp: Date.now(),
          status: status,
          uid,
          message: error.message,
          stack: error.stack,
          endpoint: req.originalUrl,
          method: req.method,
          url: req.url,
        });
      } catch (e) {
        Logger.error("Logging to db failed.");
        Logger.error(e);
      }
    } else {
      Logger.error(`Error: ${error.message} Stack: ${error.stack}`);
    }

    if (status < 500) {
      delete data.errorId;
    }

    const monkeyResponse = new MonkeyResponse(message, data, status);

    return handleMonkeyResponse(monkeyResponse, res);
  } catch (e) {
    Logger.error("Error handling middleware failed.");
    Logger.error(e);
  }

  return handleMonkeyResponse(
    new MonkeyResponse(
      "Something went really wrong, please contact support.",
      undefined,
      500
    ),
    res
  );
}

export default errorHandlingMiddleware;
