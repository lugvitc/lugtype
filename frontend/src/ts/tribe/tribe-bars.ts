import * as Tribe from "./tribe";
import Config from "../config";
import * as SlowTimer from "../states/slow-timer";

export function init(page: string): void {
  let el: JQuery<HTMLElement> | undefined;

  if (page === "test") {
    el = $(".pageTest #typingTest .tribeBars");
  } else if (page === "tribe") {
    el = $(".pageTribe .lobby .tribeBars");
  }

  const room = Tribe.room;
  if (el) {
    el.empty();
  }
  Object.keys(room.users).forEach((userId) => {
    if (userId === Tribe.socket.id) return;
    const user = room.users[userId];
    let me = false;
    if (userId === Tribe.socket.id) me = true;
    if (user.isTyping && el) {
      el.append(`
      <tr class="player ${me ? "me" : ""}" id="${userId}">
        <td class="name">${user.name}</td>
        <td class="progress">
          <div class="barBg">
            <div class="bar" style="width: 0%;"></div>
          </div>
        </td>
        <td class="stats">
          <div class="wpm">-</div>
          <div class="acc">-</div>
        </td>
      </tr>
      `);
    }
  });
  const self = Tribe.getSelf();
  if (self.isTyping && el) {
    el.append(`
      <tr class="player me" id="${self.id}">
        <td class="name">${self.name}</td>
        <td class="progress">
          <div class="barBg">
            <div class="bar" style="width: 0%;"></div>
          </div>
        </td>
        <td class="stats">
          <div class="wpm">-</div>
          <div class="acc">-</div>
        </td>
      </tr>
      `);
  }
}

export function show(page: string): void {
  if (page === "test") {
    $(".pageTest #typingTest .tribeBars").removeClass("hidden");
  } else if (page === "tribe") {
    $(".pageTribe .tribeBars").removeClass("hidden");
  }
}

export function hide(page?: string): void {
  if (page === undefined) {
    hide("test");
    hide("tribe");
  } else if (page === "test") {
    $(".pageTest #typingTest .tribeBars").addClass("hidden");
  } else if (page === "tribe") {
    $(".pageTribe .tribeBars").addClass("hidden");
  }
}

export function reset(page?: string): void {
  if (page === undefined) {
    reset("test");
    reset("tribe");
  } else if (page === "test") {
    $(".pageTest #typingTest .tribeBars").empty();
  } else if (page === "tribe") {
    $(".pageTribe .tribeBars").empty();
  }
}

export function update(page: string, userId: string): void {
  if (page === undefined) {
    update("test", userId);
    update("tribe", userId);
    return;
  }
  let el: JQuery<HTMLElement> | undefined;
  if (page === "test") {
    el = $(".pageTest #typingTest .tribeBars");
  } else if (page === "tribe") {
    el = $(".pageTribe .tribeBars");
  }
  const user = Tribe.room.users[userId];

  if (!el) {
    return;
  }

  el.find(`.player[id=${userId}] .wpm`).text(Math.round(user.progress.wpm));
  el.find(`.player[id=${userId}] .acc`).text(
    Math.floor(user.progress.acc) + "%"
  );
  el.find(`.player[id=${userId}] .bar`)
    .stop(true, true)
    .animate(
      {
        width:
          Config.mode === "time"
            ? user.progress.wpmProgress + "%"
            : user.progress.progress + "%",
      },
      SlowTimer.get() ? 0 : 1000,
      "linear"
    );
}

export function completeBar(page: string, userId: string): void {
  if (page === undefined) {
    completeBar("test", userId);
    completeBar("tribe", userId);
    return;
  }
  let el: JQuery<HTMLElement> | undefined;
  if (page === "test") {
    el = $(".pageTest #typingTest .tribeBars");
  } else if (page === "tribe") {
    el = $(".pageTribe .tribeBars");
  }
  if (!el) {
    return;
  }

  el.find(`.player[id=${userId}] .bar`)
    .stop(true, false)
    .animate(
      {
        width: "100%",
      },
      SlowTimer.get() ? 0 : 1000,
      "linear"
    );
}

export function fadeUser(page: string, userId: string): void {
  if (page === undefined) {
    fadeUser("test", userId);
    fadeUser("tribe", userId);
    return;
  }
  let el: JQuery<HTMLElement> | undefined;
  if (page === "test") {
    el = $(".pageTest #typingTest .tribeBars");
  } else if (page === "tribe") {
    el = $(".pageTribe .tribeBars");
  }
  if (!el) {
    return;
  }

  el.find(`.player[id=${userId}]`).addClass("faded");
}

export function progresssendUpdate(
  wpm: number,
  raw: number,
  acc: number,
  progress: number
): void {
  Tribe.socket.emit("room_progress_update", {
    wpm: wpm,
    raw: raw,
    acc: acc,
    progress: progress,
  });
}

// function refreshTestUserList() {
//   $(".tribePlayers").empty();
//   Object.keys(room.users).forEach((sid) => {
//     if (
//       (room.private &&
//         (room.users[sid].isTyping ||
//           room.users[sid].isReady ||
//           room.users[sid].isLeader)) ||
//       !room.private
//     ) {
//       let user = room.users[sid];
//       let me = "";
//       if (sid === socket.id) {
//         me = " me";
//       }
//       $(".tribePlayers").append(`
//       <tr class="player ${me}" sid="${sid}">
//         <td class="name">${user.name}</td>
//         <td class="progress">
//           <div class="barBg">
//             <div class="bar" style="width: 0%;"></div>
//           </div>
//         </td>
//         <td class="stats">
//           <div class="wpm">-</div>
//           <div class="acc">-</div>
//         </td>
//       </tr>
//       `);
//     }
//   });
//   $(".tribePlayers").removeClass("hidden");

//   $(".tribeResult table tbody").empty();
//   Object.keys(room.users).forEach((sid) => {
//     if (
//       (room.private &&
//         (room.users[sid].isTyping ||
//           room.users[sid].isReady ||
//           room.users[sid].isLeader)) ||
//       !room.private
//     ) {
//       let user = room.users[sid];
//       let me = "";
//       if (sid === socket.id) {
//         me = " me";
//       }
//       $(".tribeResult table tbody").append(`
//       <tr class="player ${me}" sid="${sid}">
//         <td class="name">${user.name}</td>
//         <td class="pos"><span class="num">-</span><span class="points"></span></td>
//         <td class="crown"><i class="fas fa-crown" style="opacity:0"></i></td>
//         <td>
//           <div class="wpm">
//             <div class="text">-</div>
//             <div class="miniCrown"><i class="fas fa-crown"></i></div>
//           </div>
//           <div class="acc">
//             <div class="text">-</div>
//             <div class="miniCrown"><i class="fas fa-crown"></i></div>
//           </div>
//         </td>
//         <td>
//           <div class="raw">
//             <div class="text">-</div>
//             <div class="miniCrown"><i class="fas fa-crown"></i></div>
//           </div>
//           <div class="con">
//             <div class="text">-</div>
//             <div class="miniCrown"><i class="fas fa-crown"></i></div>
//           </div>
//         </td>
//         <td>
//           <div class="char">-</div>
//           <div class="other">-</div>
//         </td>
//         <td class="progressAndGraph">
//           <div class="progress">
//             <div class="barBg">
//               <div class="bar" style="width: 0%;"></div>
//             </div>
//           </div>
//           <div class="graph hidden" style="height: 50px">
//             <canvas></canvas>
//           </div>
//         </td>
//       </tr>
//       `);
//     }
//   });
//   $(".tribeResult").removeClass("hidden");
// }
