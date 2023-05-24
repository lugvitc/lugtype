import * as Misc from "../utils/misc";
import * as DB from "../db";
import Config from "../config";
import * as Notifications from "../elements/notifications";
import Ape from "../ape/index";
import * as Loader from "../elements/loader";
import { showNewResultFilterPresetPopup } from "../popups/new-result-filter-preset-popup";

export const defaultResultFilters: MonkeyTypes.ResultFilters = {
  _id: "default-result-filters-id",
  name: "default result filters",
  pb: {
    no: true,
    yes: true,
  },
  difficulty: {
    normal: true,
    expert: true,
    master: true,
  },
  mode: {
    words: true,
    time: true,
    quote: true,
    zen: true,
    custom: true,
  },
  words: {
    "10": true,
    "25": true,
    "50": true,
    "100": true,
    custom: true,
  },
  time: {
    "15": true,
    "30": true,
    "60": true,
    "120": true,
    custom: true,
  },
  quoteLength: {
    short: true,
    medium: true,
    long: true,
    thicc: true,
  },
  punctuation: {
    on: true,
    off: true,
  },
  numbers: {
    on: true,
    off: true,
  },
  date: {
    last_day: false,
    last_week: false,
    last_month: false,
    last_3months: false,
    all: true,
  },
  tags: {
    none: true,
  },
  language: {},
  funbox: {
    none: true,
  },
};

// current activated filter
export let filters = defaultResultFilters;

function save(): void {
  window.localStorage.setItem("resultFilters", JSON.stringify(filters));
}

export async function load(): Promise<void> {
  try {
    const newResultFilters = window.localStorage.getItem("resultFilters");

    if (!newResultFilters) {
      filters = defaultResultFilters;
    } else {
      const newFiltersObject = JSON.parse(newResultFilters);

      let reset = false;
      for (const key of Object.keys(defaultResultFilters)) {
        if (reset === true) break;
        if (newFiltersObject[key] === undefined) {
          reset = true;
          break;
        }

        if (
          typeof defaultResultFilters[
            key as keyof typeof defaultResultFilters
          ] === "object"
        ) {
          for (const subKey of Object.keys(
            defaultResultFilters[key as keyof typeof defaultResultFilters]
          )) {
            if (newFiltersObject[key][subKey] === undefined) {
              reset = true;
              break;
            }
          }
        }
      }

      if (reset) {
        filters = defaultResultFilters;
      } else {
        filters = newFiltersObject;
      }
    }

    const newTags: {
      [tag: string]: boolean;
    } = { none: false };

    Object.keys(defaultResultFilters.tags).forEach((tag) => {
      if (filters.tags[tag] !== undefined) {
        newTags[tag] = filters.tags[tag];
      } else {
        newTags[tag] = true;
      }
    });

    filters.tags = newTags;
    // await updateFilterPresets();
    save();
  } catch {
    console.log("error in loading result filters");
    filters = defaultResultFilters;
    save();
  }
}

export async function updateFilterPresets(): Promise<void> {
  const parent = document.querySelector(".pageAccount .presetFilterButtons");
  const buttons = document.querySelector(
    ".pageAccount .presetFilterButtons .filterBtns"
  );

  if (!parent || !buttons) return;

  buttons.innerHTML = "";

  const filterPresets =
    DB.getSnapshot()?.filterPresets.map((filter) => {
      filter.name = filter.name.replace(/_/g, " ");
      return filter;
    }) ?? [];

  if (filterPresets.length > 0) {
    let html = "";

    for (const filter of filterPresets) {
      html += `<div class="filterPresets">
      <div class="select-filter-preset button" data-id="${filter._id}">${filter.name} </div>
      <div class="button delete-filter-preset" data-id="${filter._id}">
        <i class="fas fa-fw fa-trash"></i>
      </div>
    </div>`;
    }

    buttons.innerHTML = html;
    parent.classList.remove("hidden");
  } else {
    parent.classList.add("hidden");
  }
}

// sets the current filter to be a user custom filter
export async function setFilterPreset(id: string): Promise<void> {
  const filter = DB.getSnapshot()?.filterPresets.find(
    (filter) => filter._id === id
  );
  if (filter) {
    // deep copy filter
    filters = verifyResultFiltersStructure(filter);

    save();
    updateActive();
  }

  // make all filter preset butons inactive
  $(
    `.pageAccount .group.presetFilterButtons .filterBtns .filterPresets .select-filter-preset`
  ).removeClass("active");

  // make current filter presest button active
  $(
    `.pageAccount .group.presetFilterButtons .filterBtns .filterPresets .select-filter-preset[data-id=${id}]`
  ).addClass("active");
}

function deepCopyFilter(
  filter: MonkeyTypes.ResultFilters
): MonkeyTypes.ResultFilters {
  return JSON.parse(JSON.stringify(filter));
}

function addFilterPresetToSnapshot(filter: MonkeyTypes.ResultFilters): void {
  const snapshot = DB.getSnapshot();
  if (!snapshot) return;
  DB.setSnapshot({
    ...snapshot,
    filterPresets: [...snapshot.filterPresets, deepCopyFilter(filter)],
  });
}

// callback function called by popup once user inputs name
async function createFilterPresetCallback(name: string): Promise<void> {
  name = name.replace(/ /g, "_");
  Loader.show();
  const result = await Ape.users.addResultFilterPreset({ ...filters, name });
  Loader.hide();
  if (result.status === 200) {
    addFilterPresetToSnapshot({ ...filters, name, _id: result.data });
    updateFilterPresets();
    Notifications.add("Filter preset created", 1);
  } else {
    Notifications.add("Error creating filter preset: " + result.message, -1);
    console.log("error creating filter preset: " + result.message);
  }
}

// shows popup for user to select name
export async function startCreateFilterPreset(): Promise<void> {
  showNewResultFilterPresetPopup(async (name: string) =>
    createFilterPresetCallback(name)
  );
}

function removeFilterPresetFromSnapshot(id: string): void {
  const snapshot = DB.getSnapshot();
  if (!snapshot) return;
  const filterPresets = [...snapshot.filterPresets];
  const toDeleteIx = filterPresets.findIndex((filter) => filter._id === id);

  if (toDeleteIx > -1) {
    filterPresets.splice(toDeleteIx, 1);
  }
  DB.setSnapshot({ ...snapshot, filterPresets });
}

// deletes the currently selected filter preset
export async function deleteFilterPreset(id: string): Promise<void> {
  Loader.show();
  const result = await Ape.users.removeResultFilterPreset(id);
  Loader.hide();
  if (result.status === 200) {
    removeFilterPresetFromSnapshot(id);
    updateFilterPresets();
    reset();
    Notifications.add("Filter preset deleted", 1);
  } else {
    Notifications.add("Error deleting filter preset: " + result.message, -1);
    console.log("error deleting filter preset", result.message);
  }
}

function deSelectFilterPreset(): void {
  // make all filter preset buttons inactive
  $(
    ".pageAccount .group.presetFilterButtons .filterBtns .filterPresets .select-filter-preset"
  ).removeClass("active");
}

export function getFilters(): MonkeyTypes.ResultFilters {
  return filters;
}

export function getGroup<G extends MonkeyTypes.Group>(
  group: G
): MonkeyTypes.ResultFilters[G] {
  return filters[group];
}

// export function setFilter(group, filter, value) {
//   filters[group][filter] = value;
// }

export function getFilter<G extends MonkeyTypes.Group>(
  group: G,
  filter: MonkeyTypes.Filter<G>
): MonkeyTypes.ResultFilters[G][MonkeyTypes.Filter<G>] {
  return filters[group][filter];
}

// export function toggleFilter(group, filter) {
//   filters[group][filter] = !filters[group][filter];
// }

export function loadTags(tags: MonkeyTypes.Tag[]): void {
  tags.forEach((tag) => {
    defaultResultFilters.tags[tag._id] = true;
  });
}

export function reset(): void {
  filters = defaultResultFilters;
  save();
}

type AboveChartDisplay = Partial<
  Record<MonkeyTypes.Group, { all: boolean; array?: string[] }>
>;

export function updateActive(): void {
  const aboveChartDisplay: AboveChartDisplay = {};
  (Object.keys(getFilters()) as MonkeyTypes.Group[]).forEach((group) => {
    // id and name field do not correspond to any ui elements, no need to update
    if (group === "_id" || group === "name") {
      return;
    }

    aboveChartDisplay[group] = {
      all: true,
      array: [],
    };
    (
      Object.keys(getGroup(group)) as MonkeyTypes.Filter<typeof group>[]
    ).forEach((filter) => {
      const groupAboveChartDisplay = aboveChartDisplay[group];

      if (groupAboveChartDisplay === undefined) return;

      if (getFilter(group, filter)) {
        groupAboveChartDisplay["array"]?.push(filter);
      } else {
        if (groupAboveChartDisplay["all"] !== undefined) {
          groupAboveChartDisplay["all"] = false;
        }
      }
      let buttonEl;
      if (group === "date") {
        buttonEl = $(
          `.pageAccount .group.topFilters .filterGroup[group="${group}"] .button[filter="${filter}"]`
        );
      } else {
        buttonEl = $(
          `.pageAccount .group.filterButtons .filterGroup[group="${group}"] .button[filter="${filter}"]`
        );
      }
      if (getFilter(group, filter)) {
        buttonEl.addClass("active");
      } else {
        buttonEl.removeClass("active");
      }
    });
  });

  function addText(group: MonkeyTypes.Group): string {
    let ret = "";
    ret += "<div class='group'>";
    if (group == "difficulty") {
      ret += `<span aria-label="Difficulty" data-balloon-pos="up"><i class="fas fa-fw fa-star"></i>`;
    } else if (group == "mode") {
      ret += `<span aria-label="Mode" data-balloon-pos="up"><i class="fas fa-fw fa-bars"></i>`;
    } else if (group == "punctuation") {
      ret += `<span aria-label="Punctuation" data-balloon-pos="up"><i class="fas fa-fw fa-at"></i>`;
    } else if (group == "numbers") {
      ret += `<span aria-label="Numbers" data-balloon-pos="up"><i class="fas fa-fw fa-hashtag"></i>`;
    } else if (group == "words") {
      ret += `<span aria-label="Words" data-balloon-pos="up"><i class="fas fa-fw fa-font"></i>`;
    } else if (group == "time") {
      ret += `<span aria-label="Time" data-balloon-pos="up"><i class="fas fa-fw fa-clock"></i>`;
    } else if (group == "date") {
      ret += `<span aria-label="Date" data-balloon-pos="up"><i class="fas fa-fw fa-calendar"></i>`;
    } else if (group == "tags") {
      ret += `<span aria-label="Tags" data-balloon-pos="up"><i class="fas fa-fw fa-tags"></i>`;
    } else if (group == "language") {
      ret += `<span aria-label="Language" data-balloon-pos="up"><i class="fas fa-fw fa-globe-americas"></i>`;
    } else if (group == "funbox") {
      ret += `<span aria-label="Funbox" data-balloon-pos="up"><i class="fas fa-fw fa-gamepad"></i>`;
    }
    if (aboveChartDisplay[group]?.all) {
      ret += "all";
    } else {
      if (group === "tags") {
        ret += aboveChartDisplay.tags?.array
          ?.map((id) => {
            if (id == "none") return id;
            const snapshot = DB.getSnapshot();
            if (snapshot === undefined) return id;
            const name = snapshot.tags?.filter((t) => t._id == id)[0];
            if (name !== undefined) {
              return snapshot.tags?.filter((t) => t._id == id)[0].display;
            }
            return name;
          })
          .join(", ");
      } else {
        ret += aboveChartDisplay[group]?.array?.join(", ").replace(/_/g, " ");
      }
    }
    ret += "</span></div>";
    return ret;
  }

  let chartString = "";

  //date
  chartString += addText("date");
  chartString += `<div class="spacer"></div>`;

  //mode
  chartString += addText("mode");
  chartString += `<div class="spacer"></div>`;

  //time
  if (aboveChartDisplay.mode?.array?.includes("time")) {
    chartString += addText("time");
    chartString += `<div class="spacer"></div>`;
  }

  //words
  if (aboveChartDisplay.mode?.array?.includes("words")) {
    chartString += addText("words");
    chartString += `<div class="spacer"></div>`;
  }

  //diff
  chartString += addText("difficulty");
  chartString += `<div class="spacer"></div>`;

  //punc
  chartString += addText("punctuation");
  chartString += `<div class="spacer"></div>`;

  //numbers
  chartString += addText("numbers");
  chartString += `<div class="spacer"></div>`;

  //language
  chartString += addText("language");
  chartString += `<div class="spacer"></div>`;

  //funbox
  chartString += addText("funbox");
  chartString += `<div class="spacer"></div>`;

  //tags
  chartString += addText("tags");

  setTimeout(() => {
    $(".pageAccount .group.chart .above").html(chartString);
  }, 0);
}

export function toggle<G extends MonkeyTypes.Group>(
  group: G,
  filter: MonkeyTypes.Filter<G>
): void {
  // user is changing the filters -> current filter is no longer a filter preset
  deSelectFilterPreset();

  try {
    if (group === "date") {
      (Object.keys(getGroup("date")) as MonkeyTypes.Filter<"date">[]).forEach(
        (date) => {
          filters["date"][date] = false;
        }
      );
    }
    filters[group][filter] = !filters[group][
      filter
    ] as unknown as MonkeyTypes.ResultFilters[G][keyof MonkeyTypes.ResultFilters[G]];
    save();
  } catch (e) {
    Notifications.add(
      "Something went wrong toggling filter. Reverting to defaults.",
      0
    );
    console.log("toggling filter error");
    console.error(e);
    reset();
    updateActive();
  }
}

$(
  ".pageAccount .filterButtons .buttonsAndTitle .buttons, .pageAccount .group.topFilters .buttonsAndTitle.testDate .buttons"
).on("click", ".button", (e) => {
  const group = $(e.target)
    .parents(".buttons")
    .attr("group") as MonkeyTypes.Group;
  const filter = $(e.target).attr("filter") as MonkeyTypes.Filter<typeof group>;
  if ($(e.target).hasClass("allFilters")) {
    (Object.keys(getFilters()) as MonkeyTypes.Group[]).forEach((group) => {
      // id and name field do not correspond to any ui elements, no need to update
      if (group === "_id" || group === "name") {
        return;
      }

      (
        Object.keys(getGroup(group)) as MonkeyTypes.Filter<typeof group>[]
      ).forEach((filter) => {
        if (group === "date") {
          // TODO figure out why "filter" is never
          // @ts-ignore
          filters[group][filter] = false;
        } else if (filters[group] !== undefined) {
          // @ts-ignore
          filters[group][filter] = true;
        }
      });
    });
    filters["date"]["all"] = true;
  } else if ($(e.target).hasClass("noFilters")) {
    (Object.keys(getFilters()) as MonkeyTypes.Group[]).forEach((group) => {
      // id and name field do not correspond to any ui elements, no need to update
      if (group === "_id" || group === "name") {
        return;
      }

      if (group !== "date") {
        (
          Object.keys(getGroup(group)) as MonkeyTypes.Filter<typeof group>[]
        ).forEach((filter) => {
          // TODO figure out why "filter" is never
          // @ts-ignore
          filters[group][filter] = false;
        });
      }
    });
  } else if ($(e.target).hasClass("button")) {
    if (e.shiftKey) {
      (
        Object.keys(getGroup(group)) as MonkeyTypes.Filter<typeof group>[]
      ).forEach((filter) => {
        // TODO figure out why "filter" is never
        // @ts-ignore
        filters[group][filter] = false;
      });
      // TODO figure out why "filter" is never
      // @ts-ignore
      filters[group][filter] = true;
    } else {
      toggle(group, filter);
      // filters[group][filter] = !filters[group][filter];
    }
  }
  updateActive();
  save();
});

$(".pageAccount .topFilters .button.allFilters").on("click", () => {
  // user is changing the filters -> current filter is no longer a filter preset
  deSelectFilterPreset();

  console.log(getFilters());

  (Object.keys(getFilters()) as MonkeyTypes.Group[]).forEach((group) => {
    // id and name field do not correspond to any ui elements, no need to update
    if (group === "_id" || group === "name") {
      return;
    }

    (
      Object.keys(getGroup(group)) as MonkeyTypes.Filter<typeof group>[]
    ).forEach((filter) => {
      if (group === "date") {
        // TODO figure out why "filter" is never
        // @ts-ignore
        filters[group][filter] = false;
      } else {
        // TODO figure out why "filter" is never
        // @ts-ignore
        filters[group][filter] = true;
      }
    });
  });
  filters["date"]["all"] = true;
  updateActive();
  save();
});

$(".pageAccount .topFilters .button.currentConfigFilter").on("click", () => {
  // user is changing the filters -> current filter is no longer a filter preset
  deSelectFilterPreset();

  (Object.keys(getFilters()) as MonkeyTypes.Group[]).forEach((group) => {
    // id and name field do not correspond to any ui elements, no need to update
    if (group === "_id" || group === "name") {
      return;
    }

    (
      Object.keys(getGroup(group)) as MonkeyTypes.Filter<typeof group>[]
    ).forEach((filter) => {
      // TODO figure out why "filter" is never
      // @ts-ignore
      filters[group][filter] = false;
    });
  });

  filters["pb"]["no"] = true;
  filters["pb"]["yes"] = true;

  filters["difficulty"][Config.difficulty] = true;
  filters["mode"][Config.mode] = true;
  if (Config.mode === "time") {
    if ([15, 30, 60, 120].includes(Config.time)) {
      const configTime = Config.time as MonkeyTypes.DefaultTimeModes;
      filters["time"][configTime] = true;
    } else {
      filters["time"]["custom"] = true;
    }
  } else if (Config.mode === "words") {
    if ([10, 25, 50, 100, 200].includes(Config.words)) {
      const configWords = Config.words as MonkeyTypes.DefaultWordsModes;
      filters["words"][configWords] = true;
    } else {
      filters["words"]["custom"] = true;
    }
  } else if (Config.mode === "quote") {
    const filterName: MonkeyTypes.Filter<"quoteLength">[] = [
      "short",
      "medium",
      "long",
      "thicc",
    ];
    filterName.forEach((ql, index) => {
      if (Config.quoteLength.includes(index as MonkeyTypes.QuoteLength)) {
        filters["quoteLength"][ql] = true;
      } else {
        filters["quoteLength"][ql] = false;
      }
    });
  }
  if (Config.punctuation) {
    filters["punctuation"]["on"] = true;
  } else {
    filters["punctuation"]["off"] = true;
  }
  if (Config.numbers) {
    filters["numbers"]["on"] = true;
  } else {
    filters["numbers"]["off"] = true;
  }
  if (Config.mode === "quote" && /english.*/.test(Config.language)) {
    filters["language"]["english"] = true;
  } else {
    filters["language"][Config.language] = true;
  }

  if (Config.funbox === "none") {
    filters.funbox.none = true;
  } else {
    for (const f of Config.funbox.split("#")) {
      filters.funbox[f] = true;
    }
  }

  filters["tags"]["none"] = true;

  DB.getSnapshot()?.tags?.forEach((tag) => {
    if (tag.active === true) {
      filters["tags"]["none"] = false;
      filters["tags"][tag._id] = true;
    }
  });

  filters["date"]["all"] = true;
  updateActive();
  save();
});

$(".pageAccount .topFilters .button.toggleAdvancedFilters").on("click", () => {
  $(".pageAccount .filterButtons").slideToggle(250);
  $(".pageAccount .topFilters .button.toggleAdvancedFilters").toggleClass(
    "active"
  );
});

export async function appendButtons(): Promise<void> {
  let languageList;
  try {
    languageList = await Misc.getLanguageList();
  } catch (e) {
    console.error(
      Misc.createErrorMessage(e, "Failed to append language buttons")
    );
  }
  if (languageList) {
    let html = "";
    for (const language of languageList) {
      html += `<div class="button" filter="${language}">${language.replace(
        "_",
        " "
      )}</div>`;
    }
    const el = document.querySelector(
      ".pageAccount .content .filterButtons .buttonsAndTitle.languages .buttons"
    );
    if (el) el.innerHTML = html;
  }

  let funboxList;
  try {
    funboxList = await Misc.getFunboxList();
  } catch (e) {
    console.error(
      Misc.createErrorMessage(e, "Failed to append funbox buttons")
    );
  }
  if (funboxList) {
    let html = "";
    for (const funbox of funboxList) {
      html += `<div class="button" filter="${
        funbox.name
      }">${funbox.name.replace(/_/g, " ")}</div>`;
    }
    const el = document.querySelector(
      ".pageAccount .content .filterButtons .buttonsAndTitle.funbox .buttons"
    );
    if (el) {
      el.innerHTML = `<div class="button" filter="none">none</div>` + html;
    }
  }

  const snapshot = DB.getSnapshot();

  if ((snapshot?.tags?.length ?? 0) > 0) {
    $(".pageAccount .content .filterButtons .buttonsAndTitle.tags").removeClass(
      "hidden"
    );
    let html = `<div class="button" filter="none">no tag</div>`;
    for (const tag of snapshot?.tags ?? []) {
      html += `<div class="button" filter="${tag._id}">${tag.display}</div>`;
    }
    const el = document.querySelector(
      ".pageAccount .content .filterButtons .buttonsAndTitle.tags .buttons"
    );
    if (el) {
      el.innerHTML = html;
    }
  } else {
    $(".pageAccount .content .filterButtons .buttonsAndTitle.tags").addClass(
      "hidden"
    );
  }

  updateFilterPresets();
}

export function removeButtons(): void {
  $(
    ".pageAccount .content .filterButtons .buttonsAndTitle.languages .buttons"
  ).empty();
  $(
    ".pageAccount .content .filterButtons .buttonsAndTitle.funbox .buttons"
  ).empty();
  $(
    ".pageAccount .content .filterButtons .buttonsAndTitle.tags .buttons"
  ).empty();
}

$(".pageAccount .topFilters .button.createFilterPresetBtn").on("click", () => {
  startCreateFilterPreset();
});

$(".group.presetFilterButtons .filterBtns").on(
  "click",
  ".filterPresets .delete-filter-preset",
  (e) => {
    deleteFilterPreset($(e.currentTarget).data("id"));
  }
);

function verifyResultFiltersStructure(
  filterIn: MonkeyTypes.ResultFilters
): MonkeyTypes.ResultFilters {
  const filter = deepCopyFilter(filterIn);
  Object.entries(defaultResultFilters).forEach((entry) => {
    const key = entry[0] as keyof MonkeyTypes.ResultFilters;
    const value = entry[1];
    if (filter[key] === undefined) {
      filter[key] = value;
    }
  });
  return filter;
}
