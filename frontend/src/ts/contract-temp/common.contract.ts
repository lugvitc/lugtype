import { z } from "zod";

export const MonkeyResponseSchema = z.object({
  message: z.string(),
  status: z.number().int(),
});
export type MonkeyResonseType = z.infer<typeof MonkeyResponseSchema>;

export const MonkeyErrorSchema = z.object({
  status: z.number().int(),
  errorId: z.string(),
  uid: z.string().optional(),
});
export type MonkeyErrorType = z.infer<typeof MonkeyErrorSchema>;
