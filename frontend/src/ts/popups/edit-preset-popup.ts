import Ape from "../ape";
import * as DB from "../db";
import * as Config from "../config";
import * as Loader from "../elements/loader";
import * as Settings from "../pages/settings";
import * as Notifications from "../elements/notifications";
import * as ConnectionState from "../states/connection";
import * as Skeleton from "./skeleton";
import { isPopupVisible } from "../utils/misc";

const wrapperId = "presetWrapper";

export function show(action: string, id?: string, name?: string): void {
  if (!ConnectionState.get()) {
    Notifications.add("You are offline", 0, {
      duration: 2,
    });
    return;
  }
  Skeleton.append(wrapperId);

  if (action === "add") {
    $("#presetWrapper #presetEdit").attr("action", "add");
    $("#presetWrapper #presetEdit .title").html("Add new preset");
    $("#presetWrapper #presetEdit button").html(`add`);
    $("#presetWrapper #presetEdit input.text").val("");
    $("#presetWrapper #presetEdit input.text").removeClass("hidden");
    $("#presetWrapper #presetEdit label").addClass("hidden");
  } else if (action === "edit" && id !== undefined && name !== undefined) {
    $("#presetWrapper #presetEdit").attr("action", "edit");
    $("#presetWrapper #presetEdit").attr("presetid", id);
    $("#presetWrapper #presetEdit .title").html("Edit preset");
    $("#presetWrapper #presetEdit button").html(`save`);
    $("#presetWrapper #presetEdit input.text").val(name);
    $("#presetWrapper #presetEdit input.text").removeClass("hidden");
    $("#presetWrapper #presetEdit label input").prop("checked", false);
    $("#presetWrapper #presetEdit label").removeClass("hidden");
  } else if (action === "remove" && id !== undefined && name !== undefined) {
    $("#presetWrapper #presetEdit").attr("action", "remove");
    $("#presetWrapper #presetEdit").attr("presetid", id);
    $("#presetWrapper #presetEdit .title").html("Delete preset " + name);
    $("#presetWrapper #presetEdit button").html("Delete");
    $("#presetWrapper #presetEdit input.text").addClass("hidden");
    $("#presetWrapper #presetEdit label").addClass("hidden");
  }

  if (!isPopupVisible(wrapperId)) {
    $("#presetWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 125, () => {
        const input = $("#presetWrapper #presetEdit input");
        if (!input.hasClass("hidden")) {
          $("#presetWrapper #presetEdit input").trigger("focus");
        } else {
          $("#presetWrapper").trigger("focus");
        }
      });
  }
}

function hide(): void {
  if (isPopupVisible(wrapperId)) {
    $("#presetWrapper #presetEdit").attr("action", "");
    $("#presetWrapper #presetEdit").attr("tagid", "");
    $("#presetWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        125,
        () => {
          $("#presetWrapper").addClass("hidden");
          Skeleton.remove(wrapperId);
        }
      );
  }
}

async function apply(): Promise<void> {
  const action = $("#presetWrapper #presetEdit").attr("action");
  const propPresetName = $("#presetWrapper #presetEdit input").val() as string;
  const presetName = propPresetName.replaceAll(" ", "_");
  const presetId = $("#presetWrapper #presetEdit").attr("presetId") as string;

  const updateConfig: boolean = $(
    "#presetWrapper #presetEdit label input"
  ).prop("checked");

  let configChanges: MonkeyTypes.ConfigChanges = {};

  if ((updateConfig && action === "edit") || action === "add") {
    configChanges = Config.getConfigChanges();

    const tags = DB.getSnapshot()?.tags ?? [];

    const activeTagIds: string[] = tags
      .filter((tag: MonkeyTypes.UserTag) => tag.active)
      .map((tag: MonkeyTypes.UserTag) => tag._id);
    configChanges.tags = activeTagIds;
  }

  const snapshotPresets = DB.getSnapshot()?.presets ?? [];

  hide();

  Loader.show();

  if (action === "add") {
    const response = await Ape.presets.add(presetName, configChanges);

    if (response.status !== 200 || response.data === null) {
      Notifications.add(
        "Failed to add preset: " +
          response.message.replace(presetName, propPresetName),
        -1
      );
    } else {
      Notifications.add("Preset added", 1, {
        duration: 2,
      });
      snapshotPresets.push({
        name: presetName,
        config: configChanges,
        display: propPresetName,
        _id: response.data.presetId,
      } as MonkeyTypes.SnapshotPreset);
    }
  } else if (action === "edit") {
    const response = await Ape.presets.edit(
      presetId,
      presetName,
      configChanges
    );

    if (response.status !== 200) {
      Notifications.add("Failed to edit preset: " + response.message, -1);
    } else {
      Notifications.add("Preset updated", 1);
      const preset = snapshotPresets.filter(
        (preset: MonkeyTypes.SnapshotPreset) => preset._id === presetId
      )[0] as MonkeyTypes.SnapshotPreset;
      preset.name = presetName;
      preset.display = presetName.replace(/_/g, " ");
      if (updateConfig) {
        preset.config = configChanges;
      }
    }
  } else if (action === "remove") {
    const response = await Ape.presets.delete(presetId);

    if (response.status !== 200) {
      Notifications.add("Failed to remove preset: " + response.message, -1);
    } else {
      Notifications.add("Preset removed", 1);
      snapshotPresets.forEach(
        (preset: MonkeyTypes.SnapshotPreset, index: number) => {
          if (preset._id === presetId) {
            snapshotPresets.splice(index, 1);
          }
        }
      );
    }
  }

  void Settings.update();
  Loader.hide();
}

$("#presetWrapper").on("click", (e) => {
  if ($(e.target).attr("id") === "presetWrapper") {
    hide();
  }
});

$("#presetWrapper #presetEdit form").on("submit", (e) => {
  e.preventDefault();
  void apply();
});

$(".pageSettings .section.presets").on("click", ".addPresetButton", () => {
  show("add");
});

$(".pageSettings .section.presets").on("click", ".editButton", (e) => {
  const presetid = $(e.currentTarget).parent(".preset").attr("data-id");
  const name = $(e.currentTarget).parent(".preset").attr("data-display");
  show("edit", presetid, name);
});

$(".pageSettings .section.presets").on("click", ".removeButton", (e) => {
  const presetid = $(e.currentTarget).parent(".preset").attr("data-id");
  const name = $(e.currentTarget).parent(".preset").attr("data-display");
  show("remove", presetid, name);
});

$(document).on("keydown", (event) => {
  if (event.key === "Escape" && isPopupVisible(wrapperId)) {
    hide();
    event.preventDefault();
  }
});

Skeleton.save(wrapperId);
