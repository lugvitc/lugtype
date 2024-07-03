import { initContract } from "@ts-rest/core";
import { z } from "zod";

import {
  AccountChartSchema,
  AdsSchema,
  CaretStyleSchema,
  ConfidenceModeSchema,
  CustomBackgroundFilterSchema,
  CustomBackgroundSchema,
  CustomBackgroundSizeSchema,
  CustomLayoutFluidSchema,
  CustomThemeColorsSchema,
  FavThemesSchema,
  FontFamilySchema,
  FontSizeSchema,
  FunboxSchema,
  HighlightModeSchema,
  IndicateTyposSchema,
  KeymapLayoutSchema,
  KeymapLegendStyleSchema,
  KeymapModeSchema,
  KeymapShowTopRowSchema,
  KeymapStyleSchema,
  LanguageSchema,
  LayoutSchema,
  LiveSpeedAccBurstStyleSchema,
  MaxLineWidthSchema,
  MinWpmCustomSpeedSchema,
  MinimumAccuracyCustomSchema,
  MinimumAccuracySchema,
  MinimumBurstCustomSpeedSchema,
  MinimumBurstSchema,
  MinimumWordsPerMinuteSchema,
  MonkeyPowerLevelSchema,
  OppositeShiftModeSchema,
  PaceCaretCustomSpeedSchema,
  PaceCaretSchema,
  PlaySoundOnClickSchema,
  PlaySoundOnErrorSchema,
  QuickRestartSchema,
  QuoteLengthConfigSchema,
  RandomThemeSchema,
  RepeatQuotesSchema,
  ShowAverageSchema,
  SingleListCommandLineSchema,
  SmoothCaretSchema,
  SoundVolumeSchema,
  StopOnErrorSchema,
  TapeModeSchema,
  ThemeNameSchema,
  TimeConfigSchema,
  TimerColorSchema,
  TimerOpacitySchema,
  TimerStyleSchema,
  TypingSpeedUnitSchema,
  WordCountSchema,
} from "./shared/config";

import {
  DifficultySchema,
  Metadata,
  ModeSchema,
  MonkeyErrorResponseSchema,
  MonkeyErrorSchema,
  MonkeyResponseSchema,
} from "./shared/types";
import { responseWithNullableData } from "./shared/helpers";

export const ConfigSchema = z
  .object({
    theme: ThemeNameSchema,
    themeLight: ThemeNameSchema,
    themeDark: ThemeNameSchema,
    autoSwitchTheme: z.boolean(),
    customTheme: z.boolean(),
    //customThemeId: token().nonnegative().max(24),
    customThemeColors: CustomThemeColorsSchema,
    favThemes: FavThemesSchema,
    showKeyTips: z.boolean(),
    smoothCaret: SmoothCaretSchema,
    quickRestart: QuickRestartSchema,
    punctuation: z.boolean(),
    numbers: z.boolean(),
    words: WordCountSchema,
    time: TimeConfigSchema,
    mode: ModeSchema,
    quoteLength: QuoteLengthConfigSchema,
    language: LanguageSchema,
    fontSize: FontSizeSchema,
    freedomMode: z.boolean(),
    difficulty: DifficultySchema,
    blindMode: z.boolean(),
    quickEnd: z.boolean(),
    caretStyle: CaretStyleSchema,
    paceCaretStyle: CaretStyleSchema,
    flipTestColors: z.boolean(),
    layout: LayoutSchema,
    funbox: FunboxSchema,
    confidenceMode: ConfidenceModeSchema,
    indicateTypos: IndicateTyposSchema,
    timerStyle: TimerStyleSchema,
    liveSpeedStyle: LiveSpeedAccBurstStyleSchema,
    liveAccStyle: LiveSpeedAccBurstStyleSchema,
    liveBurstStyle: LiveSpeedAccBurstStyleSchema,
    colorfulMode: z.boolean(),
    randomTheme: RandomThemeSchema,
    timerColor: TimerColorSchema,
    timerOpacity: TimerOpacitySchema,
    stopOnError: StopOnErrorSchema,
    showAllLines: z.boolean(),
    keymapMode: KeymapModeSchema,
    keymapStyle: KeymapStyleSchema,
    keymapLegendStyle: KeymapLegendStyleSchema,
    keymapLayout: KeymapLayoutSchema,
    keymapShowTopRow: KeymapShowTopRowSchema,
    fontFamily: FontFamilySchema,
    smoothLineScroll: z.boolean(),
    alwaysShowDecimalPlaces: z.boolean(),
    alwaysShowWordsHistory: z.boolean(),
    singleListCommandLine: SingleListCommandLineSchema,
    capsLockWarning: z.boolean(),
    playSoundOnError: PlaySoundOnErrorSchema,
    playSoundOnClick: PlaySoundOnClickSchema,
    soundVolume: SoundVolumeSchema,
    startGraphsAtZero: z.boolean(),
    showOutOfFocusWarning: z.boolean(),
    paceCaret: PaceCaretSchema,
    paceCaretCustomSpeed: PaceCaretCustomSpeedSchema,
    repeatedPace: z.boolean(),
    accountChart: AccountChartSchema,
    minWpm: MinimumWordsPerMinuteSchema,
    minWpmCustomSpeed: MinWpmCustomSpeedSchema,
    highlightMode: HighlightModeSchema,
    tapeMode: TapeModeSchema,
    typingSpeedUnit: TypingSpeedUnitSchema,
    ads: AdsSchema,
    hideExtraLetters: z.boolean(),
    strictSpace: z.boolean(),
    minAcc: MinimumAccuracySchema,
    minAccCustom: MinimumAccuracyCustomSchema,
    monkey: z.boolean(),
    repeatQuotes: RepeatQuotesSchema,
    oppositeShiftMode: OppositeShiftModeSchema,
    customBackground: CustomBackgroundSchema,
    customBackgroundSize: CustomBackgroundSizeSchema,
    customBackgroundFilter: CustomBackgroundFilterSchema,
    customLayoutfluid: CustomLayoutFluidSchema,
    monkeyPowerLevel: MonkeyPowerLevelSchema,
    minBurst: MinimumBurstSchema,
    minBurstCustomSpeed: MinimumBurstCustomSpeedSchema,
    burstHeatmap: z.boolean(),
    britishEnglish: z.boolean(),
    lazyMode: z.boolean(),
    showAverage: ShowAverageSchema,
    maxLineWidth: MaxLineWidthSchema,
  })
  .strict();
export type Config = z.infer<typeof ConfigSchema>;

export const PartialConfigSchema = ConfigSchema.partial();
export type PartialConfig = z.infer<typeof PartialConfigSchema>;

export const GetConfigResponseSchema =
  responseWithNullableData(PartialConfigSchema);

export type GetConfigResponse = z.infer<typeof GetConfigResponseSchema>;

const c = initContract();

export const configsContract = c.router(
  {
    get: {
      summary: "get config",
      description: "Get config of the current user.",
      method: "GET",
      path: "/",
      responses: {
        200: GetConfigResponseSchema,
      },
    },
    save: {
      method: "PATCH",
      path: "/",
      body: PartialConfigSchema.strict(),
      responses: {
        200: MonkeyResponseSchema,
      },
      summary: "update config",
      description:
        "Update the config of the current user. Only provided values will be updated while the missing values will be unchanged.",
    },
    delete: {
      method: "DELETE",
      path: "/",
      body: c.noBody(),
      responses: {
        200: MonkeyResponseSchema,
      },
      summary: "delete config",
      description: "Delete/reset the config for the current user.",
    },
  },
  {
    pathPrefix: "/configs",
    strictStatusCodes: true,
    metadata: {
      tags: "configs",
    } as Metadata,

    commonResponses: {
      400: MonkeyErrorResponseSchema,
      500: MonkeyErrorSchema,
    },
  }
);
