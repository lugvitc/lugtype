import { debounce } from "throttle-debounce";
import Ape from "../ape";
import Page from "./page";
import * as Notifications from "../elements/notifications";
import { InputIndicator } from "../elements/input-indicator";

let nameValid = false,
  emailValid = false,
  emailMatches = false,
  passwordValid = false,
  passwordMatches = false;

export function enableInputs(): void {
  $(".pageLogin .button").removeClass("disabled");
  $(".pageLogin input").prop("disabled", false);
}

export function disableInputs(): void {
  $(".pageLogin .button").addClass("disabled");
  $(".pageLogin input").prop("disabled", true);
}

export function showPreloader(): void {
  $(".pageLogin .preloader").removeClass("hidden");
}

export function hidePreloader(): void {
  $(".pageLogin .preloader").addClass("hidden");
}

const updateSignupButton = (): void => {
  const $button = $(".page.pageLogin .register.side .button");

  if (
    !nameValid ||
    !emailValid ||
    !emailMatches ||
    !passwordValid ||
    !passwordMatches
  ) {
    $button.addClass("disabled");
    return;
  }
  $button.removeClass("disabled");
};

const checkNameDebounced = debounce(1000, async () => {
  const val = $(
    ".page.pageLogin .register.side .usernameInput"
  ).val() as string;

  if (!val) {
    nameValid = false;
    updateSignupButton();
    return;
  }
  const response = await Ape.users.getNameAvailability(val);

  if (response.status === 200) {
    nameIndicator.show("available", response.message);
    nameValid = true;
  } else if (response.status === 422) {
    nameIndicator.show("unavailable", response.message);
    nameValid = false;
  } else if (response.status === 409) {
    nameIndicator.show("taken", response.message);
    nameValid = false;
  } else {
    nameIndicator.show("unavailable", response.message);
    nameValid = false;
    Notifications.add(
      "Failed to check name availability: " + response.message,
      -1
    );
  }

  updateSignupButton();
});

const checkEmail = (): void => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const email = $(".page.pageLogin .register.side .emailInput").val() as string;
  if (emailRegex.test(email)) {
    emailValid = true;
    emailIndicator.show("valid");
  } else {
    emailValid = false;
    emailIndicator.show("invalid");
  }

  updateSignupButton();
};

const checkEmailsMatch = (): void => {
  const email = $(".page.pageLogin .register.side .emailInput").val();
  const verifyEmail = $(
    ".page.pageLogin .register.side .verifyEmailInput"
  ).val();
  if (email === verifyEmail) {
    emailMatches = true;
    verifyEmailIndicator.show("match");
  } else {
    emailMatches = false;
    verifyEmailIndicator.show("mismatch");
  }

  updateSignupButton();
};

const checkPassword = (): void => {
  const password = $(
    ".page.pageLogin .register.side .passwordInput"
  ).val() as string;

  // Force user to use a capital letter, number, special character when setting up an account and changing password
  if (password.length < 8) {
    passwordValid = false;
    passwordIndicator.show("short", "Password must be at least 8 characters");
    return;
  } else {
    const hasCapital = password.match(/[A-Z]/);
    const hasNumber = password.match(/[\d]/);
    const hasSpecial = password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/);
    if (!hasCapital || !hasNumber || !hasSpecial) {
      passwordValid = false;
      passwordIndicator.show(
        "weak",
        "Password must contain at least one capital letter, number, and special character"
      );
    } else {
      passwordValid = true;
      passwordIndicator.show("good", "Password is good");
    }
  }
  updateSignupButton();
};

const checkPasswordsMatch = (): void => {
  const password = $(".page.pageLogin .register.side .passwordInput").val();
  const verifyPassword = $(
    ".page.pageLogin .register.side .verifyPasswordInput"
  ).val();
  if (password === verifyPassword) {
    passwordMatches = true;
    verifyPasswordIndicator.show("match");
  } else {
    passwordMatches = false;
    verifyPasswordIndicator.show("mismatch");
  }

  updateSignupButton();
};

const nameIndicator = new InputIndicator(
  $(".page.pageLogin .register.side .username.inputAndIndicator"),
  {
    available: {
      icon: "fa-check",
      level: 1,
    },
    unavailable: {
      icon: "fa-times",
      level: -1,
    },
    taken: {
      icon: "fa-times",
      level: -1,
    },
    checking: {
      icon: "fa-circle-notch",
      spinIcon: true,
      level: 0,
    },
  }
);

const emailIndicator = new InputIndicator(
  $(".page.pageLogin .register.side .email.inputAndIndicator"),
  {
    valid: {
      icon: "fa-check",
      level: 1,
    },
    invalid: {
      icon: "fa-times",
      level: -1,
    },
  }
);

const verifyEmailIndicator = new InputIndicator(
  $(".page.pageLogin .register.side .verifyEmail.inputAndIndicator"),
  {
    match: {
      icon: "fa-check",
      level: 1,
    },
    mismatch: {
      icon: "fa-times",
      level: -1,
    },
  }
);

const passwordIndicator = new InputIndicator(
  $(".page.pageLogin .register.side .password.inputAndIndicator"),
  {
    good: {
      icon: "fa-check",
      level: 1,
    },
    short: {
      icon: "fa-times",
      level: -1,
    },
    weak: {
      icon: "fa-times",
      level: -1,
    },
  }
);

const verifyPasswordIndicator = new InputIndicator(
  $(".page.pageLogin .register.side .verifyPassword.inputAndIndicator"),
  {
    match: {
      icon: "fa-check",
      level: 1,
    },
    mismatch: {
      icon: "fa-times",
      level: -1,
    },
  }
);

$(".page.pageLogin .register.side .usernameInput").on("input", () => {
  setTimeout(() => {
    const val = $(
      ".page.pageLogin .register.side .usernameInput"
    ).val() as string;
    if (val === "") {
      return nameIndicator.hide();
    } else {
      nameIndicator.show("checking");
      checkNameDebounced();
    }
  }, 1);
});

$(".page.pageLogin .register.side .emailInput").on("input", () => {
  if (
    !$(".page.pageLogin .register.side .emailInput").val() &&
    !$(".page.pageLogin .register.side .verifyEmailInput").val()
  ) {
    emailIndicator.hide();
    verifyEmailIndicator.hide();
    return;
  }
  checkEmail();
  checkEmailsMatch();
});

$(".page.pageLogin .register.side .verifyEmailInput").on("input", () => {
  if (
    !$(".page.pageLogin .register.side .emailInput").val() &&
    !$(".page.pageLogin .register.side .verifyEmailInput").val()
  ) {
    emailIndicator.hide();
    verifyEmailIndicator.hide();
    return;
  }
  checkEmailsMatch();
});

$(".page.pageLogin .register.side .passwordInput").on("input", () => {
  if (
    !$(".page.pageLogin .register.side .passwordInput").val() &&
    !$(".page.pageLogin .register.side .verifyPasswordInput").val()
  ) {
    passwordIndicator.hide();
    verifyPasswordIndicator.hide();
    return;
  }
  checkPassword();
  checkPasswordsMatch();
});

$(".page.pageLogin .register.side .verifyPasswordInput").on("input", () => {
  if (
    !$(".page.pageLogin .register.side .passwordInput").val() &&
    !$(".page.pageLogin .register.side .verifyPasswordInput").val()
  ) {
    passwordIndicator.hide();
    verifyPasswordIndicator.hide();
    return;
  }
  checkPassword();
  checkPasswordsMatch();
});

export const page = new Page(
  "login",
  $(".page.pageLogin"),
  "/login",
  () => {
    //
  },
  () => {
    //
  },
  () => {
    //
  },
  () => {
    //
  }
);
