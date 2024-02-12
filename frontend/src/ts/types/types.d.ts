declare namespace MonkeyTypes {
  type PageName =
    | "loading"
    | "test"
    | "settings"
    | "about"
    | "account"
    | "login"
    | "profile"
    | "profileSearch"
    | "404";

  type LanguageGroup = {
    name: string;
    languages: string[];
  };

  type AddNotificationOptions = {
    important?: boolean;
    duration?: number;
    customTitle?: string;
    customIcon?: string;
    closeCallback?: () => void;
    allowHTML?: boolean;
  };

  type Accents = [string, string][];

  type LanguageObject = {
    name: string;
    rightToLeft: boolean;
    noLazyMode?: boolean;
    ligatures?: boolean;
    orderedByFrequency?: boolean;
    words: string[];
    additionalAccents: Accents;
    bcp47?: string;
    originalPunctuation?: boolean;
  };

  type DefaultWordsModes = 10 | 25 | 50 | 100;

  type DefaultTimeModes = 15 | 30 | 60 | 120;

  type QuoteModes = "short" | "medium" | "long" | "thicc";

  type CustomLayoutFluidSpaces =
    | SharedTypes.Config.CustomLayoutFluid
    | `${string} ${string} ${string}`;

  type HistoryChartData = {
    x: number;
    y: number;
    wpm: number;
    acc: number;
    mode: string;
    mode2: string;
    punctuation: boolean;
    language: string;
    timestamp: number;
    difficulty: string;
    raw: number;
    isPb: boolean;
  };

  type AccChartData = {
    x: number;
    y: number;
    errorRate: number;
  };

  type OtherChartData = {
    x: number;
    y: number;
  };

  type ActivityChartDataPoint = {
    x: number;
    y: number;
    amount?: number;
  };

  type FontObject = {
    name: string;
    display?: string;
  };

  type FunboxWordsFrequency = "normal" | "zipf";

  type FunboxWordOrder = "normal" | "reverse";

  type FunboxProperty =
    | "symmetricChars"
    | "conflictsWithSymmetricChars"
    | "changesWordsVisibility"
    | "speaks"
    | "unspeakable"
    | "changesLayout"
    | "ignoresLayout"
    | "usesLayout"
    | "ignoresLanguage"
    | "noLigatures"
    | "noLetters"
    | "changesCapitalisation"
    | "nospace"
    | `toPush:${number}`
    | "noInfiniteDuration"
    | "changesWordsFrequency"
    | `wordOrder:${FunboxWordOrder}`;

  type FunboxFunctions = {
    getWord?: (wordset?: Wordset, wordIndex?: number) => string;
    punctuateWord?: (word: string) => string;
    withWords?: (words?: string[]) => Promise<Wordset>;
    alterText?: (word: string) => string;
    applyConfig?: () => void;
    applyGlobalCSS?: () => void;
    clearGlobal?: () => void;
    rememberSettings?: () => void;
    toggleScript?: (params: string[]) => void;
    pullSection?: (language?: string) => Promise<Section | false>;
    handleSpace?: () => void;
    handleChar?: (char: string) => string;
    isCharCorrect?: (char: string, originalChar: string) => boolean;
    preventDefaultEvent?: (
      event: JQuery.KeyDownEvent<Document, null, Document, Document>
    ) => Promise<boolean>;
    handleKeydown?: (
      event: JQuery.KeyDownEvent<Document, null, Document, Document>
    ) => Promise<void>;
    getResultContent?: () => string;
    start?: () => void;
    restart?: () => void;
    getWordHtml?: (char: string, letterTag?: boolean) => string;
    getWordsFrequencyMode?: () => FunboxWordsFrequency;
  };

  type FunboxForcedConfig = Record<string, SharedTypes.ConfigValue[]>;

  type FunboxMetadata = {
    name: string;
    info: string;
    canGetPb?: boolean;
    alias?: string;
    forcedConfig?: MonkeyTypes.FunboxForcedConfig;
    properties?: FunboxProperty[];
    functions?: FunboxFunctions;
    hasCSS?: boolean;
  };

  type PresetConfig = {
    tags: string[];
  } & SharedTypes.Config;

  type SnapshotPreset = SharedTypes.DBConfigPreset & {
    display: string;
  };

  type Tag = {
    _id: string;
    name: string;
    display: string;
    personalBests: SharedTypes.PersonalBests;
    active?: boolean;
  };

  type RawCustomTheme = {
    name: string;
    colors: string[];
  };

  type CustomTheme = {
    _id: string;
  } & RawCustomTheme;

  type TypingStats = {
    timeTyping: number;
    startedTests: number;
    completedTests: number;
  };

  type ConfigChanges = {
    tags?: string[];
  } & Partial<SharedTypes.Config>;

  type LeaderboardMemory = {
    time: {
      [key in "15" | "60"]: Record<string, number>;
    };
  };

  type Leaderboards = {
    time: {
      [key in 15 | 60]: SharedTypes.LeaderboardEntry[];
    };
  };

  type QuoteRatings = Record<string, Record<number, number>>;

  type Snapshot = {
    banned?: boolean;
    emailVerified?: boolean;
    quoteRatings?: QuoteRatings;
    results?: SharedTypes.Result<SharedTypes.Config.Mode>[];
    verified?: boolean;
    personalBests: SharedTypes.PersonalBests;
    name: string;
    customThemes: CustomTheme[];
    presets?: SnapshotPreset[];
    tags: Tag[];
    favouriteThemes?: string[];
    lbMemory?: LeaderboardMemory;
    typingStats?: TypingStats;
    quoteMod?: boolean;
    discordId?: string;
    config?: SharedTypes.Config;
    favoriteQuotes: FavoriteQuotes;
    needsToChangeName?: boolean;
    discordAvatar?: string;
    details?: UserDetails;
    inventory?: UserInventory;
    addedAt: number;
    filterPresets: SharedTypes.ResultFilters[];
    xp: number;
    inboxUnreadSize: number;
    streak: number;
    maxStreak: number;
    streakHourOffset?: number;
    lbOptOut?: boolean;
    isPremium?: boolean;
  };

  type UserDetails = {
    bio?: string;
    keyboard?: string;
    socialProfiles: {
      twitter?: string;
      github?: string;
      website?: string;
    };
  };

  type UserInventory = {
    badges: Badge[];
  };

  type Badge = {
    id: number;
    selected?: boolean;
  };

  type FavoriteQuotes = Record<string, string[]>;

  type Group<
    G extends keyof SharedTypes.ResultFilters = keyof SharedTypes.ResultFilters
  > = G extends G ? SharedTypes.ResultFilters[G] : never;

  type Filter<G extends Group = Group> =
    G extends keyof SharedTypes.ResultFilters
      ? keyof SharedTypes.ResultFilters[G]
      : never;

  type TimerStats = {
    dateNow: number;
    now: number;
    expected: number;
    nextDelay: number;
  };

  type Global = {
    snapshot(): Snapshot | undefined;
    config: SharedTypes.Config;
    toggleFilterDebug(): void;
    glarsesMode(): void;
    stats(): void;
    replay(): string;
    enableTimerDebug(): void;
    getTimerStats(): TimerStats[];
    toggleUnsmoothedRaw(): void;
    enableSpacingDebug(): void;
    noGoogleNoMo(): void;
    egVideoListener(options: Record<string, string>): void;
    wpmCalculationDebug(): void;
    toggleDebugLogs(): void;
  };

  type GithubRelease = {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    author: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      gravatar_id: string;
      url: string;
      html_url: string;
      followers_url: string;
      following_url: string;
      gists_url: string;
      starred_url: string;
      subscriptions_url: string;
      organizations_url: string;
      repos_url: string;
      events_url: string;
      received_events_url: string;
      type: string;
      site_admin: boolean;
    };
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    assets: unknown[];
    tarball_url: string;
    zipball_url: string;
    body: string;
    reactions: {
      url: string;
      total_count: number;
      [reaction: string]: number | string;
    };
  };

  type Command = {
    id: string;
    display: string;
    subgroup?: CommandsSubgroup;
    found?: boolean;
    icon?: string;
    noIcon?: boolean;
    sticky?: boolean;
    alias?: string;
    input?: boolean;
    visible?: boolean;
    customStyle?: string;
    defaultValue?: () => string;
    configValue?: string | number | boolean | number[];
    configValueMode?: string;
    exec?: (input?: string) => void;
    hover?: () => void;
    available?: () => void;
    shouldFocusTestUI?: boolean;
    customData?: Record<string, string>;
  };

  type CommandsSubgroup = {
    title: string;
    configKey?: keyof SharedTypes.Config;
    list: Command[];
    beforeList?: () => void;
  };

  type Theme = {
    name: string;
    bgColor: string;
    mainColor: string;
    subColor: string;
    textColor: string;
  };

  type Quote = {
    text: string;
    britishText?: string;
    source: string;
    length: number;
    id: number;
    group: number;
    language: string;
    textSplit?: string[];
  };

  type ThemeColors = {
    bg: string;
    main: string;
    caret: string;
    sub: string;
    subAlt: string;
    text: string;
    error: string;
    errorExtra: string;
    colorfulError: string;
    colorfulErrorExtra: string;
  };

  type Layout = {
    keymapShowTopRow: boolean;
    matrixShowRightColumn?: boolean;
    type: "iso" | "ansi" | "ortho" | "matrix";
    keys: Keys;
  };

  type Layouts = Record<string, Layout>;
  type Keys = {
    row1: string[];
    row2: string[];
    row3: string[];
    row4: string[];
    row5: string[];
  };

  type WpmAndRaw = {
    wpm: number;
    raw: number;
  };

  type Challenge = {
    name: string;
    display: string;
    autoRole: boolean;
    type: string;
    parameters: (string | number | boolean)[];
    message: string;
    requirements: Record<string, Record<string, string | number | boolean>>;
  };

  type UserBadge = {
    id: number;
    name: string;
    description: string;
    icon?: string;
    background?: string;
    color?: string;
    customStyle?: string;
  };

  type MonkeyMail = {
    id: string;
    subject: string;
    body: string;
    timestamp: number;
    read: boolean;
    rewards: AllRewards[];
  };

  type Reward<T> = {
    type: string;
    item: T;
  };

  type XpReward = {
    type: "xp";
    item: number;
  } & Reward<number>;

  type BadgeReward = {
    type: "badge";
    item: Badge;
  } & Reward<Badge>;

  type AllRewards = XpReward | BadgeReward;

  type TypingSpeedUnitSettings = {
    fromWpm: (number: number) => number;
    toWpm: (number: number) => number;
    convertWithUnitSuffix: (number: number, withDecimals: boolean) => string;
    fullUnitString: string;
    histogramDataBucketSize: number;
    historyStepSize: number;
  };
}
