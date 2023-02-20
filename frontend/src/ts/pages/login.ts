import { debounce } from "throttle-debounce";
import Ape from "../ape";
import Page from "./page";
import * as Notifications from "../elements/notifications";
import { InputIndicator } from "../elements/input-indicator";
import * as Skeleton from "../popups/skeleton";
import * as Misc from "../utils/misc";

export function enableSignUpButton(): void {
  $(".page.pageLogin .register.side .button").removeClass("disabled");
}

export function disableSignUpButton(): void {
  $(".page.pageLogin .register.side .button").addClass("disabled");
}

export function enableSignInButton(): void {
  $(".page.pageLogin .login.side .button").removeClass("disabled");
}

export function disableSignInButton(): void {
  $(".page.pageLogin .login.side .button").addClass("disabled");
}

export function enableInputs(): void {
  $(".pageLogin input").prop("disabled", false);
}

export function disableInputs(): void {
  $(".pageLogin input").prop("disabled", true);
}

export function showPreloader(): void {
  $(".pageLogin .preloader").removeClass("hidden");
}

export function hidePreloader(): void {
  $(".pageLogin .preloader").addClass("hidden");
}

export const updateSignupButton = (): void => {
  if (
    nameIndicator.get() !== "available" ||
    emailIndicator.get() !== "valid" ||
    verifyEmailIndicator.get() !== "match" ||
    passwordIndicator.get() !== "good" ||
    verifyPasswordIndicator.get() !== "match"
  ) {
    disableSignUpButton();
  } else {
    enableSignUpButton();
  }
};

const checkNameDebounced = debounce(1000, async () => {
  const val = $(
    ".page.pageLogin .register.side .usernameInput"
  ).val() as string;

  if (!val) {
    updateSignupButton();
    return;
  }
  const response = await Ape.users.getNameAvailability(val);

  if (response.status === 200) {
    nameIndicator.show("available", response.message);
  } else if (response.status === 422) {
    nameIndicator.show("unavailable", response.message);
  } else if (response.status === 409) {
    nameIndicator.show("taken", response.message);
  } else {
    nameIndicator.show("unavailable", response.message);
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
    emailIndicator.show("valid");
  } else {
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
    verifyEmailIndicator.show("match");
  } else {
    verifyEmailIndicator.show("mismatch");
  }

  updateSignupButton();
};

const checkPassword = (): void => {
  const password = $(
    ".page.pageLogin .register.side .passwordInput"
  ).val() as string;

  // Force user to use a capital letter, number, special character and reasonable length when setting up an account and changing password
  if (!Misc.isLocalhost() && !Misc.isPasswordStrong(password)) {
    if (password.length < 8) {
      passwordIndicator.show("short", "Password must be at least 8 characters");
    } else if (password.length > 64) {
      passwordIndicator.show("long", "Password must be at most 64 characters");
    } else {
      passwordIndicator.show(
        "weak",
        "Password must contain at least one capital letter, number, and special character"
      );
    }
  } else {
    passwordIndicator.show("good", "Password is good");
  }
  updateSignupButton();
};

const checkPasswordsMatch = (): void => {
  const password = $(".page.pageLogin .register.side .passwordInput").val();
  const verifyPassword = $(
    ".page.pageLogin .register.side .verifyPasswordInput"
  ).val();
  if (password === verifyPassword) {
    verifyPasswordIndicator.show("match");
  } else {
    verifyPasswordIndicator.show("mismatch");
  }

  updateSignupButton();
};

const nameIndicator = new InputIndicator(
  $(".page.pageLogin .register.side input.usernameInput"),
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
  $(".page.pageLogin .register.side input.emailInput"),
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
  $(".page.pageLogin .register.side input.verifyEmailInput"),
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
  $(".page.pageLogin .register.side input.passwordInput"),
  {
    good: {
      icon: "fa-check",
      level: 1,
    },
    short: {
      icon: "fa-times",
      level: -1,
    },
    long: {
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
  $(".page.pageLogin .register.side input.verifyPasswordInput"),
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
  async () => {
    //
  },
  async () => {
    Skeleton.remove("pageLogin");
  },
  async () => {
    Skeleton.append("pageLogin", "middle");
    $(".pageLogin .button").removeClass("disabled");
    $(".pageLogin input").prop("disabled", false);
  },
  async () => {
    //
  }
);

$(() => {
  Skeleton.save("pageLogin");
});
