import { Howl } from "howler";
import * as Tribe from "./tribe"; // Rizwan TODO: This should work as soon as tribe files wiill be converted to typescript

const sounds: Record<string, Howl> = {
  join: new Howl({ src: "/sound/tribe-sounds/join.wav" }),
  leave: new Howl({ src: "/sound/tribe-sounds/leave.wav" }),
  start: new Howl({ src: "/sound/tribe-sounds/start.wav" }),
  chat: new Howl({ src: "/sound/tribe-sounds/chat.wav" }),
  chat_mention: new Howl({ src: "/sound/tribe-sounds/chat_mention.wav" }),
  finish: new Howl({ src: "/sound/tribe-sounds/finish.wav" }),
  finish_win: new Howl({ src: "./sound/tribe-ounds/finish_win.wav" }),
  glow: new Howl({ src: "/sound/tribe-sounds/glow.wav" }),
  cd: new Howl({ src: "/sound/tribe-sounds/cd2.wav" }),
  cd_go: new Howl({ src: "/sound/tribe-sounds/cd_go2.wav" }),
};

export function play(name: string): void {
  if (
    [10, 11, 12].includes(Tribe.state) &&
    ["join", "leave", "chat", "chat_mention"].includes(name)
  ) {
    return;
  }
  sounds[name].seek(0);
  sounds[name].play();
}
