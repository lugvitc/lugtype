import { initContract } from "@ts-rest/core";
import { userContract } from "./user.contract";
import { configsContract } from "./configs.contract";

const c = initContract();

export const contract = c.router({
  users: userContract,
  configs: configsContract,
});
