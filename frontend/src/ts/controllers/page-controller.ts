import * as Misc from "../utils/misc";
import * as Strings from "../utils/strings";
import * as ActivePage from "../states/active-page";
import * as Settings from "../pages/settings";
import * as Account from "../pages/account";
import * as PageTest from "../pages/test";
import * as PageAbout from "../pages/about";
import * as PageLogin from "../pages/login";
import * as PageLoading from "../pages/loading";
import * as PageProfile from "../pages/profile";
import * as PageProfileSearch from "../pages/profile-search";
import * as Page404 from "../pages/404";
import * as PageTransition from "../states/page-transition";
import * as AdController from "../controllers/ad-controller";
import * as Focus from "../test/focus";

type ChangeOptions = {
  force?: boolean;
  params?: Record<string, string>;
  data?: unknown;
};

export async function change(
  pageName: MonkeyTypes.PageName,
  options = {} as ChangeOptions
): Promise<boolean> {
  const defaultOptions = {
    force: false,
  };

  options = { ...defaultOptions, ...options };

  return new Promise((resolve) => {
    if (PageTransition.get()) {
      console.debug(
        `change page to ${pageName} stopped, page transition is true`
      );
      return resolve(false);
    }

    if (!options.force && ActivePage.get() === pageName) {
      console.debug(`change page ${pageName} stoped, page already active`);
      return resolve(false);
    } else {
      console.log(`changing page ${pageName}`);
    }

    const pages = {
      loading: PageLoading.page,
      test: PageTest.page,
      settings: Settings.page,
      about: PageAbout.page,
      account: Account.page,
      login: PageLogin.page,
      profile: PageProfile.page,
      profileSearch: PageProfileSearch.page,
      404: Page404.page,
    };

    const previousPage = pages[ActivePage.get()];
    const nextPage = pages[pageName];

    void previousPage?.beforeHide().then(() => {
      PageTransition.set(true);
      $(".page").removeClass("active");
      void Misc.swapElements(
        previousPage.element,
        nextPage.element,
        250,
        async () => {
          PageTransition.set(false);
          nextPage.element.addClass("active");
          resolve(true);
          await nextPage?.afterShow();
          void AdController.reinstate();
        },
        async () => {
          if (nextPage.name === "test") {
            Misc.updateTitle();
          } else {
            Misc.updateTitle(
              Strings.capitalizeFirstLetterOfEachWord(nextPage.name) +
                " | Monkeytype"
            );
          }
          Focus.set(false);
          ActivePage.set(nextPage.name);
          await previousPage?.afterHide();
          await nextPage?.beforeShow({
            params: options.params,
            data: options.data,
          });
        }
      );
    });
  });
}
