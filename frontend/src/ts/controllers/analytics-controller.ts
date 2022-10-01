import {
  Analytics as AnalyticsType,
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from "firebase/analytics";
import { app as firebaseApp } from "../firebase";
import { createErrorMessage } from "../utils/misc";

export let Analytics: AnalyticsType;

export async function log(
  eventName: string,
  params?: { [key: string]: string }
): Promise<void> {
  try {
    logEvent(Analytics, eventName, params);
  } catch (e) {
    console.log("Analytics unavailable");
  }
}

const lsString = localStorage.getItem("acceptedCookies");
let acceptedCookies: {
  security: boolean;
  analytics: boolean;
} | null;
if (lsString) {
  acceptedCookies = JSON.parse(lsString);
} else {
  acceptedCookies = null;
}

if (acceptedCookies !== null) {
  if (acceptedCookies["analytics"] === true) {
    activateAnalytics();
  }
}

export function activateAnalytics(): void {
  try {
    Analytics = getAnalytics(firebaseApp);
    setAnalyticsCollectionEnabled(Analytics, true);
    $("body").append(`
    <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=UA-165993088-1"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "UA-165993088-1");
  </script>`);
  } catch (e) {
    console.error(createErrorMessage(e, "Failed to activate analytics"));
  }
}
