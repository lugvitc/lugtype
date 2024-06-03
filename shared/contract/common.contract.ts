import { z } from "zod";

export const MonkeyResponseSchema = z.object({
  message: z.string(),
  status: z.number().int(),
});
export type MonkeyResonseType = z.infer<typeof MonkeyResponseSchema>;

export const MonkeyErrorSchema = z.object({
  message: z.string(),
  status: z.number().int(),
  errorId: z.string(),
  uid: z.string().optional(),
});
export type MonkeyErrorType = z.infer<typeof MonkeyErrorSchema>;

export const CustomTextModeSchema = z.enum(["repeat", "random", "suffle"]);
export type CustomTextMode = z.infer<typeof CustomTextModeSchema>;

export const CustomTextLimitModeSchema = z.enum(["word", "time", "section"]);
export type CustomTextLimitMode = z.infer<typeof CustomTextLimitModeSchema>;

export const DifficultySchema = z.enum(["normal", "expert", "master"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

const StringNumberSchema = z.custom<`${number}`>((val) => {
  return typeof val === "string" ? /^\d+$/.test(val) : false;
});
export type StringNumber = z.infer<typeof StringNumberSchema>;
export const PersonalBestSchema = z.object({}); //TODO define
export type PersonnalBest = z.infer<typeof PersonalBestsSchema>;

export const PersonalBestsSchema = z.object({
  time: z.record(StringNumberSchema, z.array(PersonalBestSchema)),
  words: z.record(StringNumberSchema, z.array(PersonalBestSchema)),
  quote: z.record(StringNumberSchema, z.array(PersonalBestSchema)),
  custom: z.record(z.literal("custom"), z.array(PersonalBestSchema)),
  zen: z.record(z.literal("zen"), z.array(PersonalBestSchema)),
});
export type PersonalBests = z.infer<typeof PersonalBestsSchema>;

export const ModeSchema = PersonalBestsSchema.keyof();
export type Mode = z.infer<typeof ModeSchema>;

export const Mode2Schema = z.union([
  StringNumberSchema,
  z.literal("custom"),
  z.literal("zen"),
]);
export type Mode2 = z.infer<typeof Mode2Schema>;

export const KeyStatsSchema = z.object({
  average: z.number(),
  sd: z.number(),
});
export type KeyStats = z.infer<typeof KeyStatsSchema>;

export const IdSchema = z.string().regex(/^[a-f\d]{24}$/i);
