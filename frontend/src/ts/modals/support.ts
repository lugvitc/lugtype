import AnimatedModal from "../utils/animated-modal";
import { getCommandline } from "../utils/async-modules";

export function show(): void {
  void modal.show();
}

const modal = new AnimatedModal("supportModal", "popups", undefined, {
  setup: (modalEl): void => {
    modalEl.querySelector("button.ads")?.addEventListener("click", async () => {
      const commandline = await getCommandline();
      await modal.hide({
        animationMode: "modalOnly",
        animationDurationMs: 62.5,
      });
      commandline.show(
        { subgroupOverride: "enableAds" },
        { animationMode: "modalOnly", animationDurationMs: 62.5 }
      );
    });
  },
});
