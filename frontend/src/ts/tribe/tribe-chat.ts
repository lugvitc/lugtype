import * as Notifications from "../elements/notifications";
import * as Tribe from "./tribe";
import * as Misc from "../utils/misc";
import * as TestUI from "../test/test-ui";

let lastMessageTimestamp = 0;
let shouldScrollChat = true;

export function reset(): void {
  $(".pageTribe .lobby .chat .messages").empty();
  $(".pageTest #result #tribeResultBottom .chat .messages").empty();
}

function sendChattingUpdate(bool: boolean): void {
  Tribe.socket.emit("room_chatting_update", {
    isChatting: bool,
  });
}

function limitChatMessages(): void {
  const messages1 = $(".pageTribe .lobby .chat .messages .message");
  const messages2 = $(".pageTest #result #tribeResultBottom .chat .messages");
  const limit = 100;

  //they should be in sync so it doesnt matter if i check one length
  if (messages1.length <= limit) return;

  const del = messages1.length - limit;

  for (let i = 0; i < del; i++) {
    $(messages1[i]).remove();
    $(messages2[i]).remove();
  }
}

export function scrollChat(): void {
  const chatEl = $(".pageTribe .lobby .chat .messages")[0];
  const chatEl2 = $(".pageTest #result #tribeResultBottom .chat .messages")[0];

  if (shouldScrollChat) {
    chatEl.scrollTop = chatEl.scrollHeight;
    chatEl2.scrollTop = chatEl2.scrollHeight;
    shouldScrollChat = true;
  }
}

export function updateIsTyping(): void {
  let string = "";

  const names: string[] = [];
  Object.keys(Tribe.room.users).forEach((userId) => {
    if (Tribe.room.users[userId].isChatting && userId !== Tribe.socket.id) {
      names.push(Tribe.room.users[userId].name);
    }
  });
  if (names.length > 0) {
    for (let i = 0; i < names.length; i++) {
      if (i === 0) {
        string += `<span class="who">${Misc.escapeHTML(names[i])}</span>`;
      } else if (i === names.length - 1) {
        string += ` and <span class="who">${Misc.escapeHTML(names[i])}</span>`;
      } else {
        string += `, <span class="who">${Misc.escapeHTML(names[i])}</span>`;
      }
    }
    if (names.length == 1) {
      string += " is typing...";
    } else {
      string += " are typing...";
    }
  } else {
    string = " ";
  }

  $(".pageTribe .lobby .chat .whoIsTyping").html(string);
  $(".pageTest #result #tribeResultBottom .chat .messages .whoIsTyping").html(
    string
  );
}

export function appendMessage(data): void {
  let cls = "message";
  let author = "";
  if (data.isSystem) {
    cls = "systemMessage";
  } else {
    let me = "";
    if (data.from.id == Tribe.socket.id) me = " me";
    author = `<div class="author ${me}">${data.from.name}:</div>`;
  }
  // data.message = await insertImageEmoji(data.message);

  let previousAuthor = $(".pageTribe .lobby .chat .messages .message")
    .last()
    .find(".author")
    .text();
  previousAuthor = previousAuthor.substring(0, previousAuthor.length - 1);

  if (previousAuthor == data?.from?.name) {
    // author = author.replace(`class="author`, `class="author invisible`);
  } else {
    cls += " newAuthor";
  }

  $(".pageTribe .lobby .chat .messages").append(`
    <div class="${cls}">${author}<div class="text">${data.message}</div></div>
  `);
  $(".pageTest #result #tribeResultBottom .chat .messages").append(`
    <div class="${cls}">${author}<div class="text">${data.message}</div></div>
  `);
  limitChatMessages();
  scrollChat();
}

function sendMessage(msg: string): void {
  if (msg === "") return;
  if (msg.length > 512) {
    Notifications.add("Message cannot be longer than 512 characters.", 0);
    return;
  }
  if (performance.now() < lastMessageTimestamp + 500) return;
  lastMessageTimestamp = performance.now();
  sendChattingUpdate(false);
  Tribe.socket.emit("chat_message", {
    message: msg,
  });
  $(".pageTribe .lobby .chat .input input").val("");
  $(".pageTest #result #tribeResultBottom .chat .input input").val("");
}

$(".pageTribe .tribePage.lobby .chat .input input").on("keyup", (e) => {
  if (e.key === "Enter") {
    const msg = $(".pageTribe .lobby .chat .input input").val();
    sendMessage(msg as string);
  }
});

$(".pageTest #result #tribeResultBottom .chat .input input").on(
  "keyup",
  (e) => {
    if (e.key === "Enter") {
      const msg = $(
        ".pageTest #result #tribeResultBottom .chat .input input"
      ).val();
      sendMessage(msg as string);
    }
  }
);

$(document).keydown((e) => {
  if (Tribe.state === 5) {
    if (
      e.key === "/" &&
      !$(".pageTribe .lobby .chat .input input").is(":focus")
    ) {
      $(".pageTribe .lobby .chat .input input").focus();
      e.preventDefault();
    }
  } else if (TestUI.resultVisible && Tribe.state >= 20) {
    if (
      e.key === "/" &&
      !$(".pageTest #result #tribeResultBottom .chat .input input").is(":focus")
    ) {
      $(".pageTest #result #tribeResultBottom .chat .input input").focus();
      e.preventDefault();
    }
  }
});

$(".pageTribe .tribePage.lobby .chat .input input").on("input", (_e) => {
  const val = $(
    ".pageTribe .tribePage.lobby .chat .input input"
  ).val() as string;
  $(".pageTest #result #tribeResultBottom .chat .input input").val(val);
  const vallen = val.length;
  if (vallen === 1) {
    sendChattingUpdate(true);
  } else if (vallen === 0) {
    sendChattingUpdate(false);
  }
});
