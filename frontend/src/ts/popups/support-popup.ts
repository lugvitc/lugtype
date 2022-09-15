$(document.body).on("click", "#supportMeButton, #supportMeAboutButton", () => {
  $("#supportMeWrapper")
    .css("opacity", 0)
    .removeClass("hidden")
    .animate({ opacity: 1 }, 125);
});

$(document.body).on("click", "#supportMeWrapper", () => {
  $("#supportMeWrapper")
    .css("opacity", 1)
    .animate({ opacity: 0 }, 125, () => {
      $("#supportMeWrapper").addClass("hidden");
    });
});

$(document.body).on("click", "#supportMeWrapper .button.ads", () => {
  $("#supportMeWrapper")
    .css("opacity", 1)
    .animate({ opacity: 0 }, 125, () => {
      $("#supportMeWrapper").addClass("hidden");
    });
});

$(document.body).on("click", "#supportMeWrapper a.button", () => {
  $("#supportMeWrapper")
    .css("opacity", 1)
    .animate({ opacity: 0 }, 125, () => {
      $("#supportMeWrapper").addClass("hidden");
    });
});

$(document.body).on(
  "keypress",
  "#supportMeButton, #supportMeAboutButton",
  (e) => {
    if (e.key === "Enter") {
      $(e.currentTarget).trigger("click");
    }
  }
);

$(document).on("keydown", (e) => {
  if (e.key === "Escape" && !$("#supportMeWrapper").hasClass("hidden")) {
    $("#supportMeWrapper")
      .css("opacity", 1)
      .animate({ opacity: 0 }, 125, () => {
        $("#supportMeWrapper").addClass("hidden");
      });
  }
});
