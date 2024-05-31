import * as ConfigDAL from "../../dal/config";
import { MonkeyResponse, MonkeyResponse2 } from "../../utils/monkey-response";
import {
  GetConfig,
  GetTestConfigParams,
  GetTestConfigQuery,
} from "@shared/contract/config.contract";

export async function getConfig(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { uid } = req.ctx.decodedToken;

  const data = await ConfigDAL.getConfig(uid);
  return new MonkeyResponse("Configuration retrieved", data);
}

export async function getConfigV2(
  req: MonkeyTypes.Request2
): Promise<MonkeyResponse2<GetConfig>> {
  const { uid } = req.ctx.decodedToken;

  const data = await ConfigDAL.getConfig(uid);
  return new MonkeyResponse("Configuration retrieved", data);
}

export async function getTestConfigV2(
  req: MonkeyTypes.Request2<GetTestConfigQuery, unknown, GetTestConfigParams>
): Promise<MonkeyResponse2<GetConfig>> {
  const { noCache, includes } = req.query;
  const { id } = req.params;
  const { uid } = req.ctx.decodedToken;

  console.log(
    `${uid} requested id=${id} with noCache=${noCache} to includes ${includes}`
  );

  const data = await ConfigDAL.getConfig(uid);
  return new MonkeyResponse("Configuration retrieved", data);
}

export async function saveConfig(
  req: MonkeyTypes.Request
): Promise<MonkeyResponse> {
  const { config } = req.body;
  const { uid } = req.ctx.decodedToken;

  await ConfigDAL.saveConfig(uid, config);

  return new MonkeyResponse("Config updated");
}
