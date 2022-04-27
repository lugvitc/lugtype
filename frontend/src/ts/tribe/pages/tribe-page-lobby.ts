import * as Tribe from "../tribe";
import * as Notifications from "../../elements/notifications";
import * as TribeChat from "../tribe-chat";
import * as CustomText from "../../test/custom-text";
import * as TribeConfig from "../tribe-config";
import * as Commandline from "../../elements/commandline";
import * as CommandlineLists from "../../elements/commandline-lists";
import * as TribeUserList from "../tribe-user-list";
import * as TribeButtons from "../tribe-buttons";
import { ListsObjectKeys } from "../../elements/commandline-lists";

export function reset(): void {
  $(".pageTribe .tribePage.lobby .userlist .list").empty();
  $(".pageTribe .tribePage.lobby .inviteLink .code .text").text("");
  $(".pageTribe .tribePage.lobby .inviteLink .link").text("");
  $(".pageTest #result #tribeResultBottom .inviteLink .code .text").text("");
  $(".pageTest #result #tribeResultBottom .inviteLink .link").text("");
  TribeChat.reset();
}

export function disableConfigButtons(): void {
  $(".pageTribe .tribePage.lobby .currentConfig .groups .group").addClass(
    "disabled"
  );
}

export function enableConfigButtons(): void {
  $(".pageTribe .tribePage.lobby .currentConfig .groups .group").removeClass(
    "disabled"
  );
}

export function disableNameVisibilityButtons(): void {
  $(
    ".pageTribe .tribePage.lobby .visibilityAndName .roomName .icon-button"
  ).addClass("disabled");
  $(
    ".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button"
  ).addClass("disabled");
}

export function enableNameVisibilityButtons(): void {
  $(
    ".pageTribe .tribePage.lobby .visibilityAndName .roomName .icon-button"
  ).removeClass("disabled");
  $(
    ".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button"
  ).removeClass("disabled");
}

export function updateVisibility(): void {
  if (Tribe.getSelf().isLeader) {
    $(
      ".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button"
    ).removeClass("hidden");
  } else {
    $(
      ".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button"
    ).addClass("hidden");
  }
  if (Tribe.room.isPrivate) {
    $(".pageTribe .tribePage.lobby .visibilityAndName .visibility .text").text(
      "private"
    );
    $(
      ".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button"
    ).html(`<i class="fa fa-fw fa-lock"></i>`);
  } else {
    $(".pageTribe .tribePage.lobby .visibilityAndName .visibility .text").text(
      "public"
    );
    $(
      ".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button"
    ).html(`<i class="fa fa-fw fa-lock-open"></i>`);
  }
}

export function updateRoomName(): void {
  if (Tribe.getSelf().isLeader) {
    $(
      ".pageTribe .tribePage.lobby .visibilityAndName .roomName .icon-button"
    ).removeClass("hidden");
  } else {
    $(
      ".pageTribe .tribePage.lobby .visibilityAndName .roomName .icon-button"
    ).addClass("hidden");
  }
  $(".pageTribe .tribePage.lobby .visibilityAndName .roomName .text").text(
    Tribe.room.name
  );
}

export function updateRoomConfig(): void {
  if (Tribe.room == undefined) return;
  $(".pageTribe .tribePage.lobby .currentConfig .groups").empty();

  const room = Tribe.room;

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Mode" data-balloon-pos="up" commands="commandsMode">
    <i class="fas fa-bars"></i>${room.config.mode}
    </div>
    `);

  if (room.config.mode === "time") {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Time" data-balloon-pos="up" commands="commandsTimeConfig">
    <i class="fas fa-clock"></i>${room.config.mode2}
    </div>
    `);
  } else if (room.config.mode === "words") {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Words" data-balloon-pos="up" commands="commandsWordCount">
    <i class="fas fa-font"></i>${room.config.mode2}
    </div>
    `);
  } else if (room.config.mode === "quote") {
    let qstring = "all";
    const num = room.config.mode2;
    if (num == 0) {
      qstring = "short";
    } else if (num == 1) {
      qstring = "medium";
    } else if (num == 2) {
      qstring = "long";
    } else if (num == 3) {
      qstring = "thicc";
    }

    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Quote length" data-balloon-pos="up" commands="commandsQuoteLengthConfig">
    <i class="fas fa-quote-right"></i>${qstring}
    </div>
    `);
  } else if (room.config.mode === "custom") {
    let t = "Custom settings:";

    t += `\ntext length: ${CustomText.text.length}`;
    if (CustomText.isTimeRandom || CustomText.isWordRandom) {
      let r = "";
      let n = "";
      if (CustomText.isTimeRandom) {
        r = "time";
        n = CustomText.time.toString();
      } else if (CustomText.isWordRandom) {
        r = "words";
        n = CustomText.word.toString();
      }
      t += `\nrandom: ${r} ${n}`;
    }

    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="${t}" data-balloon-pos="up" data-balloon-break commands="commandsQuoteLengthConfig">
    <i class="fas fa-tools"></i>custom
    </div>
    `);
  }

  if (room.config.difficulty === "normal") {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Difficulty" data-balloon-pos="up" commands="commandsDifficulty">
    <i class="far fa-star"></i>normal
    </div>
    `);
  } else if (room.config.difficulty === "expert") {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Difficulty" data-balloon-pos="up" commands="commandsDifficulty">
    <i class="fas fa-star-half-alt"></i>expert
    </div>
    `);
  } else if (room.config.difficulty === "master") {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Difficulty" data-balloon-pos="up" commands="commandsDifficulty">
    <i class="fas fa-star"></i>master
    </div>
    `);
  }

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Language" data-balloon-pos="up" commands="commandsLanguages">
    <i class="fas fa-globe-americas"></i>${room.config.language}
    </div>
    `);

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Punctuation" data-balloon-pos="up" commands="commandsPunctuation">
    <span class="punc" style="font-weight: 900;
      color: var(--main-color);
      width: 1.25rem;
      text-align: center;
      display: inline-block;
      margin-right: .5rem;
      letter-spacing: -.1rem;">!?</span>${
        room.config.punctuation ? "on" : "off"
      }
    </div>
    `);

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Numbers" data-balloon-pos="up" commands="commandsNumbers">
    <span class="numbers" style="font-weight: 900;
        color: var(--main-color);
        width: 1.25rem;
        text-align: center;
        margin-right: .1rem;
        display: inline-block;
        margin-right: .5rem;
        letter-spacing: -.1rem;">15</span>${room.config.numbers ? "on" : "off"}
    </div>
    `);

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Funbox" data-balloon-pos="up" commands="commandsFunbox">
    <i class="fas fa-gamepad"></i>${room.config.funbox}
    </div>
    `);

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Lazy mode" data-balloon-pos="up" commands="commandsLazyMode">
    <i class="fas fa-couch"></i>${room.config.lazyMode ? "on" : "off"}
    </div>
    `);

  if (room.config.stopOnError === "off") {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Stop on error" data-balloon-pos="up" commands="commandsStopOnError">
    <i class="fas fa-hand-paper"></i>off
    </div>
    `);
  } else {
    $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Stop on error" data-balloon-pos="up" commands="commandsStopOnError">
    <i class="fas fa-hand-paper"></i>stop on ${room.config.stopOnError}
    </div>
    `);
  }

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Min Wpm" data-balloon-pos="up" commands="commandsMinWpm">
    <i class="fas fa-bomb"></i>${room.config.minWpm}${
    room.config.minWpm !== "off" ? "wpm" : ""
  }
    </div>
    `);

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Min Acc" data-balloon-pos="up" commands="commandsMinAcc">
    <i class="fas fa-bomb"></i>${room.config.minAcc}${
    room.config.minAcc !== "off" ? "%" : ""
  }
    </div>
    `);

  $(".pageTribe .tribePage.lobby .currentConfig .groups").append(`
    <div class='group' aria-label="Min Burst" data-balloon-pos="up" commands="commandsMinBurst">
    <i class="fas fa-bomb"></i>${room.config.minBurst}${
    room.config.minBurst !== "off" ? "wpm" : ""
  }
    </div>
    `);
}

export function init(): void {
  reset();
  const link = location.origin + "/tribe_" + Tribe.room.id;
  $(".pageTribe .tribePage.lobby .inviteLink .code .text").text(Tribe.room.id);
  $(".pageTribe .tribePage.lobby .inviteLink .link").text(link);
  $(".pageTest #result #tribeResultBottom .inviteLink .code .text").text(
    Tribe.room.id
  );
  $(".pageTest #result #tribeResultBottom .inviteLink .link").text(link);
  TribeUserList.update("lobby");
  TribeButtons.update("lobby");
  updateVisibility();
  updateRoomName();
  updateRoomConfig();
  enableConfigButtons();
  enableNameVisibilityButtons();
  TribeConfig.apply(Tribe.room.config);
}

$(".pageTribe .tribePage.lobby .inviteLink .text").hover(
  function () {
    $(this).css(
      "color",
      "#" + $(".pageTribe .tribePage.lobby .inviteLink .text").text()
    );
  },
  function () {
    $(this).css("color", "");
  }
);

$(".pageTest #result #tribeResultBottom .inviteLink .text").hover(
  function () {
    $(this).css(
      "color",
      "#" + $(".pageTest #result #tribeResultBottom .inviteLink .text").text()
    );
  },
  function () {
    $(this).css("color", "");
  }
);

$(
  ".pageTribe .tribePage.lobby .inviteLink .text, .pageTest #result #tribeResultBottom .inviteLink .text"
).on("click", async () => {
  try {
    await navigator.clipboard.writeText(
      $(".pageTribe .tribePage.lobby .inviteLink .text").text()
    );
    Notifications.add("Code copied", 1);
  } catch (e) {
    Notifications.add("Could not copy to clipboard: " + e, -1);
  }
});

$(
  ".pageTribe .tribePage.lobby .inviteLink .link, .pageTest #result #tribeResultBottom .inviteLink .link"
).on("click", async () => {
  try {
    await navigator.clipboard.writeText(
      $(".pageTribe .tribePage.lobby .inviteLink .link").text()
    );
    Notifications.add("Link copied", 1);
  } catch (e) {
    Notifications.add("Could not copy to clipboard: " + e, -1);
  }
});

$(".pageTribe .tribePage.lobby .visibilityAndName .visibility .icon-button").on(
  "",
  () => {
    Tribe.socket.emit("room_toggle_visibility");
  }
);

$(".pageTribe .tribePage.lobby .visibilityAndName .roomName .icon-button").on(
  "click",
  () => {
    //TODO proper popup
    const name = prompt("Enter new room name");
    Tribe.socket.emit("room_update_name", { name });
  }
);

$(document).on(
  "click",
  ".pageTribe .tribePage.lobby .currentConfig .groups .group",
  (e) => {
    if (Tribe.getSelf().isLeader) {
      // let commands = eval($(e.currentTarget).attr("commands"));
      const commands = CommandlineLists.getList(
        $(e.currentTarget).attr("commands") as ListsObjectKeys
      );
      if (commands != undefined) {
        if ($(e.currentTarget).attr("commands") === "commandsTags") {
          CommandlineLists.updateTagCommands();
        }
        CommandlineLists.pushCurrent(commands);
        Commandline.show();
      }
    }
  }
);
