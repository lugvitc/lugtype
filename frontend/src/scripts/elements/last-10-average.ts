import * as DB from "@root/db";
import * as Misc from "@utils/misc";
import Config from "@root/config";
import * as TestWords from "@test/test-words";

let averageWPM = 0;
let averageAcc = 0;

export async function update(): Promise<void> {
  const mode2 = Misc.getMode2(Config, TestWords.randomQuote);

  const [wpm, acc] = (
    await DB.getUserAverage10(
      Config.mode,
      mode2 as never,
      Config.punctuation,
      Config.language,
      Config.difficulty,
      Config.lazyMode
    )
  )
    .map(Misc.roundTo2)
    .map((num) => (Config.alwaysShowDecimalPlaces ? Math.round(num) : num));

  averageWPM = wpm;
  averageAcc = acc;
}

export function getWPM(): number {
  return averageWPM;
}

export function getAcc(): number {
  return averageAcc;
}
