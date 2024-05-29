import { z } from "zod";

export const CreateNewUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  captcha: z.string(),
  uid: z.string(),
});

export type CreateNewUserBodyType = z.infer<typeof CreateNewUserBodySchema>;

export type CreateNewUserResponseType = null;
