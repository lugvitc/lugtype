import _ from "lodash";
import { randomBytes } from "crypto";
import { hash } from "bcrypt";
import ApeKeysDAO from "../../dao/ape-keys";
import MonkeyError from "../../utils/error";
import { MonkeyResponse } from "../../utils/monkey-response";
import { base64UrlEncode } from "../../utils/misc";

function cleanApeKey(apeKey: MonkeyTypes.ApeKey): Partial<MonkeyTypes.ApeKey> {
  return _.omit(apeKey, "hash");
}

class ApeKeysController {
  static async getApeKeys(req: MonkeyTypes.Request): Promise<MonkeyResponse> {
    const { uid } = req.ctx.decodedToken;

    const apeKeys = await ApeKeysDAO.getApeKeys(uid);
    const hashlessKeys = _.mapValues(apeKeys, cleanApeKey);

    return new MonkeyResponse("ApeKeys retrieved", hashlessKeys);
  }

  static async generateApeKey(
    req: MonkeyTypes.Request
  ): Promise<MonkeyResponse> {
    const { name, enabled } = req.body;
    const { uid } = req.ctx.decodedToken;
    const { maxKeysPerUser, apeKeyBytes, apeKeySaltRounds } =
      req.ctx.configuration.apeKeys;

    const currentNumberOfApeKeys = await ApeKeysDAO.countApeKeysForUser(uid);

    if (currentNumberOfApeKeys >= maxKeysPerUser) {
      throw new MonkeyError(
        409,
        "Maximum number of ApeKeys have been generated"
      );
    }

    const apiKey = randomBytes(apeKeyBytes).toString("base64url");
    const saltyHash = await hash(apiKey, apeKeySaltRounds);

    const apeKey: MonkeyTypes.ApeKey = {
      name,
      enabled,
      hash: saltyHash,
      createdOn: Date.now(),
      modifiedOn: Date.now(),
      lastUsedOn: -1,
    };

    const apeKeyId = await ApeKeysDAO.addApeKey(uid, apeKey);

    return new MonkeyResponse("ApeKey generated", {
      apeKey: base64UrlEncode(`${uid}.${apeKeyId}.${apiKey}`),
      apeKeyId,
      apeKeyDetails: cleanApeKey(apeKey),
    });
  }

  static async updateApeKey(req: MonkeyTypes.Request): Promise<MonkeyResponse> {
    const { apeKeyId } = req.params;
    const { name, enabled } = req.body;
    const { uid } = req.ctx.decodedToken;

    await ApeKeysDAO.updateApeKey(uid, apeKeyId, name, enabled);

    return new MonkeyResponse("ApeKey updated");
  }

  static async deleteApeKey(req: MonkeyTypes.Request): Promise<MonkeyResponse> {
    const { apeKeyId } = req.params;
    const { uid } = req.ctx.decodedToken;

    await ApeKeysDAO.deleteApeKey(uid, apeKeyId);

    return new MonkeyResponse("ApeKey deleted");
  }
}

export default ApeKeysController;
