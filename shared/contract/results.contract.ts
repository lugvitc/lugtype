import { initContract } from "@ts-rest/core";
import { z } from "zod";
import * as Common from "./common.contract";
import { MonkeyResponseSchema, MonkeyErrorSchema } from "./common.contract";

const c = initContract();

//@ts-ignore
const token = () => z.string().regex(/^[\w.]+/);

const x = typeof token();

const ChartDataSchema = z.object({
  wpm: z.array(z.number().min(0)).max(122),
  raw: z.array(z.number().min(0)).max(122),
  err: z.array(z.number().min(0)).max(122),
});

const GetResultsQuerySchema = z.object({
  onOrAfterTimestamp: z.number().int().min(1589428800000).optional(),
  limit: z.number().int().min(0).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
});
export type GetResultsQuery = z.infer<typeof GetResultsQuerySchema>;

const ResultSchema = z.object({
  _id: z.string().readonly(),
  acc: z.number().min(50).max(100),
  afkDuration: z.number().min(0),
  bailedOut: z.boolean(),
  blindMode: z.boolean(),
  charStats: z.array(z.number().min(0)).length(4),
  chartData: ChartDataSchema.or(z.literal("toolong")),
  consistency: z.number().min(0).max(100),
  difficulty: Common.DifficultySchema,
  funbox: z
    .string()
    .max(100)
    .regex(/[\w#]+/),
  incompleteTestSeconds: z.number().min(0),
  incompleteTests: z.array(
    z.object({
      acc: z.number().min(0).max(100),
      seconds: z.number().min(0),
    })
  ),
  isPb: z.boolean(),
  keyConsistency: z.number().min(0).max(100),
  keyDurationStats: Common.KeyStatsSchema,
  keySpacingStats: Common.KeyStatsSchema,
  language: token().max(100),
  lazyMode: z.boolean(),
  mode: Common.ModeSchema,
  mode2: Common.Mode2Schema,
  name: z.string(),
  numbers: z.boolean(),
  punctuation: z.boolean(),
  quoteLength: z.number().min(0).max(3).optional(),
  rawWpm: z.number().min(0).readonly(),
  restartCount: z.number(),
  tags: z.array(Common.IdSchema),
  testDuration: z.number().min(1),
  timestamp: z.number().int().min(1589428800000),
  uid: token().max(100),
  wpm: z.number().min(0).max(420),
});
export type Result = z.infer<typeof ResultSchema>;

const GetResultsSchema = z.array(ResultSchema);
export type GetResults = z.infer<typeof GetResultsSchema>;

const CompletedEventSchema = ResultSchema.omit({
  _id: true,
  isPb: true,
  keyDurationStats: true,
  keySpacingStats: true,
  rawWpm: true,
}).extend({
  challenge: token().max(100).optional(),
  charTotal: z.number().min(0).optional(),
  customText: z
    .object({
      textLen: z.number(),
      mode: Common.CustomTextModeSchema,
      pipeDelimiter: z.boolean(),
      limit: z.object({
        mode: Common.CustomTextLimitModeSchema,
        value: z.number().min(0),
      }),
    })
    .optional(),
  hash: token().max(100).optional(),
  keyDuration: z.array(z.number().min(0)).or(z.literal("toolong")).optional(),
  keySpacing: z.array(z.number().min(0)).or(z.literal("toolong")).optional(),
  keyOverlap: z.number().min(0).optional(),
  lastKeyToEnd: z.number().min(0).optional(),
  startToFirstKey: z.number().min(0).optional(),
  wpmConsistency: z.number().min(0).max(100),
  stopOnLetter: z.boolean(),
});
export type CompletedEvent = z.infer<typeof CompletedEventSchema>;

const CreateResultBodySchema = z.object({
  result: CompletedEventSchema,
});
export type CreateResultBody = z.infer<typeof CreateResultBodySchema>;

const CreateResultSchema = z.object({
  isPb: z.boolean(),
  tagPbs: z.array(z.string()),
  insertedId: z.string(),
  dailyLeaderboardRank: z.number().optional(),
  weeklyXpLeaderboardRank: z.number().optional(),
  xp: z.number(),
  dailyXpBonus: z.boolean(),
  xpBreakdown: z.record(z.string(), z.number()),
  streak: z.number(),
});
export type CreateResult = z.infer<typeof CreateResultSchema>;

const UpdateTagsBodySchema = z.object({
  tagIds: z.array(Common.IdSchema),
  resultId: Common.IdSchema,
});
export type UpdateTagsBody = z.infer<typeof UpdateTagsBodySchema>;

const UpdateTagsSchema = z.object({
  tagPbs: z.array(Common.IdSchema),
});
export type UpdateTags = z.infer<typeof UpdateTagsSchema>;

export const resultsContract = c.router(
  {
    get: {
      method: "GET",
      path: "/",
      query: GetResultsQuerySchema,
      responses: {
        200: MonkeyResponseSchema.extend({ data: GetResultsSchema }),
        400: MonkeyErrorSchema,
      },
    },
    save: {
      method: "POST",
      path: "/",
      body: CreateResultBodySchema,
      responses: {
        200: MonkeyResponseSchema.extend({ data: CreateResultSchema }),
        400: MonkeyErrorSchema,
      },
    },
    delete: {
      method: "DELETE",
      path: "/",
      body: z.object({}),
      responses: {
        200: MonkeyResponseSchema,
        400: MonkeyErrorSchema,
      },
    },
    getLast: {
      method: "GET",
      path: "/last",
      responses: {
        200: MonkeyResponseSchema.extend({ data: ResultSchema }),
        400: MonkeyErrorSchema,
      },
    },
    updateTags: {
      method: "PATCH",
      path: "/tags",
      body: UpdateTagsBodySchema,
      responses: {
        200: MonkeyResponseSchema.extend({ data: UpdateTagsSchema }),
        400: MonkeyErrorSchema,
      },
    },
  },
  {
    pathPrefix: "/results",
  }
);
