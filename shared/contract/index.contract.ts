import { initContract } from "@ts-rest/core";
import { userContract } from "./user.contract";
import { configContract } from "./config.contract";
import { resultsContract } from "./results.contract";

const c = initContract();

export const contract = c.router({
  users: userContract,
  configs: configContract,
  results: resultsContract,
});
