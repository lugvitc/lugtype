import { z } from "zod";

const StringNumberSchema = z.custom<`${number}`>((val) => {
  return typeof val === "string" ? /^\d+$/.test(val) : false;
});
export type StringNumber = z.infer<typeof StringNumberSchema>;

export const PersonalBestSchema = z.object({}); //TODO define
export type PersonalBest = {
  acc: number;
  consistency?: number;
  difficulty: SharedTypes.Config.Difficulty;
  lazyMode?: boolean;
  language: string;
  punctuation?: boolean;
  numbers?: boolean;
  raw: number;
  wpm: number;
  timestamp: number;
};

export const PersonalBestsSchema = z.object({
  time: z.record(StringNumberSchema, z.array(PersonalBestSchema)),
  words: z.record(StringNumberSchema, z.array(PersonalBestSchema)),
  quote: z.record(StringNumberSchema, z.array(PersonalBestSchema)),
  custom: z.record(z.literal("custom"), z.array(PersonalBestSchema)),
  zen: z.record(z.literal("zen"), z.array(PersonalBestSchema)),
});
export type PersonalBests = z.infer<typeof PersonalBestsSchema>;
