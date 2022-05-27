import * as ResultDAL from "../../dal/result";
import {
  getUser,
  checkIfPb,
  checkIfTagPb,
  incrementBananas,
  updateTypingStats,
  recordAutoBanEvent,
} from "../../dal/user";
import * as PublicStatsDAL from "../../dal/public-stats";
import { roundTo2, stdDev } from "../../utils/misc";
import objectHash from "object-hash";
import Logger from "../../utils/logger";
import "dotenv/config";
import { MonkeyResponse } from "../../utils/monkey-response";
import MonkeyError from "../../utils/error";
import { isTestTooShort } from "../../utils/validation";
import {
  implemented as anticheatImplemented,
  validateResult,
  validateKeys,
} from "../../anticheat/index";
import MonkeyStatusCodes from "../../constants/monkey-status-codes";
import {
  incrementResult,
  incrementDailyLeaderboard,
} from "../../utils/prometheus";
import * as George from "../../tasks/george";
import { getDailyLeaderboard } from "../../utils/daily-leaderboards";

try {
  if (anticheatImplemented() === false) throw new Error("undefined");
  Logger.success("Anticheat module loaded");
} catch (e) {
  if (process.env.MODE === "dev") {
    Logger.warning(
      "No anticheat module found. Continuing in dev mode, results will not be validated."
    );
  } else {
    Logger.error(
      "No anticheat module found. To continue in dev mode, add MODE=dev to your .env file in the backend directory"
    );
    process.exit(1);
  }
}

export async function getResults(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { uid } = req.ctx.decodedToken;
  const results = await ResultDAL.getResults(uid);
  return new MonkeyResponse("Results retrieved", results);
}

export async function getLastResult(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { uid } = req.ctx.decodedToken;
  const results = await ResultDAL.getLastResult(uid);
  return new MonkeyResponse("Result retrieved", results);
}

export async function deleteAll(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { uid } = req.ctx.decodedToken;

  await ResultDAL.deleteAll(uid);
  Logger.logToDb("user_results_deleted", "", uid);
  return new MonkeyResponse("All results deleted");
}

export async function updateTags(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { uid } = req.ctx.decodedToken;
  const { tagIds, resultId } = req.body;

  await ResultDAL.updateTags(uid, resultId, tagIds);
  return new MonkeyResponse("Result tags updated");
}

interface AddResultData {
  isPb: boolean;
  tagPbs: any[];
  insertedId: ObjectId;
  dailyLeaderboardRank?: number;
}

export async function addResult(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { uid } = req.ctx.decodedToken;

  const user = await getUser(uid, "add result");

  if (user.needsToChangeName) {
    throw new MonkeyError(
      403,
      "Please change your name before submitting a result"
    );
  }

  const result = Object.assign({}, req.body.result);
  result.uid = uid;
  if (isTestTooShort(result)) {
    const status = MonkeyStatusCodes.TEST_TOO_SHORT;
    throw new MonkeyError(status.code, status.message);
  }

  const resulthash = result.hash;
  delete result.hash;
  delete result.stringified;
  if (
    req.ctx.configuration.resultObjectHashCheck.enabled &&
    resulthash.length === 40
  ) {
    //if its not 64 that means client is still using old hashing package
    const serverhash = objectHash(result);
    if (serverhash !== resulthash) {
      Logger.logToDb(
        "incorrect_result_hash",
        {
          serverhash,
          resulthash,
          result,
        },
        uid
      );
      const status = MonkeyStatusCodes.RESULT_HASH_INVALID;
      throw new MonkeyError(status.code, "Incorrect result hash");
    }
  }

  result.name = user.name;

  if (anticheatImplemented()) {
    if (!validateResult(result)) {
      const status = MonkeyStatusCodes.RESULT_DATA_INVALID;
      throw new MonkeyError(status.code, "Result data doesn't make sense");
    }
  } else {
    if (process.env.MODE !== "dev") {
      throw new Error("No anticheat module found");
    }
    Logger.warning(
      "No anticheat module found. Continuing in dev mode, results will not be validated."
    );
  }

  //dont use - result timestamp is unreliable, can be changed by system time and stuff
  // if (result.timestamp > Math.round(Date.now() / 1000) * 1000 + 10) {
  //   log(
  //     "time_traveler",
  //     {
  //       resultTimestamp: result.timestamp,
  //       serverTimestamp: Math.round(Date.now() / 1000) * 1000 + 10,
  //     },
  //     uid
  //   );
  //   return res.status(400).json({ message: "Time traveler detected" });

  // this probably wont work if we replace the timestamp with the server time later
  // let timestampres = await ResultDAO.getResultByTimestamp(
  //   uid,
  //   result.timestamp
  // );
  // if (timestampres) {
  //   return res.status(400).json({ message: "Duplicate result" });
  // }

  //convert result test duration to miliseconds
  const testDurationMilis = result.testDuration * 1000;
  //get latest result ordered by timestamp
  let lastResultTimestamp;
  try {
    lastResultTimestamp = (await ResultDAL.getLastResult(uid)).timestamp;
  } catch (e) {
    lastResultTimestamp = null;
  }

  result.timestamp = Math.floor(Date.now() / 1000) * 1000;

  //check if now is earlier than last result plus duration (-1 second as a buffer)
  const earliestPossible = lastResultTimestamp + testDurationMilis;
  const nowNoMilis = Math.floor(Date.now() / 1000) * 1000;
  if (lastResultTimestamp && nowNoMilis < earliestPossible - 1000) {
    Logger.logToDb(
      "invalid_result_spacing",
      {
        lastTimestamp: lastResultTimestamp,
        earliestPossible,
        now: nowNoMilis,
        testDuration: testDurationMilis,
        difference: nowNoMilis - earliestPossible,
      },
      uid
    );
    const status = MonkeyStatusCodes.RESULT_SPACING_INVALID;
    throw new MonkeyError(status.code, "Invalid result spacing");
  }

  try {
    result.keySpacingStats = {
      average:
        result.keySpacing.reduce((previous, current) => (current += previous)) /
        result.keySpacing.length,
      sd: stdDev(result.keySpacing),
    };
  } catch (e) {
    //
  }
  try {
    result.keyDurationStats = {
      average:
        result.keyDuration.reduce(
          (previous, current) => (current += previous)
        ) / result.keyDuration.length,
      sd: stdDev(result.keyDuration),
    };
  } catch (e) {
    //
  }

  //check keyspacing and duration here for bots
  if (
    result.mode === "time" &&
    result.wpm > 130 &&
    result.testDuration < 122 &&
    (user.verified === false || user.verified === undefined)
  ) {
    if (!result.keySpacingStats || !result.keyDurationStats) {
      const status = MonkeyStatusCodes.MISSING_KEY_DATA;
      throw new MonkeyError(status.code, "Missing key data");
    }
    if (anticheatImplemented()) {
      if (!validateKeys(result, uid)) {
        //autoban
        const autoBanConfig = req.ctx.configuration.autoBan;
        if (autoBanConfig.enabled) {
          await recordAutoBanEvent(
            uid,
            autoBanConfig.maxCount,
            autoBanConfig.maxHours
          );
        }
        const status = MonkeyStatusCodes.BOT_DETECTED;
        throw new MonkeyError(status.code, "Possible bot detected");
      }
    } else {
      if (process.env.MODE !== "dev") {
        throw new Error("No anticheat module found");
      }
      Logger.warning(
        "No anticheat module found. Continuing in dev mode, results will not be validated."
      );
    }
  }

  delete result.keySpacing;
  delete result.keyDuration;
  delete result.smoothConsistency;
  delete result.wpmConsistency;

  try {
    result.keyDurationStats.average = roundTo2(result.keyDurationStats.average);
    result.keyDurationStats.sd = roundTo2(result.keyDurationStats.sd);
    result.keySpacingStats.average = roundTo2(result.keySpacingStats.average);
    result.keySpacingStats.sd = roundTo2(result.keySpacingStats.sd);
  } catch (e) {
    //
  }

  let isPb = false;
  let tagPbs: any[] = [];

  if (!result.bailedOut) {
    [isPb, tagPbs] = await Promise.all([
      checkIfPb(uid, user, result),
      checkIfTagPb(uid, user, result),
    ]);
  }

  if (isPb) {
    result.isPb = true;
  }

  if (result.mode === "time" && String(result.mode2) === "60") {
    incrementBananas(uid, result.wpm);
    if (isPb && user.discordId) {
      George.updateDiscordRole(user.discordId, result.wpm);
    }
  }

  if (result.challenge && user.discordId) {
    George.awardChallenge(user.discordId, result.challenge);
  } else {
    delete result.challenge;
  }

  let tt = 0;
  let afk = result.afkDuration;
  if (afk == undefined) {
    afk = 0;
  }
  tt = result.testDuration + result.incompleteTestSeconds - afk;
  updateTypingStats(uid, result.restartCount, tt);
  PublicStatsDAL.updateStats(result.restartCount, tt);

  const dailyLeaderboardsConfig = req.ctx.configuration.dailyLeaderboards;
  const dailyLeaderboard = getDailyLeaderboard(
    result.language,
    result.mode,
    result.mode2,
    dailyLeaderboardsConfig
  );

  let dailyLeaderboardRank = -1;

  const { funbox, bailedOut } = result;
  const validResultCriteria =
    (funbox === "none" || funbox === "plus_one" || funbox === "plus_two") &&
    !bailedOut &&
    !user.banned &&
    (user.timeTyping ?? 0) > 7200;

  if (dailyLeaderboard && validResultCriteria) {
    incrementDailyLeaderboard(result.mode, result.mode2, result.language);
    dailyLeaderboardRank = await dailyLeaderboard.addResult(
      {
        name: user.name,
        wpm: result.wpm,
        raw: result.rawWpm,
        acc: result.acc,
        consistency: result.consistency,
        timestamp: result.timestamp,
        uid,
      },
      dailyLeaderboardsConfig
    );
  }

  if (result.bailedOut === false) delete result.bailedOut;
  if (result.blindMode === false) delete result.blindMode;
  if (result.lazyMode === false) delete result.lazyMode;
  if (result.difficulty === "normal") delete result.difficulty;
  if (result.funbox === "none") delete result.funbox;
  if (result.language === "english") delete result.language;
  if (result.numbers === false) delete result.numbers;
  if (result.punctuation === false) delete result.punctuation;
  if (result.mode !== "custom") delete result.customText;
  if (result.restartCount === 0) delete result.restartCount;
  if (result.incompleteTestSeconds === 0) delete result.incompleteTestSeconds;
  if (result.afkDuration === 0) delete result.afkDuration;
  if (result.tags.length === 0) delete result.tags;

  const addedResult = await ResultDAL.addResult(uid, result);

  if (isPb) {
    Logger.logToDb(
      "user_new_pb",
      `${result.mode + " " + result.mode2} ${result.wpm} ${result.acc}% ${
        result.rawWpm
      } ${result.consistency}% (${addedResult.insertedId})`,
      uid
    );
  }

  const data: AddResultData = {
    isPb,
    tagPbs,
    insertedId: addedResult.insertedId,
  };

  if (dailyLeaderboardRank !== -1) {
    data.dailyLeaderboardRank = dailyLeaderboardRank;
  }

  incrementResult(result);

  return new MonkeyResponse("Result saved", data);
}
