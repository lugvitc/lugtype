import * as Tribe from "./tribe";
import * as Misc from "../utils/misc";
import Config from "../config";
import * as SlowTimer from "../states/slow-timer";

const initialised: Record<string, boolean | object> = {};

export async function send(result): Promise<void> {
  Tribe.socket.emit("room_result", { result });
}

export function reset(page?: string): void {
  if (page === undefined) {
    reset("result");
  } else if (page == "result") {
    initialised[page] = {};
    $(".pageTest #result #tribeResults table tbody").empty();
    $(".pageTest #result #tribeResults").addClass("hidden");
  }
}

export function init(page: string): void {
  if (page === "result") {
    reset(page);

    const el = $(".pageTest #result #tribeResults table tbody");

    Object.keys(Tribe.room.users).forEach((userId) => {
      const user = Tribe.room.users[userId];
      if (user.isAfk) return;
      el.append(`
        <tr class="user ${
          userId === Tribe.socket.id ? "me" : ""
        }" id="${userId}">
          <td class="name">${user.name}</td>
          <td>
            <div class="pos">-</div>
            <div class="points">-</div>
          </td>
          <td>
            <div class="crown">
              <div class="icon invisible"><i class="fas fa-fw fa-crown"></i></div>
              <div class="glow invisible"></div>
            </div>
          </td>
          <td>
            <div class="wpm">
              <div class="text">-</div>
            </div>
            <div class="acc">
              <div class="text">-</div>
            </div>
          </td>
          <td>
            <div class="raw">
              <div class="text">-</div>
            </div>
            <div class="consistency">
              <div class="text">-</div>
            </div>
          </td>
          <td>
            <div class="char">
              <div class="text">-</div>
            </div>
            <div class="other">
              <div class="text">-</div>
            </div>
          </td>
          <td>
            <div class="progress">
              <div class="barBg">
                <div class="bar" style="width: 0%;"></div>
              </div>
            </div>
            <div class="minichart hidden">
              <canvas>
              </canvas>
            </div>
          </td>
        </tr>
      `);
    });

    $(".pageTest #result #tribeResults").removeClass("hidden");
    initialised[page] = true;
  }
}

export function updateBar(
  page: string,
  userId: string,
  percentOverride: string
): void {
  if (page === "result") {
    const el = $(
      `.pageTest #result #tribeResults table tbody tr#${userId} .progress .bar`
    );
    const user = Tribe.room.users[userId];
    let percent =
      Config.mode === "time"
        ? user.progress.wpmProgress + "%"
        : user.progress.progress + "%";
    if (percentOverride) {
      percent = percentOverride + "%";
    }
    el.stop(true, false).animate(
      {
        width: percent,
      },
      SlowTimer.get() ? 0 : 1000,
      "linear"
    );
  }
}

export function updatePositions(page: string, orderedList): void {
  const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  if (page === "result") {
    orderedList.forEach((user, index) => {
      const userEl = $(
        `.pageTest #result #tribeResults table tbody tr.user[id="${user.id}"]`
      );
      const string = Misc.getPositionString(index + 1);
      userEl.find(".pos").text(string);
      userEl
        .find(".points")
        .text(
          points[index]
            ? `+${points[index]}${points[index] === 1 ? "pt" : "pts"}`
            : ""
        );
    });
  }
}

export function updateMiniCrowns(page: string, miniCrowns): void {
  if (page === "result") {
    Object.keys(miniCrowns).forEach((crown) => {
      const userId = miniCrowns[crown];
      const userEl = $(
        `.pageTest #result #tribeResults table tbody tr.user[id="${userId}"]`
      );
      userEl.find(`.${crown}`).append(`
        <div class="miniCrown">
        <i class="fas fa-fw fa-crown"></i>
        </div>
      `);
    });
  }
}

export function showCrown(
  page: string,
  userId: string,
  isGlowing: boolean
): void {
  if (page === "result") {
    const userEl = $(
      `.pageTest #result #tribeResults table tbody tr.user[id="${userId}"]`
    );
    userEl.find(`.crown .icon`).removeClass("invisible");
    if (isGlowing) {
      userEl.find(".crown").attr("aria-label", "Dominated");
      userEl.find(".crown").attr("data-balloon-pos", "up");
      userEl.find(`.crown .glow`).removeClass("invisible");
    }
  }
}

function updateUser(page: string, userId: string): void {
  if (page == "result") {
    const userEl = $(
      `.pageTest #result #tribeResults table tbody tr.user[id="${userId}"]`
    );
    const user = Tribe.room.users[userId];
    if (user.isFinished) {
      userEl.find(`.wpm .text`).text(user.result.wpm.toFixed(2));
      userEl.find(`.raw .text`).text(user.result.raw.toFixed(2));
      userEl.find(`.acc .text`).text(user.result.acc.toFixed(2) + "%");
      userEl
        .find(`.consistency .text`)
        .text(user.result.consistency.toFixed(2) + "%");
      userEl.find(`.char .text`).text(
        `
        ${user.result.charStats[0]}/${user.result.charStats[1]}/${user.result.charStats[2]}/${user.result.charStats[3]}
        `
      );
      let otherText = "-";
      const resolve = user.result.resolve;
      if (resolve.afk) {
        otherText = "afk";
      } else if (resolve.repeated) {
        otherText = "repeated";
      } else if (resolve.failed) {
        otherText = `failed(${resolve.failedReason})`;
      } else if (resolve.saved === false) {
        otherText = `save failed(${resolve.saveFailedMessage})`;
      } else if (resolve.valid === false) {
        otherText = `invalid`;
      } else if (resolve.saved && resolve.isPb) {
        otherText = "new pb";
      }
      userEl.find(`.other .text`).text(otherText);
    }
  }
}

export function update(page: string, userId?: string): void {
  if (!initialised[page]) init(page);
  if (userId) {
    updateUser(page, userId);
  } else {
    Object.keys(Tribe.room.users).forEach((userId) => {
      const u = Tribe.room.users[userId];
      if (u.isFinished) updateUser(page, userId);
    });
  }
}

export function fadeUser(page: string, userId: string): void {
  if (page == "result") {
    const userEl = $(
      `.pageTest #result #tribeResults table tbody tr.user[id="${userId}"]`
    );
    userEl.addClass("faded");
  }
}

let timerText = "Time left for everyone to finish";
let timerVisible = false;

export function updateTimerText(text: string): void {
  timerText = text;
}

export function updateTimer(value: string): void {
  if (!timerVisible) showTimer();
  $(".pageTest #result #tribeResults .top").text(
    timerText + ": " + value + "s"
  );
}

function showTimer(): void {
  timerVisible = true;
  $(".pageTest #result #tribeResults .top")
    .removeClass("invisible")
    .css({ opacity: 0 })
    .animate({ opacity: 1 }, 125);
}

export function hideTimer(): void {
  timerVisible = false;
  $(".pageTest #result #tribeResults .top")
    .css({ opacity: 1 })
    .animate({ opacity: 0 }, 125, () => {
      $(".pageTest #result #tribeResults .top").addClass("invisible");
    });
}
