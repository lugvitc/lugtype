import { ZodType, z } from "zod";

/* eslint-disable  @typescript-eslint/explicit-function-return-type */
export const token = () => z.string().regex(/^[\w.]+/);

export function numericEnum<TValues extends readonly number[]>(
  values: TValues
) {
  return z.number().superRefine((val, ctx) => {
    if (!values.includes(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_enum_value,
        options: [...values],
        received: val,
      });
    }
  }) as ZodType<TValues[number]>;
}
