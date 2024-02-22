import Ape from "../ape";
import Config from "../config";
import * as TestWords from "../test/test-words";
import * as Loader from "../elements/loader";
import * as Notifications from "../elements/notifications";
import QuotesController from "../controllers/quotes-controller";
import * as CaptchaController from "../controllers/captcha-controller";
import * as Skeleton from "./skeleton";
import { isPopupVisible, removeLanguageSize } from "../utils/misc";
import SlimSelect from "slim-select";

const wrapperId = "quoteReportPopupWrapper";

type State = {
  previousPopupShowCallback?: () => void;
  quoteToReport?: MonkeyTypes.Quote;
};

type Options = {
  quoteId: number;
  previousPopupShowCallback?: () => void;
  noAnim: boolean;
};

const state: State = {
  previousPopupShowCallback: undefined,
  quoteToReport: undefined,
};

const defaultOptions: Options = {
  quoteId: -1,
  previousPopupShowCallback: (): void => {
    //
  },
  noAnim: false,
};

let reasonSelect: SlimSelect | undefined = undefined;

export async function show(options = defaultOptions): Promise<void> {
  Skeleton.append(wrapperId);

  if (!isPopupVisible(wrapperId)) {
    CaptchaController.render(
      document.querySelector("#quoteReportPopup .g-recaptcha") as HTMLElement,
      "quoteReportPopup"
    );

    const { quoteId, previousPopupShowCallback, noAnim } = options;

    state.previousPopupShowCallback = previousPopupShowCallback;

    const language =
      Config.language === "swiss_german" ? "german" : Config.language;

    const { quotes } = await QuotesController.getQuotes(language);
    state.quoteToReport = quotes.find((quote) => {
      return quote.id === quoteId;
    });

    $("#quoteReportPopup .quote").text(state.quoteToReport?.text as string);
    $("#quoteReportPopup .reason").val("Grammatical error");
    $("#quoteReportPopup .comment").val("");
    $("#quoteReportPopup .characterCount").text("-");

    reasonSelect = new SlimSelect({
      select: "#quoteReportPopup .reason",
      settings: {
        showSearch: false,
      },
    });

    $("#quoteReportPopupWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, noAnim ? 0 : 125, () => {
        $("#quoteReportPopup textarea").trigger("focus").trigger("select");
      });
  }
}

async function hide(): Promise<void> {
  if (isPopupVisible(wrapperId)) {
    const noAnim = state.previousPopupShowCallback ? true : false;

    $("#quoteReportPopupWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        noAnim ? 0 : 125,
        () => {
          CaptchaController.reset("quoteReportPopup");
          $("#quoteReportPopupWrapper").addClass("hidden");
          if (state.previousPopupShowCallback) {
            state.previousPopupShowCallback();
          }
          reasonSelect?.destroy();
          reasonSelect = undefined;
          Skeleton.remove(wrapperId);
        }
      );
  }
}

async function submitReport(): Promise<void> {
  const captchaResponse = CaptchaController.getResponse("quoteReportPopup");
  if (!captchaResponse) {
    return Notifications.add("Please complete the captcha");
  }

  const quoteId = state.quoteToReport?.id.toString();
  const quoteLanguage = removeLanguageSize(Config.language);
  const reason = $("#quoteReportPopup .reason").val() as string;
  const comment = $("#quoteReportPopup .comment").val() as string;
  const captcha = captchaResponse as string;

  if (quoteId === undefined || quoteId === "") {
    return Notifications.add("Please select a quote");
  }

  if (!reason) {
    return Notifications.add("Please select a valid report reason");
  }

  if (!comment) {
    return Notifications.add("Please provide a comment");
  }

  const characterDifference = comment.length - 250;
  if (characterDifference > 0) {
    return Notifications.add(
      `Report comment is ${characterDifference} character(s) too long`
    );
  }

  Loader.show();
  const response = await Ape.quotes.report(
    quoteId,
    quoteLanguage,
    reason,
    comment,
    captcha
  );
  Loader.hide();

  if (response.status !== 200) {
    return Notifications.add("Failed to report quote: " + response.message, -1);
  }

  Notifications.add("Report submitted. Thank you!", 1);
  void hide();
}

$("#quoteReportPopupWrapper").on("mousedown", (e) => {
  if ($(e.target).attr("id") === "quoteReportPopupWrapper") {
    void hide();
  }
});

$("#quoteReportPopupWrapper .comment").on("input", () => {
  setTimeout(() => {
    const len = ($("#quoteReportPopup .comment").val() as string).length;
    $("#quoteReportPopup .characterCount").text(len);
    if (len > 250) {
      $("#quoteReportPopup .characterCount").addClass("red");
    } else {
      $("#quoteReportPopup .characterCount").removeClass("red");
    }
  }, 1);
});

$("#quoteReportPopupWrapper .submit").on("click", async () => {
  await submitReport();
});

$(".pageTest #reportQuoteButton").on("click", async () => {
  if (TestWords.randomQuote === null) {
    Notifications.add("Failed to show quote report popup: no quote", -1);
    return;
  }
  void show({
    quoteId: TestWords.randomQuote?.id,
    noAnim: false,
  });
});

Skeleton.save(wrapperId);
