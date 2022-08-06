import { debounce } from "throttle-debounce";
import * as Misc from "../utils/misc";
import * as ConfigEvent from "../observables/config-event";
import * as BannerEvent from "../observables/banner-event";
import Config from "../config";
import * as TestActive from "../states/test-active";

const breakpoint = 900;
let widerThanBreakpoint = true;

let initialised = false;

export let adBlock: boolean;
export let cookieBlocker: boolean;

export function init(): void {
  $("head").append(`<script>
!function(e){var s=new XMLHttpRequest;s.open("GET","https://api.enthusiastgaming.net/scripts/cdn.enthusiast.gg/script/eg-aps/release/eg-aps-bootstrap-v2.0.0.bundle.js?site=monkeytype.com",!0),s.onreadystatechange=function(){var t;4==s.readyState&&(200<=s.status&&s.status<300||304==s.status)&&((t=e.createElement("script")).type="text/javascript",t.text=s.responseText,e.head.appendChild(t))},s.send(null)}(document);
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W7WN5QV');
</script>`);
  $("body")
    .prepend(`<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W7WN5QV"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`);

  setInterval(() => {
    if (TestActive.get()) {
      return;
    }
    refreshVisible();
  }, 60000);

  initialised = true;
}

export function removeAll(): void {
  removeSellout();
  removeOn();
  removeResult();
}

export function removeSellout(): void {
  $("#ad-footer-wrapper").remove();
  $("#ad-footer-small-wrapper").remove();
  $("#ad-about-1-wrapper").remove();
  $("#ad-about-1-small-wrapper").remove();
  $("#ad-about-2-wrapper").remove();
  $("#ad-about-2-small-wrapper").remove();
  $("#ad-settings-1-wrapper").remove();
  $("#ad-settings-1-small-wrapper").remove();
  $("#ad-settings-2-wrapper").remove();
  $("#ad-settings-2-small-wrapper").remove();
  $("#ad-settings-3-wrapper").remove();
  $("#ad-settings-3-small-wrapper").remove();
  $("#ad-account-1-wrapper").remove();
  $("#ad-account-1-small-wrapper").remove();
  $("#ad-account-2-wrapper").remove();
  $("#ad-account-2-small-wrapper").remove();
}

export function removeOn(): void {
  $("#ad-vertical-right-wrapper").remove();
  $("#ad-vertical-left-wrapper").remove();
}

export function removeResult(): void {
  $("#ad-result-wrapper").remove();
  $("#ad-result-small-wrapper").remove();
}

function updateVerticalMargin(): void {
  const height = $("#bannerCenter").height() as number;
  const margin = height + Misc.convertRemToPixels(2) + "px";
  $("#ad-vertical-left-wrapper").css("margin-top", margin);
  $("#ad-vertical-right-wrapper").css("margin-top", margin);
}

function updateBreakpoint(noReinstate = false): void {
  const beforeUpdate = widerThanBreakpoint;

  if (window.innerWidth > breakpoint) {
    widerThanBreakpoint = true;
  } else {
    widerThanBreakpoint = false;
  }
  if (noReinstate) return;
  if (beforeUpdate !== widerThanBreakpoint) {
    reinstate();
  }
}

export async function refreshVisible(): Promise<void> {
  //@ts-ignore
  const adDivs = Object.keys(window.egAdPack.gptAdSlots);
  const visibleAdDivs = [];

  for (let i = 0; i < adDivs.length; i++) {
    const el = document.querySelectorAll(
      "[data-adunit-name='" + adDivs[i] + "']"
    )[0];
    if (!el) continue;
    const elParent = el.parentElement as HTMLElement;
    if (
      window.getComputedStyle(elParent).getPropertyValue("display") != "none"
    ) {
      visibleAdDivs.push(adDivs[i]);
    }
  }
  //@ts-ignore
  window.egAps.refreshAds(visibleAdDivs);
}

export async function checkAdblock(): Promise<void> {
  return new Promise((resolve) => {
    if (adBlock === undefined) {
      //@ts-ignore
      if (window.egAdPack === undefined) {
        adBlock = true;
      } else {
        adBlock = false;
      }
    }
    resolve();
  });
}

export async function checkCookieblocker(): Promise<void> {
  return new Promise((resolve) => {
    if (cookieBlocker === undefined) {
      //@ts-ignore
      if (window.__tcfapi === undefined) {
        cookieBlocker = true;
        resolve();
      }
      //@ts-ignore
      window.__tcfapi("getTCData", 2, (tcData, success) => {
        if (success) {
          if (tcData.eventStatus === "cmpuishown") {
            cookieBlocker = true;
          } else {
            cookieBlocker = false;
          }
        } else {
          cookieBlocker = true;
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export async function reinstate(): Promise<boolean> {
  if (Config.ads === "off") return false;
  if (!initialised) {
    init();
    return true;
  }
  await checkAdblock();
  await checkCookieblocker();
  if (adBlock || cookieBlocker) return false;

  try {
    //@ts-ignore
    window.egAps.reinstate();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function renderResult(): Promise<void> {
  if (Config.ads === "off") return;
  if (!initialised) {
    init();
  }
  await checkAdblock();
  await checkCookieblocker();

  if (adBlock) {
    $("#ad-result-wrapper .iconAndText .text").html(`
    Using an ad blocker? No worries
    <div class="smalltext">
      We understand ads can be annoying
      <br />
      You can
      <i>disable all ads</i>
      in the settings
    </div>
    `);
    return;
  }

  if (cookieBlocker) {
    $("#ad-result-wrapper .iconAndText .text").html(`
    Ads not working? Ooops
    <div class="smalltext">
      You may have a cookie popup blocker enabled - ads will not show without your consent
      <br />
      You can also 
      <i>disable all ads</i>
      in the settings if you wish
    </div>
    `);
    return;
  }

  if (widerThanBreakpoint) {
    // $("#ad-result-wrapper").html(`
    // <div class="icon"><i class="fas fa-ad"></i></div>
    // <div id="ad-result"></div>
    // `);
    // if ($("#ad-result-wrapper").is(":empty")) {
    //@ts-ignore
    // window.egAps.render(["ad-result"]);
    // } else {
    //@ts-ignore
    window.egAps.refreshAds([
      "ad-result",
      "ad-vertical-left",
      "ad-vertical-right",
      "ad-footer",
    ]);
    // }
  } else {
    // $("#ad-result-small-wrapper").html(`
    // <div class="icon small"><i class="fas fa-ad"></i></div>
    // <div id="ad-result-small"></div>
    // `);
    // if ($("#ad-result-small-wrapper").is(":empty")) {
    //@ts-ignore
    // window.egAps.render(["ad-result-small"]);
    // } else {
    //@ts-ignore
    window.egAps.refreshAds([
      "ad-result-small",
      "ad-vertical-left",
      "ad-vertical-right",
      "ad-footer-small",
    ]);
    // }
  }
}

export function updateTestPageAds(visible: boolean): void {
  if (visible) {
    $("#ad-vertical-left-wrapper").removeClass("testPage");
    $("#ad-vertical-right-wrapper").removeClass("testPage");
    $("#ad-footer-wrapper").removeClass("testPage");
    $("#ad-footer-small-wrapper").removeClass("testPage");
  } else {
    $("#ad-vertical-left-wrapper").addClass("testPage");
    $("#ad-vertical-right-wrapper").addClass("testPage");
    $("#ad-footer-wrapper").addClass("testPage");
    $("#ad-footer-small-wrapper").addClass("testPage");
  }
}

export function destroyResult(): void {
  // $("#ad-result-wrapper").empty();
  // $("#ad-result-small-wrapper").empty();
}

const debouncedMarginUpdate = debounce(100, updateVerticalMargin);
const debouncedBreakpointUpdate = debounce(100, updateBreakpoint);

$(window).on("resize", () => {
  debouncedMarginUpdate();
  debouncedBreakpointUpdate();
});

ConfigEvent.subscribe((event, value) => {
  if (event === "ads") {
    if (value == "off") {
      removeAll();
    } else if (value == "result") {
      removeSellout();
      removeOn();
    } else if (value == "on") {
      removeSellout();
    }
  }
});

BannerEvent.subscribe(() => {
  updateVerticalMargin();
});

$(document).ready(() => {
  updateBreakpoint(true);
});

window.onerror = function (error): void {
  if (typeof error === "string" && error.substring(0, 6) === "EG APS") {
    $("#ad-result-wrapper .iconAndText").addClass("withLeft");
  }
};
