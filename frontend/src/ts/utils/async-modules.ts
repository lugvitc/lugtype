import * as Loader from "../elements/loader";
import * as Notifications from "../elements/notifications";
import { createErrorMessage } from "./misc";

export async function getCommandline(): Promise<
  typeof import("../commandline/commandline.js")
> {
  try {
    Loader.show();
    const module = await import("../commandline/commandline.js");
    Loader.hide();
    return module;
  } catch (e) {
    Loader.hide();
    if (
      e instanceof Error &&
      e.message.includes("Failed to fetch dynamically imported module")
    ) {
      Notifications.add(
        "Failed to load commandline module: could not fetch",
        -1
      );
    } else {
      const msg = createErrorMessage(e, "Failed to load commandline module");
      Notifications.add(msg, -1);
    }
    throw e;
  }
}
