import Config, * as UpdateConfig from "../config";
import * as Funbox from "../test/funbox";
// import * as Notifications from "./notifications";
import * as CustomText from "../test/custom-text";

// Rizwan TODO: This should work after tribe files are converted to typescript
import * as TribeButtons from "./tribe-buttons";
import * as Tribe from "./tribe";

export function getArray(config: MonkeyTypes.TribeConfig): string[] {
  const ret: string[] = [];

  if (config["mode"] === "quote") {
    let quoteLengthString = "";
    if (config["mode2"].length == 4) {
      quoteLengthString = "";
    } else {
      config["mode2"].forEach((ql: number) => {
        // Rizwan TODO: Confirm that number is the correct type
        if (ql == 0) {
          quoteLengthString += "short,";
        } else if (ql == 1) {
          quoteLengthString += "medium,";
        } else if (ql == 2) {
          quoteLengthString += "long,";
        } else if (ql == 3) {
          quoteLengthString += "thicc,";
        }
      });
      quoteLengthString = quoteLengthString.substring(
        0,
        quoteLengthString.length - 1
      );
    }
    if (quoteLengthString !== "") ret.push(quoteLengthString);
    ret.push("quote");
  } else {
    ret.push(config["mode"]);
    ret.push(config["mode2"] as string); // Rizwan TODO: Ask mio about this
  }

  if (config["difficulty"] !== "normal") ret.push(config["difficulty"]);
  // if(config['language'] !== "english")
  ret.push(config["language"]);
  if (config["punctuation"] !== false) ret.push("punctuation");
  if (config["numbers"] !== false) ret.push("numbers");
  if (config["funbox"] !== "none") ret.push(config["funbox"]);
  if (config["lazyMode"] !== false) ret.push("lazy mode");
  if (config["stopOnError"] !== "off") {
    ret.push("stop on " + config["stopOnError"] == "word" ? "word" : "letter");
  }
  if (config["minWpm"] !== "off") ret.push(`min ${config["minWpm"]}wpm`);
  if (config["minAcc"] !== "off") ret.push(`min ${config["minAcc"]}% acc`);
  if (config["minBurst"] !== "off") {
    ret.push(`min ${config["minBurst"]}wpm burst`);
  }

  return ret;
}

export function apply(config: MonkeyTypes.TribeConfig): void {
  UpdateConfig.setMode(config.mode, true, true);
  if (config.mode === "time") {
    UpdateConfig.setTimeConfig(config.mode2, true, true);
  } else if (config.mode === "words") {
    UpdateConfig.setWordCount(config.mode2, true, true);
  } else if (config.mode === "quote") {
    UpdateConfig.setQuoteLength(config.mode2, true, true, true);
  } else if (config.mode === "custom") {
    CustomText.setText(config.customText.text, true);
    CustomText.setIsWordRandom(config.customText.isWordRandom, true);
    CustomText.setIsTimeRandom(config.customText.isTimeRandom, true);
    CustomText.setTime(config.customText.time, true);
    CustomText.setWord(config.customText.word, true);
  }
  UpdateConfig.setDifficulty(config.difficulty, true, true);
  UpdateConfig.setLanguage(config.language, true, true);
  UpdateConfig.setPunctuation(config.punctuation, true, true);
  UpdateConfig.setNumbers(config.numbers, true, true);
  Funbox.setFunbox(config.funbox, null, true);
  UpdateConfig.setLazyMode(config.lazyMode, true, true);
  UpdateConfig.setStopOnError(config.stopOnError, true, true);
  if (config.minWpm !== "off") {
    UpdateConfig.setMinWpmCustomSpeed(config.minAcc, true, true);
    UpdateConfig.setMinWpm("custom", true, true);
  } else {
    UpdateConfig.setMinWpm("off", true, true);
  }
  if (config.minAcc !== "off") {
    UpdateConfig.setMinAccCustom(config.minAcc, true, true);
    UpdateConfig.setMinAcc("custom", true, true);
  } else {
    UpdateConfig.setMinAcc("off", true, true);
  }
  if (config.minBurst !== "off") {
    UpdateConfig.setMinBurstCustomSpeed(config.minBurst, true, true);
    UpdateConfig.setMinBurst("custom", true, true);
  } else {
    UpdateConfig.setMinBurst("off", true, true);
  }
}

export function setLoadingIndicator(bool: boolean): void {
  if (bool) {
    $(
      ".pageTribe .tribePage.lobby .currentConfig .loadingIndicator"
    ).removeClass("hidden");
  } else {
    $(".pageTribe .tribePage.lobby .currentConfig .loadingIndicator").addClass(
      "hidden"
    );
  }
}

export function canChange(override: boolean): boolean {
  if (Tribe.state <= 1) return true;
  if (Tribe.state !== 5) return false;
  if (Tribe.getSelf().isLeader) {
    //is leader, allow
    return true;
  } else {
    //not leader, check if its being forced by tribe
    if (override) {
      return true;
    } else {
      return false;
    }
  }
}

let syncConfigTimeout: NodeJS.Timeout | null = null;

export function sync(): void {
  if (Tribe.state <= 1) return;
  if (!Tribe.getSelf().isLeader) return;
  setLoadingIndicator(true);
  TribeButtons.disableStartButton();
  if (syncConfigTimeout === null) {
    syncConfigTimeout = setTimeout(() => {
      // setLoadingIndicator(false);
      let mode2;
      if (Config.mode === "time") {
        mode2 = Config.time;
      } else if (Config.mode === "words") {
        mode2 = Config.words;
      } else if (Config.mode === "quote") {
        mode2 = Config.quoteLength === undefined ? "-1" : Config.quoteLength;
      }
      Tribe.socket.emit("room_update_config", {
        config: {
          mode: Config.mode,
          mode2: mode2,
          difficulty: Config.difficulty,
          language: Config.language,
          punctuation: Config.punctuation,
          numbers: Config.numbers,
          funbox: Config.funbox,
          lazyMode: Config.lazyMode,
          stopOnError: Config.stopOnError,
          minWpm: Config.minWpm === "custom" ? Config.minWpmCustomSpeed : "off",
          minAcc: Config.minAcc === "custom" ? Config.minAccCustom : "off",
          minBurst:
            Config.minBurst === "fixed" ? Config.minBurstCustomSpeed : "off",
          customText: {
            text: CustomText.text,
            isWordRandom: CustomText.isWordRandom,
            isTimeRandom: CustomText.isTimeRandom,
            word: CustomText.word,
            time: CustomText.time,
          },
        },
      });
      clearTimeout(syncConfigTimeout as NodeJS.Timeout);
      syncConfigTimeout = null;
    }, 500);
  }
}
