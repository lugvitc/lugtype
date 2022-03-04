import _ from "lodash";

interface CheckAndUpdatePbResult {
  isPb: boolean;
  obj: object;
  lbObj: object;
}

type Result = MonkeyTypes.Result<MonkeyTypes.Mode>;

export function checkAndUpdatePb(
  userPersonalBests: MonkeyTypes.User["personalBests"],
  lbPersonalBests: MonkeyTypes.User["lbPersonalBests"],
  result: Result
): CheckAndUpdatePbResult {
  const { mode, mode2 } = result;

  const userPb = userPersonalBests ?? {};
  userPb[mode] = userPb[mode] ?? {};
  userPb[mode][mode2] = userPb[mode][mode2] ?? [];

  const personalBestMatch: MonkeyTypes.PersonalBest = userPb[mode][mode2].find(
    (pb: MonkeyTypes.PersonalBest) => {
      return matchesPersonalBest(result, pb);
    }
  );

  let isPb = true;

  if (personalBestMatch) {
    const didUpdate = updatePersonalBest(personalBestMatch, result);
    isPb = didUpdate;
  } else {
    userPb[mode][mode2].push(buildPersonalBest(result));
  }

  if (shouldUpdateLeaderboardPersonalBests(lbPersonalBests, result)) {
    lbPersonalBests[mode] = lbPersonalBests[mode] ?? {};

    const lbMode2 = lbPersonalBests[mode][mode2];
    if (!lbMode2 || Array.isArray(lbMode2)) {
      lbPersonalBests[mode][mode2] = {};
    }

    const bestForEveryLanguage = {};

    userPb[mode][mode2].forEach((pb: MonkeyTypes.PersonalBest) => {
      const language = pb.language;
      if (
        !bestForEveryLanguage[language] ||
        bestForEveryLanguage[language].wpm < pb.wpm
      ) {
        bestForEveryLanguage[language] = pb;
      }
    });

    _.each(
      bestForEveryLanguage,
      (pb: MonkeyTypes.PersonalBest, language: string) => {
        const languageDoesNotExist = !lbPersonalBests[mode][mode2][language];

        if (
          languageDoesNotExist ||
          lbPersonalBests[mode][mode2][language].wpm < pb.wpm
        ) {
          lbPersonalBests[mode][mode2][language] = pb;
        }
      }
    );
  }

  return {
    isPb,
    obj: userPb,
    lbObj: lbPersonalBests,
  };
}

function matchesPersonalBest(
  result: Result,
  personalBest: MonkeyTypes.PersonalBest
): boolean {
  const sameLazyMode =
    result.lazyMode === personalBest.lazyMode ||
    (!result.lazyMode && !personalBest.lazyMode);
  const samePunctuation = result.punctuation === personalBest.punctuation;
  const sameDifficulty = result.difficulty === personalBest.difficulty;
  const sameLanguage = result.language === personalBest.language;

  return sameLazyMode && samePunctuation && sameDifficulty && sameLanguage;
}

function updatePersonalBest(
  personalBest: MonkeyTypes.PersonalBest,
  result: Result
): boolean {
  if (personalBest.wpm > result.wpm) {
    return false;
  }

  personalBest.acc = result.acc;
  personalBest.consistency = result.consistency;
  personalBest.difficulty = result.difficulty;
  personalBest.language = result.language;
  personalBest.punctuation = result.punctuation;
  personalBest.lazyMode = result.lazyMode;
  personalBest.wpm = result.rawWpm;
  personalBest.wpm = result.wpm;
  personalBest.timestamp = Date.now();

  return true;
}

function buildPersonalBest(result: Result): MonkeyTypes.PersonalBest {
  return {
    acc: result.acc,
    consistency: result.consistency,
    difficulty: result.difficulty,
    lazyMode: result.lazyMode,
    language: result.language,
    punctuation: result.punctuation,
    raw: result.rawWpm,
    wpm: result.wpm,
    timestamp: Date.now(),
  };
}

function shouldUpdateLeaderboardPersonalBests(
  lbPersonalBests: MonkeyTypes.User["lbPersonalBests"],
  result: Result
): boolean {
  const isValidTimeMode =
    result.mode === "time" && (result.mode2 === "15" || result.mode2 === "60");
  return lbPersonalBests && isValidTimeMode && !result.lazyMode;
}
