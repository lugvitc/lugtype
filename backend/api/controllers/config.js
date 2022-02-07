const ConfigDAO = require("../../dao/config");
const { validateConfig } = require("../../handlers/validation");
const { MonkeyResponse } = require("../../handlers/response");

class ConfigController {
  static async getConfig(req, _res) {
    const { uid } = req.ctx.decodedToken;

    const data = await ConfigDAO.getConfig(uid);
    return new MonkeyResponse(200, "Get configuration successfully", data);
  }

  static async saveConfig(req, res) {
    const { config } = req.body;
    const { uid } = req.ctx.decodedToken;

    validateConfig(config);
    await ConfigDAO.saveConfig(uid, config);

    return new MonkeyResponse(200, "Config updated");
  }
}

module.exports = ConfigController;
