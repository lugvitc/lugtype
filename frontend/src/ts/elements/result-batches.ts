import * as DB from "../db";
import * as ServerConfiguration from "../ape/server-configuration";

export function hide(): void {
  $(".pageAccount .resultBatches").addClass("hidden");
}

export function show(): void {
  $(".pageAccount .resultBatches").removeClass("hidden");
}

export function update(): void {
  const results = DB.getSnapshot()?.results;

  if (results === undefined) {
    console.error(
      "(Result batches) Results are missing but they should be available at the time of drawing the account page?"
    );
    hide();
    return;
  }

  const completedTests = DB.getSnapshot()?.typingStats?.completedTests ?? 0;
  const percentageDownloaded = Math.round(
    (results.length / completedTests) * 100
  );
  const limits = ServerConfiguration.get()?.results.limits ?? {
    regularUser: 0,
    premiumUser: 0,
  };
  const currentLimit = DB.getSnapshot()?.isPremium
    ? limits.premiumUser
    : limits.regularUser;
  const percentageLimit = Math.round((results?.length / currentLimit) * 100);

  const barsWrapper = $(".pageAccount .resultBatches .bars");

  const bars = {
    downloaded: {
      fill: barsWrapper.find(".downloaded .fill"),
      rightText: barsWrapper.find(".downloaded.rightText"),
    },
    limit: {
      fill: barsWrapper.find(".limit .fill"),
      rightText: barsWrapper.find(".limit.rightText"),
    },
  };

  bars.downloaded.fill.css("width", Math.min(percentageDownloaded, 100) + "%");
  bars.downloaded.rightText.text(
    `${results?.length} / ${completedTests} (${percentageDownloaded}%)`
  );

  bars.limit.fill.css("width", Math.min(percentageLimit, 100) + "%");
  bars.limit.rightText.text(
    `${results?.length} / ${currentLimit} (${percentageLimit}%)`
  );

  const text = $(".pageAccount .resultBatches > .text");
  text.text("");

  if (results.length >= completedTests) {
    disableButton();
    updateButtonText("all results loaded");
  }

  if (results.length >= currentLimit) {
    disableButton();
    updateButtonText("limit reached");

    if (DB.getSnapshot()?.isPremium === false) {
      text.html(
        `<br>Want to load up to ${limits?.premiumUser} results and gain access to more perks? Join Monkeytype Premium.<br>`
      );
    }
  }
}

export function disableButton(): void {
  $(".pageAccount .resultBatches button").prop("disabled", true);
}

export function enableButton(): void {
  $(".pageAccount .resultBatches button").prop("disabled", false);
}

export function updateButtonText(text: string): void {
  $(".pageAccount .resultBatches button").text(text);
}

export function showOrHideIfNeeded(): void {
  show();
}
