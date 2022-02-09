import PresetDAO from "../../dao/preset";

class PresetController {
  static async getPresets(req, _res) {
    const { uid } = req.ctx.decodedToken;

    return await PresetDAO.getPresets(uid);
  }

  static async addPreset(req, _res) {
    const { name, config } = req.body;
    const { uid } = req.ctx.decodedToken;

    return await PresetDAO.addPreset(uid, name, config);
  }

  static async editPreset(req, res) {
    const { _id, name, config } = req.body;
    const { uid } = req.ctx.decodedToken;

    await PresetDAO.editPreset(uid, _id, name, config);

    return res.sendStatus(200);
  }

  static async removePreset(req, res) {
    const { _id } = req.body;
    const { uid } = req.ctx.decodedToken;

    await PresetDAO.removePreset(uid, _id);

    return res.sendStatus(200);
  }
}

export default PresetController;
