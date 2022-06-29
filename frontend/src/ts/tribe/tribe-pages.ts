import { swapElements } from "../utils/misc";
import * as TribeStats from "./tribe-stats";

let active = "preloader";
let transition = false;

export async function change(
  page: string
  // These were commented because no value was passed to them in the entire use of this function
  // middleCallback = (() => { /* noop */ }),
  // finishCallback = () => { }
): Promise<void> {
  return new Promise((resolve, _reject) => {
    if (page === active) return;
    if (transition) return;
    transition = true;
    const activePage = $(".page.pageTribe .tribePage.active");
    swapElements(
      activePage,
      $(`.page.pageTribe .tribePage.${page}`),
      250,
      async () => {
        active = page;
        activePage.removeClass("active");
        $(`.page.pageTribe .tribePage.${page}`).addClass("active");
        transition = false;
        // await finishCallback();
        if (page === "menu") {
          TribeStats.refresh();
        }
        resolve();
      },
      async () => {
        // middleCallback();
      }
    );
  });
}
