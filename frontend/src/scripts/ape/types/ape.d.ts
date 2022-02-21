declare namespace Ape {
  type ClientMethod = (
    endpoint: string,
    config?: RequestOptions
  ) => Promise<Response>;

  interface Client {
    get: ClientMethod;
    post: ClientMethod;
    put: ClientMethod;
    patch: ClientMethod;
    delete: ClientMethod;
  }

  interface RequestOptions {
    searchQuery?: Record<string, any>;
    payload?: any;
  }

  interface Response {
    status: number;
    message: string;
    data?: any;
  }

  type EndpointData = Promise<Response>;
  type Endpoint = () => EndpointData;

  interface Endpoints {
    configs: {
      get: Endpoint;
      save: (config: MonkeyTypes.Config) => EndpointData;
    };

    leaderboards: {
      get: (
        language: string,
        mode: MonkeyTypes.Mode,
        mode2: string | number,
        skip: number,
        limit?: number
      ) => EndpointData;
      getRank: (
        language: string,
        mode: MonkeyTypes.Mode,
        mode2: string | number
      ) => EndpointData;
    };

    presets: {
      get: Endpoint;
      add: (
        presetName: string,
        configChanges: MonkeyTypes.ConfigChanges
      ) => EndpointData;
      edit: (
        presetId: string,
        presetName: string,
        configChanges: MonkeyTypes.ConfigChanges
      ) => EndpointData;
      delete: (presetId: string) => EndpointData;
    };

    psas: {
      get: Endpoint;
    };

    quotes: {
      get: Endpoint;
      submit: (
        text: string,
        source: string,
        language: string,
        captcha: string
      ) => EndpointData;
      approveSubmission: (
        quoteSubmissionId: string,
        editText?: string,
        editSource?: string
      ) => EndpointData;
      rejectSubmission: (quoteSubmissionId: string) => EndpointData;
      getRating: (quote: MonkeyTypes.Quote) => EndpointData;
      addRating: (quote: MonkeyTypes.Quote, rating: number) => EndpointData;
      report: (
        quoteId: string,
        quoteLanguage: string,
        reason: string,
        comment: string,
        captcha: string
      ) => EndpointData;
    };

    users: {
      getData: Endpoint;
      create: (name: string, email?: string, uid?: string) => EndpointData;
      getNameAvailability: (name: string) => EndpointData;
      delete: Endpoint;
      updateName: (name: string) => EndpointData;
      updateLeaderboardMemory: (
        mode: string,
        mode2: MonkeyTypes.Mode2<any>,
        language: string,
        rank: number
      ) => EndpointData;
      updateEmail: (newEmail: string, previousEmail: string) => EndpointData;
      deletePersonalBests: Endpoint;
      getTags: Endpoint;
      createTag: (tagName: string) => EndpointData;
      editTag: (tagId: string, newName: string) => EndpointData;
      deleteTag: (tagId: string) => EndpointData;
      deleteTagPersonalBest: (tagId: string) => EndpointData;
      linkDiscord: (data: {
        tokenType: string;
        accessToken: string;
        uid?: string;
      }) => EndpointData;
      unlinkDiscord: Endpoint;
    };

    results: {
      get: Endpoint;
      save: (result: MonkeyTypes.Result) => EndpointData;
      updateTags: (resultId: string, tagIds: string[]) => EndpointData;
      deleteAll: Endpoint;
    };
  }
}
