import * as Misc from "./utils/misc";
import * as Notifications from "./elements/notifications";
import * as FunboxList from "./test/funbox/funbox-list";

type PossibleType =
  | "string"
  | "number"
  | "numberArray"
  | "boolean"
  | "undefined"
  | "null"
  | "stringArray"
  | string[]
  | number[];

type PossibleTypeAsync = "layoutfluid";

export function isConfigKeyValid(name: string): boolean {
  if (name === null || name === undefined || name === "") return false;
  if (name.length > 30) return false;
  return /^[0-9a-zA-Z_.\-#+]+$/.test(name);
}

function invalid(key: string, val: unknown, customMessage?: string): void {
  if (customMessage === undefined) {
    Notifications.add(
      `Invalid value for ${key} (${val}). Please try to change this setting again.`,
      -1
    );
  } else {
    Notifications.add(
      `Invalid value for ${key} (${val}). ${customMessage}`,
      -1
    );
  }

  console.error(`Invalid value key ${key} value ${val} type ${typeof val}`);
}

function isArray(val: unknown): val is unknown[] {
  return val instanceof Array;
}

export function isConfigValueValid(
  key: string,
  val: unknown,
  possibleTypes: PossibleType[]
): boolean {
  let isValid = false;

  // might be used in the future
  // eslint-disable-next-line
  let customMessage: string | undefined = undefined;

  for (const possibleType of possibleTypes) {
    switch (possibleType) {
      case "boolean":
        if (typeof val === "boolean") isValid = true;
        break;

      case "null":
        if (val === null) isValid = true;
        break;

      case "number":
        if (typeof val === "number" && !isNaN(val)) isValid = true;
        break;

      case "numberArray":
        if (isArray(val) && val.every((v) => typeof v === "number")) {
          isValid = true;
        }
        break;

      case "string":
        if (typeof val === "string") isValid = true;
        break;

      case "stringArray":
        if (isArray(val) && val.every((v) => typeof v === "string")) {
          isValid = true;
        }
        break;

      case "undefined":
        if (typeof val === "undefined" || val === undefined) isValid = true;
        break;

      default:
        if (isArray(possibleType)) {
          if (possibleType.includes(<never>val)) isValid = true;
        }
        break;
    }
  }

  if (!isValid) invalid(key, val, customMessage);

  return isValid;
}

export async function isConfigValueValidAsync(
  key: string,
  val: unknown,
  possibleTypes: PossibleTypeAsync[]
): Promise<boolean> {
  let isValid = false;

  let customMessage: string | undefined = undefined;

  for (const possibleType of possibleTypes) {
    switch (possibleType) {
      case "layoutfluid": {
        if (typeof val !== "string") break;

        const layoutNames = val.split(/[# ]+/);

        if (layoutNames.length < 2 || layoutNames.length > 5) break;

        try {
          await Misc.getLayoutsList();
        } catch (e) {
          customMessage = Misc.createErrorMessage(
            e,
            "Failed to validate layoutfluid value"
          );
          break;
        }

        // convert the layout names to layouts
        const layouts = await Promise.all(
          layoutNames.map(async (layoutName) => Misc.getLayout(layoutName))
        );

        // check if all layouts exist
        if (!layouts.every((layout) => layout !== undefined)) {
          const invalidLayoutNames = layoutNames.map((layoutName, index) => [
            layoutName,
            layouts[index],
          ]);

          const invalidLayouts = invalidLayoutNames
            .filter(([_, layout]) => layout === undefined)
            .map(([layoutName]) => layoutName);

          customMessage = `The following inputted layouts do not exist: ${invalidLayouts.join(
            ", "
          )}`;

          break;
        }

        isValid = true;

        break;
      }
    }
  }

  if (!isValid) invalid(key, val, customMessage);

  return isValid;
}

function checkFunboxForcedConfigs(
  key: string,
  value: MonkeyTypes.ConfigValues,
  funbox: string
): boolean {
  if (FunboxList.get(funbox).length === 0) return true;

  const forcedConfigs: Record<string, MonkeyTypes.ConfigValues[]> = {};
  // collect all forced configs
  for (const fb of FunboxList.get(funbox)) {
    if (fb.forcedConfig) {
      //push keys to forcedConfigs, if they don't exist. if they do, intersect the values
      for (const key in fb.forcedConfig) {
        if (forcedConfigs[key] === undefined) {
          forcedConfigs[key] = fb.forcedConfig[key];
        } else {
          forcedConfigs[key] = Misc.intersect(
            forcedConfigs[key],
            fb.forcedConfig[key]
          );
        }
      }
    }
  }

  //check if the key is in forcedConfigs, if it is check the value, if its not, return true
  if (forcedConfigs[key] === undefined) return true;
  else return forcedConfigs[key].includes(<MonkeyTypes.ConfigValues>value);
}

// function: canSetConfigWithCurrentFunboxes
// checks using checkFunboxForcedConfigs. if it returns true, return true
// if it returns false, show a notification and return false
export function canSetConfigWithCurrentFunboxes(
  key: string,
  value: MonkeyTypes.ConfigValues,
  funbox: string,
  noNotification = false
): boolean {
  let errorCount = 0;
  if (key === "mode") {
    let fb: MonkeyTypes.FunboxObject[] = [];
    fb = fb.concat(
      FunboxList.get(funbox).filter(
        (f) =>
          f.forcedConfig?.["mode"] !== undefined &&
          !f.forcedConfig?.["mode"].includes(value)
      )
    );
    if (value === "zen") {
      fb = fb.concat(
        FunboxList.get(funbox).filter(
          (f) =>
            f.functions?.getWord ||
            f.functions?.pullSection ||
            f.functions?.alterText ||
            f.functions?.withWords ||
            f.properties?.includes("changesCapitalisation") ||
            f.properties?.includes("nospace") ||
            f.properties?.find((fp) => fp.startsWith("toPush:")) ||
            f.properties?.includes("changesWordsVisibility") ||
            f.properties?.includes("speaks") ||
            f.properties?.includes("changesLayout")
        )
      );
    }
    if (value === "quote" || value == "custom") {
      fb = fb.concat(
        FunboxList.get(funbox).filter(
          (f) =>
            f.functions?.getWord ||
            f.functions?.pullSection ||
            f.functions?.withWords
        )
      );
    }

    if (fb.length > 0) {
      errorCount += 1;
    }
  }
  if (!checkFunboxForcedConfigs(key, value, funbox)) {
    errorCount += 1;
  }

  if (errorCount > 0) {
    if (!noNotification) {
      Notifications.add(
        `You can't set ${Misc.camelCaseToWords(
          key
        )} to ${value} with currently active funboxes.`,
        0,
        5
      );
    }
    return false;
  } else {
    return true;
  }
}

export function canSetFunboxWithConfig(
  funbox: string,
  config: MonkeyTypes.Config
): boolean {
  let funboxToCheck = config.funbox;
  if (funboxToCheck === "none") {
    funboxToCheck = funbox;
  } else {
    funboxToCheck += "#" + funbox;
  }
  let errorCount = 0;
  for (const [configKey, configValue] of Object.entries(config)) {
    if (
      !canSetConfigWithCurrentFunboxes(
        configKey,
        configValue,
        funboxToCheck,
        true
      )
    ) {
      errorCount += 1;
    }
  }
  if (errorCount > 0) {
    Notifications.add(
      `You can't enable ${funbox.replace(
        /_/g,
        " "
      )} with currently active config.`,
      0,
      5
    );
    return false;
  } else {
    return true;
  }
}
