import * as UpdateConfig from "../config";
import * as DB from "../db";
import * as Notifications from "../elements/notifications";
import * as TestLogic from "../test/test-logic";
import * as TagController from "./tag-controller";

export function apply(_id: string): void {
  // console.log(DB.getSnapshot().presets);
  const snapshot = DB.getSnapshot();
  if (!snapshot) return;
  snapshot.presets?.forEach((preset) => {
    if (preset._id == _id) {
      UpdateConfig.apply(preset.config);
      TagController.clear(true);
      if (preset.config.tags) {
        preset.config.tags.forEach((tagid) => {
          TagController.set(tagid, true, false);
        });
        TagController.saveActiveToLocalStorage();
      }
      TestLogic.restart();
      Notifications.add("Preset applied", 1, {
        duration: 2,
      });
      UpdateConfig.saveFullConfigToLocalStorage();
    }
  });
}
