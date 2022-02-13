const db = require("../init/db");
const { v4: uuidv4 } = require("uuid");
const Logger = require("../handlers/logger.js");
const MonkeyError = require("../handlers/error");
const {
  MonkeyResponse,
  handleMonkeyResponse,
} = require("../handlers/monkey-response");
const { MongoError } = require("mongodb");

async function errorHandlingMiddleware(error, req, res, _next) {
  const monkeyResponse = new MonkeyResponse();
  monkeyResponse.status = 500;
  monkeyResponse.data = {
    errorId: error.errorId ?? uuidv4(),
    uid: error.uid ?? req.ctx?.decodedToken?.uid,
  };

  if (error instanceof MonkeyError) {
    monkeyResponse.message = error.message;
    monkeyResponse.status = error.status;
  } else if (/ECONNREFUSED.*27017/i.test(error.message)) {
    monkeyResponse.message =
      "Could not connect to the database. It may be down.";
  } else {
    monkeyResponse.message =
      "Oops! Our monkeys dropped their bananas. Please try again later.";
  }

  if (process.env.MODE !== "dev" && monkeyResponse.status > 400) {
    const { uid, errorId } = monkeyResponse.data;

    try {
      await Logger.log(
        "system_error",
        `${monkeyResponse.status} ${error.message} ${error.stack}`,
        uid
      );
      await db.collection("errors").insertOne({
        _id: errorId,
        timestamp: Date.now(),
        status: monkeyResponse.status,
        uid,
        message: error.message,
        stack: error.stack,
        endpoint: req.originalUrl,
      });
    } catch (e) {
      console.error("Failed to save error.");
      console.error(e);
    }
  } else {
    console.error(error.message);
  }

  return handleMonkeyResponse(monkeyResponse, res);
}

module.exports = errorHandlingMiddleware;
