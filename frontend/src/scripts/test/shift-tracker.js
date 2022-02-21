import Config from "../config";
import * as Misc from "../misc";

export let leftState = false;
export let rightState = false;

let keymapStrings = {
  left: null,
  right: null,
  keymap: null,
};

async function buildKeymapStrings() {
  if (keymapStrings.keymap === Config.keymapLayout) return;

  let layout = await Misc.getLayout(Config.keymapLayout).keys;

  if (!layout) {
    keymapStrings = {
      left: null,
      right: null,
      keymap: Config.keymapLayout,
    };
  } else {
    keymapStrings.left = (
      layout.slice(0, 7).join(" ") +
      " " +
      layout.slice(13, 19).join(" ") +
      " " +
      layout.slice(26, 31).join(" ") +
      " " +
      layout.slice(38, 43).join(" ")
    ).replace(/ /g, "");
    keymapStrings.right = (
      layout.slice(6, 13).join(" ") +
      " " +
      layout.slice(18, 26).join(" ") +
      " " +
      layout.slice(31, 38).join(" ") +
      " " +
      layout.slice(42, 48).join(" ")
    ).replace(/ /g, "");
    keymapStrings.keymap = Config.keymapLayout;
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

export function reset() {
  leftState = false;
  rightState = false;
}

let leftSideKeys = [
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

let rightSideKeys = [
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

export async function isUsingOppositeShift(event) {
  if (!leftState && !rightState) return null;

  if (Config.oppositeShiftMode === "on") {
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

    if (!keymapStrings.left || !keymapStrings.right) return null;

    if (
      (leftState && keymapStrings.right.includes(event.key)) ||
      (rightState && keymapStrings.left.includes(event.key))
    ) {
      return true;
    } else {
      return false;
    }
  }
}
