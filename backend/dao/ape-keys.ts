import _ from "lodash";
import UsersDAO from "./user";
import { ObjectId } from "mongodb";
import MonkeyError from "../utils/error";

class ApeKeysDAO {
  static async getApeKeys(uid: string): Promise<MonkeyTypes.User["apeKeys"]> {
    const user = (await UsersDAO.getUser(uid)) as MonkeyTypes.User;
    const userApeKeys = user.apeKeys ?? {};
    return userApeKeys;
  }

  static async countApeKeysForUser(uid: string): Promise<number> {
    const user = (await UsersDAO.getUser(uid)) as MonkeyTypes.User;
    return _.size(user.apeKeys);
  }

  static async addApeKey(
    uid: string,
    apeKey: MonkeyTypes.ApeKey
  ): Promise<string> {
    const user = (await UsersDAO.getUser(uid)) as MonkeyTypes.User;

    const apeKeyId = new ObjectId().toHexString();

    const apeKeys = {
      ...user.apeKeys,
      [apeKeyId]: apeKey,
    };

    await UsersDAO.setApeKeys(uid, apeKeys);

    return apeKeyId;
  }

  static async updateApeKey(
    uid: string,
    keyId: string,
    name?: string,
    enabled?: boolean
  ): Promise<void> {
    const user = (await UsersDAO.getUser(uid)) as MonkeyTypes.User;
    if (_.isNil(user.apeKeys) || !_.has(user.apeKeys, keyId)) {
      throw new MonkeyError(400, "Could not find ApeKey");
    }

    const apeKey = user.apeKeys[keyId];

    const updatedApeKey: MonkeyTypes.ApeKey = {
      ...apeKey,
      modifiedOn: Date.now(),
      name: name ?? apeKey.name,
      enabled: _.isNil(enabled) ? apeKey.enabled : enabled,
    };

    user.apeKeys[keyId] = updatedApeKey;

    await UsersDAO.setApeKeys(uid, user.apeKeys);
  }

  static async deleteApeKey(uid: string, keyId: string): Promise<void> {
    const user = (await UsersDAO.getUser(uid)) as MonkeyTypes.User;
    if (_.isNil(user.apeKeys) || !_.has(user.apeKeys, keyId)) {
      throw new MonkeyError(400, "Could not find ApeKey");
    }

    const apeKeys = _.omit(user.apeKeys, keyId);
    await UsersDAO.setApeKeys(uid, apeKeys);
  }

  static async updateLastUsedOn(
    user: MonkeyTypes.User,
    keyId: string
  ): Promise<void> {
    checkIfKeyExists(user.apeKeys, keyId);

    user.apeKeys[keyId].lastUsedOn = Date.now();
    await UsersDAO.setApeKeys(user.uid, user.apeKeys);
  }
}

export default ApeKeysDAO;
