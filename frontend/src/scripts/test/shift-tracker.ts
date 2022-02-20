import Config from "../config";
import * as Misc from "../misc";

export let leftState = false;
export let rightState = false;

interface KeymapStrings {
  left: string[] | null;
  right: string[] | null;
  keymap: string | null;
}

const keymapStrings: KeymapStrings = {
  left: null,
  right: null,
  keymap: null,
};

async function buildKeymapStrings(): Promise<void> {
  if (keymapStrings.keymap === Config.keymapLayout) return;

  const layout = await Misc.getLayout(Config.keymapLayout);

  if (layout === undefined) return;

  const layoutKeys = layout.keys;
  const layoutKeysEntries = Object.entries(layoutKeys) as [string, string[]][];

  keymapStrings.keymap = Config.keymapLayout;

  if (!layout) {
    keymapStrings.left = null;
    keymapStrings.right = null;
  } else {
    keymapStrings.left = layoutKeysEntries
      .map(([rowName, row]) =>
        row
          // includes "6" and "y" (buttons on qwerty) into the left hand
          .slice(
            0,
            ["row1", "row2"].includes(rowName)
              ? rowName === "row1"
                ? 7
                : 6
              : 5
          )
          .map((key) => key.split(""))
      )
      .flat(2);

    keymapStrings.right = layoutKeysEntries
      .map(([rowName, row]) =>
        row
          // includes "b" (buttons on qwerty) into the right hand
          .slice(
            ["row1", "row4"].includes(rowName)
              ? rowName === "row1"
                ? 6
                : 4
              : 5
          )
          .map((key) => key.split(""))
      )
      .flat(2);
  }
}

$(document).keydown((e) => {
  if (e.code === "ShiftLeft") {
    leftState = true;
    rightState = false;
  } else if (e.code === "ShiftRight") {
    leftState = false;
    rightState = true;
  }
});

$(document).keyup((e) => {
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    leftState = false;
    rightState = false;
  }
});

export function reset(): void {
  leftState = false;
  rightState = false;
}

const leftSideKeys = [
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",

  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",

  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",

  "Backquote",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
];

const rightSideKeys = [
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",

  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",

  "KeyN",
  "KeyM",

  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",

  "Backslash",
  "BracketLeft",
  "BracketRight",
  "Semicolon",
  "Quote",
  "Comma",
  "Period",
  "Slash",
];

export async function isUsingOppositeShift(
  event: JQuery.KeyDownEvent
): Promise<boolean | null | undefined> {
  if (!leftState && !rightState) return null;

  if (
    Config.oppositeShiftMode === "on" ||
    (Config.oppositeShiftMode === "keymap" &&
      (Config.keymapLayout === undefined ||
        Config.keymapLayout === "overrideSync"))
  ) {
    if (
      !rightSideKeys.includes(event.code) &&
      !leftSideKeys.includes(event.code)
    )
      return null;

    if (
      (leftState && rightSideKeys.includes(event.code)) ||
      (rightState && leftSideKeys.includes(event.code))
    ) {
      return true;
    } else {
      return false;
    }
  } else if (Config.oppositeShiftMode === "keymap") {
    await buildKeymapStrings();

    if (
      !keymapStrings.left ||
      !keymapStrings.right ||
      (!keymapStrings.right.includes(event.key) &&
        !keymapStrings.left.includes(event.key))
    )
      return null;

    if (
      (leftState && keymapStrings.right.includes(event.key)) ||
      (rightState && keymapStrings.left.includes(event.key))
    ) {
      return true;
    } else {
      return false;
    }
  }

  return;
}
