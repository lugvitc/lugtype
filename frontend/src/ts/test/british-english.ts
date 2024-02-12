import Config from "../config";
import { capitalizeFirstLetterOfEachWord } from "../utils/misc";
import * as CustomText from "../test/custom-text";

type BritishEnglishReplacement = {
  0: string;
  1: string;
  2?: string[];
};

let list: BritishEnglishReplacement[] = [];

export async function getList(): Promise<BritishEnglishReplacement[]> {
  if (list.length === 0) {
    return $.getJSON("languages/britishenglish.json", function (data) {
      list = data;
      return list;
    });
  } else {
    return list;
  }
}

export async function replace(
  word: string,
  previousWord: string
): Promise<string> {
  const list = await getList();

  if (word.includes("-")) {
    //this handles hyphenated words (for example "cream-colored") to make sure
    //we don't have to add every possible combination to the list
    return (
      await Promise.all(
        word.split("-").map(async (w) => replace(w, previousWord))
      )
    ).join("-");
  } else {
    const replacement = list.find((a) =>
      word.match(RegExp(`^([\\W]*${a[0]}[\\W]*)$`, "gi"))
    );

    if (!replacement) return word;

    if (
      (Config.mode === "quote" ||
        (Config.mode === "custom" &&
          !CustomText.isTimeRandom &&
          !CustomText.isWordRandom &&
          !CustomText.isSectionRandom)) &&
      replacement[2]?.includes(previousWord)
    ) {
      return word;
    }

    return word.replace(
      RegExp(`^(?:([\\W]*)(${replacement[0]})([\\W]*))$`, "gi"),
      (_, $1, $2, $3) =>
        $1 +
        ($2.charAt(0) === $2.charAt(0).toUpperCase()
          ? $2 === $2.toUpperCase()
            ? replacement[1].toUpperCase()
            : capitalizeFirstLetterOfEachWord(replacement[1])
          : replacement[1]) +
        $3
    );
  }
}
