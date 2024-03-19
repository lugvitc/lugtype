import { isPopupVisible } from "./misc";
import * as Skeleton from "./skeleton";

type CustomAnimation = {
  from: Record<string, string>;
  to: Record<string, string>;
  easing?: string;
  durationMs?: number;
};

type CustomWrapperAndModalAnimations = {
  wrapper?: CustomAnimation;
  modal?: CustomAnimation;
};

type ConstructorCustomAnimations = {
  show?: CustomWrapperAndModalAnimations;
  hide?: CustomWrapperAndModalAnimations;
};

type ShowHideOptions = {
  animationMode?: "none" | "both" | "modalOnly";
  animationDurationMs?: number;
  customAnimation?: CustomWrapperAndModalAnimations;
  beforeAnimation?: (modal: HTMLElement) => Promise<void>;
  afterAnimation?: (modal: HTMLElement) => Promise<void>;
};

export type ShowOptions = ShowHideOptions & {
  mode?: "modal" | "dialog";
  focusFirstInput?: true | "focusAndSelect";
  modalChain?: AnimatedModal;
};

export type HideOptions = ShowHideOptions & {
  clearModalChain?: boolean;
};

type ConstructorParams = {
  dialogId: string;
  appendTo?: Skeleton.SkeletonAppendParents;
  customAnimations?: ConstructorCustomAnimations;
  showOptionsWhenInChain?: ShowOptions;
  customEscapeHandler?: (e: KeyboardEvent) => void;
  customWrapperClickHandler?: (e: MouseEvent) => void;
  setup?: (modal: HTMLElement) => void;
};

const DEFAULT_ANIMATION_DURATION = 125;
const MODAL_ONLY_ANIMATION_MULTIPLIER = 0.75;

export default class AnimatedModal {
  private wrapperEl: HTMLDialogElement;
  private modalEl: HTMLElement;
  private dialogId: string;
  private open = false;
  private setupRan = false;
  private previousModalInChain: AnimatedModal | undefined;
  private showOptionsWhenInChain: ShowOptions | undefined;
  private skeletonAppendParent: Skeleton.SkeletonAppendParents;
  private customShowAnimations: CustomWrapperAndModalAnimations | undefined;
  private customHideAnimations: CustomWrapperAndModalAnimations | undefined;

  private customEscapeHandler: ((e: KeyboardEvent) => void) | undefined;
  private customWrapperClickHandler: ((e: MouseEvent) => void) | undefined;
  private setup: ((modal: HTMLElement) => void) | undefined;

  constructor(constructorParams: ConstructorParams) {
    if (constructorParams.dialogId.startsWith("#")) {
      constructorParams.dialogId = constructorParams.dialogId.slice(1);
    }

    this.skeletonAppendParent = constructorParams.appendTo ?? "popups";
    if (Skeleton.has(constructorParams.dialogId)) {
      Skeleton.append(constructorParams.dialogId, this.skeletonAppendParent);
    }

    const dialogElement = document.getElementById(constructorParams.dialogId);
    const modalElement = document.querySelector(
      `#${constructorParams.dialogId} > .modal`
    ) as HTMLElement;

    if (dialogElement === null) {
      throw new Error(
        `Dialog element with id ${constructorParams.dialogId} not found`
      );
    }

    if (!(dialogElement instanceof HTMLDialogElement)) {
      throw new Error("Animated dialog must be an HTMLDialogElement");
    }

    if (dialogElement === null) {
      throw new Error(
        `Dialog element with id ${constructorParams.dialogId} not found`
      );
    }

    if (modalElement === null) {
      throw new Error(
        `Div element inside #${constructorParams.dialogId} with class 'modal' not found`
      );
    }

    this.dialogId = constructorParams.dialogId;
    this.wrapperEl = dialogElement;
    this.modalEl = modalElement;
    this.customShowAnimations = constructorParams.customAnimations?.show;
    this.customHideAnimations = constructorParams.customAnimations?.hide;
    this.previousModalInChain = undefined;
    this.showOptionsWhenInChain = constructorParams.showOptionsWhenInChain;

    this.customEscapeHandler = constructorParams?.customEscapeHandler;
    this.customWrapperClickHandler =
      constructorParams?.customWrapperClickHandler;
    this.setup = constructorParams?.setup;

    Skeleton.save(this.dialogId);
  }

  runSetup(): void {
    this.wrapperEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isPopupVisible(this.dialogId)) {
        if (this.customEscapeHandler !== undefined) {
          this.customEscapeHandler(e);
        } else {
          void this.hide();
        }
      }
    });

    this.wrapperEl.addEventListener("mousedown", (e) => {
      if (e.target === this.wrapperEl) {
        if (this.customWrapperClickHandler !== undefined) {
          this.customWrapperClickHandler(e);
        } else {
          void this.hide();
        }
      }
    });

    if (this.setup !== undefined) {
      this.setup(this.modalEl);
    }
  }

  getDialogId(): string {
    return this.dialogId;
  }

  getWrapper(): HTMLDialogElement {
    return this.wrapperEl;
  }

  getModal(): HTMLElement {
    return this.modalEl;
  }

  isOpen(): boolean {
    return this.open;
  }

  focusFirstInput(setting: true | "focusAndSelect" | undefined): void {
    const input = this.modalEl.querySelector("input");
    if (input !== null) {
      const isHidden = input.classList.contains("hidden");
      if (isHidden) {
        this.wrapperEl.focus();
      } else {
        if (setting === true) {
          input.focus();
        } else if (setting === "focusAndSelect") {
          input.focus();
          input.select();
        }
      }
    } else {
      this.wrapperEl.focus();
    }
  }

  async show(options?: ShowOptions): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (this.open) return resolve();
      Skeleton.append(this.dialogId, this.skeletonAppendParent);

      if (!this.setupRan) {
        this.runSetup();
        this.setupRan = true;
      }

      if (isPopupVisible(this.dialogId)) return resolve();

      const modalAnimationDuration =
        (options?.customAnimation?.modal?.durationMs ??
          options?.animationDurationMs ??
          this.customShowAnimations?.modal?.durationMs ??
          DEFAULT_ANIMATION_DURATION) *
        (options?.modalChain !== undefined
          ? MODAL_ONLY_ANIMATION_MULTIPLIER
          : 1);

      if (options?.modalChain !== undefined) {
        this.previousModalInChain = options.modalChain;
        await this.previousModalInChain.hide({
          animationMode: "modalOnly",
          animationDurationMs: modalAnimationDuration,
        });
      }

      this.open = true;
      if (options?.mode === "dialog") {
        this.wrapperEl.show();
      } else if (options?.mode === "modal" || options?.mode === undefined) {
        this.wrapperEl.showModal();
      }

      await options?.beforeAnimation?.(this.modalEl);

      //wait until the next event loop to allow the dialog to start animating
      setTimeout(async () => {
        this.focusFirstInput(options?.focusFirstInput);
      }, 1);

      const modalAnimation =
        options?.customAnimation?.modal ?? this.customShowAnimations?.modal;
      const wrapperAnimation = options?.customAnimation?.wrapper ??
        this.customShowAnimations?.wrapper ?? {
          from: { opacity: "0" },
          to: { opacity: "1" },
          easing: "swing",
        };
      const wrapperAnimationDuration =
        options?.customAnimation?.wrapper?.durationMs ??
        this.customShowAnimations?.wrapper?.durationMs ??
        DEFAULT_ANIMATION_DURATION;

      const animationMode =
        this.previousModalInChain !== undefined
          ? "modalOnly"
          : options?.animationMode ?? "both";

      $(this.modalEl).stop(true, false);
      $(this.wrapperEl).stop(true, false);

      if (animationMode === "both" || animationMode === "none") {
        if (modalAnimation?.from) {
          $(this.modalEl).css(modalAnimation.from);
          $(this.modalEl).animate(
            modalAnimation.to,
            animationMode === "none" ? 0 : modalAnimationDuration,
            modalAnimation.easing ?? "swing"
          );
        } else {
          $(this.modalEl).css("opacity", "1");
        }

        $(this.wrapperEl).css(wrapperAnimation.from);
        $(this.wrapperEl)
          .removeClass("hidden")
          .css("opacity", "0")
          .animate(
            wrapperAnimation.to ?? { opacity: 1 },
            animationMode === "none" ? 0 : wrapperAnimationDuration,
            wrapperAnimation.easing ?? "swing",
            async () => {
              this.focusFirstInput(options?.focusFirstInput);
              await options?.afterAnimation?.(this.modalEl);
              resolve();
            }
          );
      } else if (animationMode === "modalOnly") {
        $(this.wrapperEl).removeClass("hidden").css("opacity", "1");

        if (modalAnimation?.from) {
          $(this.modalEl).css(modalAnimation.from);
        } else {
          $(this.modalEl).css("opacity", "0");
        }
        $(this.modalEl).animate(
          modalAnimation?.to ?? { opacity: 1 },
          modalAnimationDuration,
          modalAnimation?.easing ?? "swing",
          async () => {
            this.focusFirstInput(options?.focusFirstInput);
            await options?.afterAnimation?.(this.modalEl);
            resolve();
          }
        );
      }
    });
  }

  async hide(options?: HideOptions): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (!isPopupVisible(this.dialogId)) return resolve();

      if (options?.clearModalChain) {
        this.previousModalInChain = undefined;
      }

      await options?.beforeAnimation?.(this.modalEl);

      const modalAnimation =
        options?.customAnimation?.modal ?? this.customHideAnimations?.modal;
      const modalAnimationDuration =
        (options?.customAnimation?.modal?.durationMs ??
          options?.animationDurationMs ??
          this.customHideAnimations?.modal?.durationMs ??
          DEFAULT_ANIMATION_DURATION) *
        (this.previousModalInChain !== undefined
          ? MODAL_ONLY_ANIMATION_MULTIPLIER
          : 1);
      const wrapperAnimation = options?.customAnimation?.wrapper ??
        this.customHideAnimations?.wrapper ?? {
          from: { opacity: "1" },
          to: { opacity: "0" },
          easing: "swing",
        };
      const wrapperAnimationDuration =
        options?.customAnimation?.wrapper?.durationMs ??
        this.customHideAnimations?.wrapper?.durationMs ??
        DEFAULT_ANIMATION_DURATION;
      const animationMode =
        this.previousModalInChain !== undefined
          ? "modalOnly"
          : options?.animationMode ?? "both";

      $(this.modalEl).stop(true, false);
      $(this.wrapperEl).stop(true, false);

      if (animationMode === "both" || animationMode === "none") {
        if (modalAnimation?.from) {
          $(this.modalEl).css(modalAnimation.from);
          $(this.modalEl).animate(
            modalAnimation.to,
            animationMode === "none" ? 0 : modalAnimationDuration,
            modalAnimation.easing ?? "swing"
          );
        } else {
          $(this.modalEl).css("opacity", "1");
        }

        $(this.wrapperEl).css(wrapperAnimation.from);
        $(this.wrapperEl)
          .css("opacity", "1")
          .animate(
            wrapperAnimation?.to ?? { opacity: 0 },
            animationMode === "none" ? 0 : wrapperAnimationDuration,
            wrapperAnimation?.easing ?? "swing",
            async () => {
              this.wrapperEl.close();
              this.wrapperEl.classList.add("hidden");
              Skeleton.remove(this.dialogId);
              this.open = false;
              await options?.afterAnimation?.(this.modalEl);

              if (this.previousModalInChain !== undefined) {
                await this.previousModalInChain.show({
                  animationMode: "modalOnly",
                  animationDurationMs:
                    modalAnimationDuration * MODAL_ONLY_ANIMATION_MULTIPLIER,
                  ...this.previousModalInChain.showOptionsWhenInChain,
                });
                this.previousModalInChain = undefined;
              }

              resolve();
            }
          );
      } else if (animationMode === "modalOnly") {
        $(this.wrapperEl).removeClass("hidden").css("opacity", "1");

        if (modalAnimation?.from) {
          $(this.modalEl).css(modalAnimation.from);
        } else {
          $(this.modalEl).css("opacity", "1");
        }
        $(this.modalEl).animate(
          modalAnimation?.to ?? { opacity: 0 },
          modalAnimationDuration,
          modalAnimation?.easing ?? "swing",
          async () => {
            this.wrapperEl.close();
            $(this.wrapperEl).addClass("hidden").css("opacity", "0");
            Skeleton.remove(this.dialogId);
            this.open = false;
            await options?.afterAnimation?.(this.modalEl);

            if (this.previousModalInChain !== undefined) {
              await this.previousModalInChain.show({
                animationMode: "modalOnly",
                animationDurationMs:
                  modalAnimationDuration * MODAL_ONLY_ANIMATION_MULTIPLIER,
                ...this.previousModalInChain.showOptionsWhenInChain,
              });
              this.previousModalInChain = undefined;
            }

            resolve();
          }
        );
      }
    });
  }

  destroy(): void {
    this.wrapperEl.close();
    this.wrapperEl.classList.add("hidden");
    Skeleton.remove(this.dialogId);
    this.open = false;
  }
}
