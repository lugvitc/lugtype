import { envConfig } from "../constants/env-config";
import AnimatedModal from "../utils/animated-modal";
import { showPopup } from "./simple-modals";
import * as Notifications from "../elements/notifications";
import { setMediaQueryDebugLevel } from "../ui";

let mediaQueryDebugLevel = 0;

export function show(): void {
  void modal.show();
}

async function setup(modalEl: HTMLElement): Promise<void> {
  modalEl.querySelector(".generateData")?.addEventListener("click", () => {
    showPopup("devGenerateData");
  });
  modalEl
    .querySelector(".toggleMediaQueryDebug")
    ?.addEventListener("click", () => {
      mediaQueryDebugLevel++;
      if (mediaQueryDebugLevel > 3) {
        mediaQueryDebugLevel = 0;
      }
      Notifications.add(
        `Setting media query debug level to ${mediaQueryDebugLevel}`,
        5
      );
      setMediaQueryDebugLevel(mediaQueryDebugLevel);
    });
}

const modal = new AnimatedModal({
  dialogId: "devOptionsModal",
  setup,
});

export function appendButton(): void {
  $("body").prepend(
    `
      <div id="devButtons">
        <a class='button configureAPI' href='${envConfig.backendUrl}/configure/' target='_blank' aria-label="Configure API" data-balloon-pos="right"><i class="fas fa-fw fa-server"></i></a>
        <button class='button showDevOptionsModal' aria-label="Dev options" data-balloon-pos="right"><i class="fas fa-fw fa-flask"></i></button>
      <div>
      `
  );
  document
    .querySelector("#devButtons .button.showDevOptionsModal")
    ?.addEventListener("click", () => {
      show();
    });
}
