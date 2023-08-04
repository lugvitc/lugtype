import Config from "../config";
import * as TestState from "../test/test-state";
import * as ConfigEvent from "../observables/config-event";

export function update(acc: number): void {
  let number = Math.floor(acc);
  if (Config.blindMode) {
    number = 100;
  }
  (document.querySelector("#miniTimerAndLiveSpeed .acc") as Element).innerHTML =
    number + "%";
  (document.querySelector("#liveAcc") as Element).innerHTML = number + "%";
}

export function show(): void {
  if (!Config.showLiveAcc) return;
  if (!TestState.isActive) return;
  if (Config.timerStyle === "mini") {
    if (!$("#miniTimerAndLiveSpeed .acc").hasClass("hidden")) return;
    $("#miniTimerAndLiveSpeed .acc")
      .stop(true, false)
      .removeClass("hidden")
      .css("opacity", 0)
      .animate(
        {
          opacity: Config.timerOpacity,
        },
        125
      );
  } else {
    if (!$("#liveAcc").hasClass("hidden")) return;
    $("#liveAcc")
      .stop(true, false)
      .removeClass("hidden")
      .css("opacity", 0)
      .animate(
        {
          opacity: Config.timerOpacity,
        },
        125
      );
  }
}

export function hide(): void {
  // $("#liveSpeed").css("opacity", 0);
  // $("#miniTimerAndLiveSpeed .wpm").css("opacity", 0);
  $("#liveAcc")
    .stop(true, false)
    .animate(
      {
        opacity: 0,
      },
      125,
      () => {
        $("#liveAcc").addClass("hidden");
      }
    );
  $("#miniTimerAndLiveSpeed .acc")
    .stop(true, false)
    .animate(
      {
        opacity: 0,
      },
      125,
      () => {
        $("#miniTimerAndLiveSpeed .acc").addClass("hidden");
      }
    );
}

ConfigEvent.subscribe((eventKey, eventValue) => {
  if (eventKey === "showLiveAcc") eventValue ? show() : hide();
});
