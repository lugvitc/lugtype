import * as UpdateConfig from "../config.js";
import * as DB from "../db.js";
import * as Notifications from "../elements/notifications.js";
import * as TestLogic from "../test/test-logic.js";
import * as TagController from "./tag-controller.js";

export async function apply(_id: string): Promise<void> {
  const snapshot = DB.getSnapshot();
  if (!snapshot) return;

  const presetToApply = snapshot.presets?.find((preset) => preset._id === _id);

  if (presetToApply === undefined) {
    Notifications.add("Preset not found", 0);
    return;
  }

  await UpdateConfig.apply(presetToApply.config);
  TagController.clear(true);
  if (presetToApply.config.tags) {
    for (const tagId of presetToApply.config.tags) {
      TagController.set(tagId, true, false);
    }
    TagController.saveActiveToLocalStorage();
  }
  TestLogic.restart();
  Notifications.add("Preset applied", 1, {
    duration: 2,
  });
  UpdateConfig.saveFullConfigToLocalStorage();
}
