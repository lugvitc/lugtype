import { getCommandline } from "../utils/async-modules";
import * as CustomWordAmount from "../modals/custom-word-amount";
import * as DB from "../db";
import * as EditResultTagsModal from "../modals/edit-result-tags";
import * as MobileTestConfigModal from "../modals/mobile-test-config";
import * as CustomTestDurationModal from "../modals/custom-test-duration";
import * as TestWords from "../test/test-words";
import * as Notifications from "../elements/notifications";
import * as QuoteRateModal from "../modals/quote-rate";
import * as QuoteReportModal from "../modals/quote-report";
import * as QuoteSearchModal from "../modals/quote-search";

$(".pageTest").on("click", "#testModesNotice .textButton", async (event) => {
  const attr = $(event.currentTarget).attr("commands");
  if (attr === undefined) return;
  (await getCommandline()).show({ subgroupOverride: attr });
});

$(".pageTest").on("click", "#testConfig .wordCount .textButton", (e) => {
  const wrd = $(e.currentTarget).attr("wordCount");
  if (wrd === "custom") {
    CustomWordAmount.show();
  }
});

$(".pageTest").on("click", "#testConfig .time .textButton", (e) => {
  const time = $(e.currentTarget).attr("timeconfig");
  if (time === "custom") {
    CustomTestDurationModal.show();
  }
});

$(".pageTest").on("click", ".tags .editTagsButton", () => {
  if ((DB.getSnapshot()?.tags?.length ?? 0) > 0) {
    const resultid = $(".pageTest .tags .editTagsButton").attr(
      "data-result-id"
    ) as string;
    const activeTagIds = $(".pageTest .tags .editTagsButton").attr(
      "data-active-tag-ids"
    ) as string;
    const tags = activeTagIds === "" ? [] : activeTagIds.split(",");
    EditResultTagsModal.show(resultid, tags, "resultPage");
  }
});

$(".pageTest").on("click", "#mobileTestConfigButton", () => {
  MobileTestConfigModal.show();
});

$(".pageTest #rateQuoteButton").on("click", async () => {
  if (TestWords.randomQuote === null) {
    Notifications.add("Failed to show quote rating popup: no quote", -1);
    return;
  }
  QuoteRateModal.show(TestWords.randomQuote);
});

$(".pageTest #reportQuoteButton").on("click", async () => {
  if (TestWords.randomQuote === null) {
    Notifications.add("Failed to show quote report popup: no quote", -1);
    return;
  }
  void QuoteReportModal.show(TestWords.randomQuote?.id);
});

$(".pageTest").on("click", "#testConfig .quoteLength .textButton", (e) => {
  const len = parseInt($(e.currentTarget).attr("quoteLength") ?? "0");
  if (len === -2) {
    void QuoteSearchModal.show();
  }
});
