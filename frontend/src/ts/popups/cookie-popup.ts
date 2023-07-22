import { activateAnalytics } from "../controllers/analytics-controller";
import { focusWords } from "../test/test-ui";
import * as Notifications from "../elements/notifications";
import * as Skeleton from "./skeleton";
import { isPopupVisible } from "../utils/misc";
import * as AdController from "../controllers/ad-controller";

const wrapperId = "cookiePopupWrapper";

let visible = false;

interface Accepted {
  security: boolean;
  analytics: boolean;
}

function getAcceptedObject(): Accepted | null {
  const acceptedCookies = localStorage.getItem("acceptedCookies");
  if (acceptedCookies) {
    return JSON.parse(acceptedCookies);
  } else {
    return null;
  }
}

function setAcceptedObject(obj: Accepted): void {
  localStorage.setItem("acceptedCookies", JSON.stringify(obj));
}

export function check(): void {
  const accepted = getAcceptedObject();
  if (accepted === null) {
    show();
  }
}

export function show(): void {
  Skeleton.append(wrapperId);
  $("#cookiePopupWrapper").removeClass("hidden");
  if (
    $("#cookiePopupWrapper")[0] === undefined ||
    $("#cookiePopupWrapper").is(":visible") === false ||
    $("#cookiePopupWrapper").outerHeight(true) === 0
  ) {
    //removed by cookie popup blocking extension
    $("#cookiePopupWrapper").addClass("hidden");
    visible = false;
    Skeleton.remove(wrapperId);
    return;
  }
  if (!isPopupVisible(wrapperId)) {
    $("#cookiePopupWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 125, () => {
        if (
          $("#cookiePopupWrapper").is(":visible") === false ||
          $("#cookiePopupWrapper").outerHeight(true) === 0
        ) {
          visible = false;
        } else {
          visible = true;
        }
      });
  }
}

export async function hide(): Promise<void> {
  if (isPopupVisible(wrapperId)) {
    focusWords();
    $("#cookiePopupWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        125,
        () => {
          $("#cookiePopupWrapper").addClass("hidden");
          visible = false;
          Skeleton.remove(wrapperId);
        }
      );
  }
}

export function showSettings(): void {
  $("#cookiePopup .main").addClass("hidden");
  $("#cookiePopup .settings").removeClass("hidden");
}

function verifyVisible(): void {
  if (!visible) return;
  if (
    $("#cookiePopupWrapper")[0] === undefined ||
    $("#cookiePopupWrapper").is(":visible") === false ||
    $("#cookiePopupWrapper").outerHeight(true) === 0
  ) {
    //removed by cookie popup blocking extension
    visible = false;
  }
}

$("#cookiePopup .acceptAll").on("click", () => {
  const accepted = {
    security: true,
    analytics: true,
  };
  setAcceptedObject(accepted);
  activateAnalytics();
  hide();
});

$("#cookiePopup .rejectAll").on("click", () => {
  const accepted = {
    security: true,
    analytics: false,
  };
  setAcceptedObject(accepted);
  hide();
});

$("#cookiePopup .acceptSelected").on("click", () => {
  const analytics = $("#cookiePopup .cookie.analytics input").prop("checked");
  const accepted = {
    security: true,
    analytics,
  };
  setAcceptedObject(accepted);
  hide();

  if (analytics === true) {
    activateAnalytics();
  }
});

$("#cookiePopup .openSettings").on("click", () => {
  showSettings();
});

$(document).on("keypress", (e) => {
  verifyVisible();
  if (visible) {
    e.preventDefault();
  }
});

$("#cookiePopup .cookie.ads .textButton").on("click", () => {
  try {
    AdController.showConsentPopup();
  } catch (e) {
    console.error("Failed to open ad consent UI");
    Notifications.add(
      "Failed to open Ad consent popup. Do you have an ad or cookie popup blocker enabled?",
      -1
    );
  }
});

Skeleton.save(wrapperId);
