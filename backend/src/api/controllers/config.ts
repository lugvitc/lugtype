import {
  ConfigResponse,
  ConfigUpdateBody,
} from "@shared/contract/configs.contract";
import * as ConfigDAL from "../../dal/config";
import { MonkeyResponse, MonkeyResponse2 } from "../../utils/monkey-response";
import MonkeyError from "../../utils/error";

export async function getConfig(
  req: MonkeyTypes.Request2
): Promise<MonkeyResponse2<ConfigResponse>> {
  const { uid } = req.ctx.decodedToken;

  const data = await ConfigDAL.getConfig(uid); //TODO DBConfig?
  if (data === null) throw new MonkeyError(400, "No config found.");
  return new MonkeyResponse2("Configuration retrieved", {
    _id: data["_id"],
    uid: data["uid"],
    config: data["config"], //TODO type definitino
  });
}

export async function saveConfig(
  req: MonkeyTypes.Request2<never, ConfigUpdateBody>
): Promise<MonkeyResponse2<never>> {
  const { config } = req.body;
  const { uid } = req.ctx.decodedToken;

  await ConfigDAL.saveConfig(uid, config);

  return new MonkeyResponse("Config updated");
}
