import ConfigDAO from "../../dao/config";
import { MonkeyResponse } from "../../handlers/monkey-response";

class ConfigController {
  static async getConfig(req: MonkeyTypes.Request): Promise<MonkeyResponse> {
    const { uid } = req.ctx.decodedToken;

    const data = await ConfigDAO.getConfig(uid);
    return new MonkeyResponse("Configuration retrieved", data);
  }

  static async saveConfig(req: MonkeyTypes.Request): Promise<MonkeyResponse> {
    const { config } = req.body;
    const { uid } = req.ctx.decodedToken;

    await ConfigDAO.saveConfig(uid, config);

    return new MonkeyResponse("Config updated");
  }
}

export default ConfigController;
