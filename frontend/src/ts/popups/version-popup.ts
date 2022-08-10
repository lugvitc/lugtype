export function show(): void {
  $("#versionHistoryWrapper")
    .css("opacity", 0)
    .removeClass("hidden")
    .animate({ opacity: 1 }, 125);
  $("#newVersionIndicator").addClass("hidden");
}

function hide(): void {
  $("#versionHistoryWrapper")
    .css("opacity", 1)
    .animate({ opacity: 0 }, 125, () => {
      $("#versionHistoryWrapper").addClass("hidden");
    });
}

$(document.body).on("click", "#newVersionIndicator", () => {
  $("#newVersionIndicator").addClass("hidden");
});

$(document.body).on("click", ".version", (e) => {
  if (e.shiftKey) return;
  show();
});

$(document.body).on("click", "#versionHistoryWrapper", (e) => {
  if ($(e.target).attr("id") === "versionHistoryWrapper") {
    hide();
  }
});

$(document).on("keydown", (event) => {
  if (
    event.key === "Escape" &&
    !$("#versionHistoryWrapper").hasClass("hidden")
  ) {
    hide();
    event.preventDefault();
  }
});
