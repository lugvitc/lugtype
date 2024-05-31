import { AppRoute, AppRouter, Prettify } from "@ts-rest/core";
import { TsRestRequest } from "@ts-rest/express";
import { Router } from "express";

type ObjectId = import("mongodb").ObjectId;

type ExpressRequest = import("express").Request;

declare namespace MonkeyTypes {
  type DecodedToken = {
    type: "Bearer" | "ApeKey" | "None";
    uid: string;
    email: string;
  };

  type Context = {
    configuration: SharedTypes.Configuration;
    decodedToken: DecodedToken;
  };

  type Request2<TBody = never, TQuery = never, TParams = never> = {
    body: Readonly<TBody>;
    query: Readonly<TQuery>;
    params: TParams;
    ctx: Readonly<Context>;
    raw: TsRestRequest<any>;
  };

  type Request = {
    ctx: Readonly<Context>;
  } & ExpressRequest;

  type RequestTsRest<T extends AppRoute | AppRouter = any> = {
    ctx: Readonly<Context>;
  } & TsRestRequest<T>;

  type DBUser = Omit<
    SharedTypes.User,
    | "resultFilterPresets"
    | "tags"
    | "customThemes"
    | "isPremium"
    | "allTimeLbs"
    | "testActivity"
  > & {
    _id: ObjectId;
    resultFilterPresets?: WithObjectIdArray<SharedTypes.ResultFilters[]>;
    tags?: DBUserTag[];
    lbPersonalBests?: LbPersonalBests;
    customThemes?: DBCustomTheme[];
    autoBanTimestamps?: number[];
    inbox?: SharedTypes.MonkeyMail[];
    ips?: string[];
    canReport?: boolean;
    lastNameChange?: number;
    canManageApeKeys?: boolean;
    bananas?: number;
    testActivity?: SharedTypes.CountByYearAndDay;
  };

  type DBCustomTheme = WithObjectId<SharedTypes.CustomTheme>;

  type DBUserTag = WithObjectId<SharedTypes.UserTag>;

  type LbPersonalBests = {
    time: Record<number, Record<string, SharedTypes.PersonalBest>>;
  };

  type WithObjectId<T extends { _id: string }> = Omit<T, "_id"> & {
    _id: ObjectId;
  };

  type WithObjectIdArray<T extends { _id: string }[]> = Omit<T, "_id"> &
    {
      _id: ObjectId;
    }[];

  type ApeKeyDB = SharedTypes.ApeKey & {
    _id: ObjectId;
    uid: string;
    hash: string;
    useCount: number;
  };

  type NewQuote = {
    _id: ObjectId;
    text: string;
    source: string;
    language: string;
    submittedBy: string;
    timestamp: number;
    approved: boolean;
  };

  type ReportTypes = "quote" | "user";

  type Report = {
    _id: ObjectId;
    id: string;
    type: ReportTypes;
    timestamp: number;
    uid: string;
    contentId: string;
    reason: string;
    comment: string;
  };

  type QuoteRating = {
    _id: string;
    average: number;
    language: string;
    quoteId: number;
    ratings: number;
    totalRating: number;
  };

  type FunboxMetadata = {
    name: string;
    canGetPb: boolean;
    difficultyLevel: number;
    properties?: string[];
    frontendForcedConfig?: Record<string, string[] | boolean[]>;
    frontendFunctions?: string[];
  };

  type DBResult = MonkeyTypes.WithObjectId<
    SharedTypes.DBResult<SharedTypes.Config.Mode>
  >;

  type BlocklistEntry = {
    _id: string;
    usernameHash?: string;
    emailHash?: string;
    discordIdHash?: string;
    timestamp: number;
  };

  type DBBlocklistEntry = WithObjectId<MonkeyTypes.BlocklistEntry>;
}
