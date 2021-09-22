const MonkeyError = require("../handlers/error");
const { mongoDB } = require("../init/mongodb");
const { ObjectID } = require("mongodb");
const { checkAndUpdatePb } = require("../handlers/pb");
const { updateAuthEmail } = require("../handlers/auth");
const { isUsernameValid } = require("../handlers/validation");

class UsersDAO {
  static async addUser(name, email, uid) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (user)
      throw new MonkeyError(400, "User document already exists", "addUser");
    return await mongoDB()
      .collection("users")
      .insertOne({ name, email, uid, addedAt: Date.now() });
  }

  static async deleteUser(uid) {
    return await mongoDB().collection("users").deleteOne({ uid });
  }

  static async updateName(uid, name) {
    const nameDoc = await mongoDB()
      .collection("users")
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (nameDoc) throw new MonkeyError(409, "Username already taken");
    let user = await mongoDB().collection("users").findOne({ uid });
    if (
      Date.now() - user.lastNameChange < 2592000000 &&
      isUsernameValid(user.name)
    ) {
      throw new MonkeyError(409, "You can change your name once every 30 days");
    }
    return await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $set: { name, lastNameChange: Date.now() } });
  }

  static async clearPb(uid) {
    return await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $set: { personalBests: {} } });
  }

  static async isNameAvailable(name) {
    const nameDoc = await mongoDB().collection("users").findOne({ name });
    if (nameDoc) {
      return false;
    } else {
      return true;
    }
  }

  static async updateQuoteRatings(uid, quoteRatings) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user)
      throw new MonkeyError(404, "User not found", "updateQuoteRatings");
    await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $set: { quoteRatings } });
    return true;
  }

  static async updateEmail(uid, email) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "update email");
    await updateAuthEmail(uid, email);
    await mongoDB().collection("users").updateOne({ uid }, { $set: { email } });
    return true;
  }

  static async getUser(uid) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "get user");
    return user;
  }

  static async getUserByDiscordId(discordId) {
    const user = await mongoDB().collection("users").findOne({ discordId });
    if (!user)
      throw new MonkeyError(404, "User not found", "get user by discord id");
    return user;
  }

  static async addTag(uid, name) {
    let _id = ObjectID();
    await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $push: { tags: { _id, name } } });
    return {
      _id,
      name,
    };
  }

  static async getTags(uid) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "get tags");
    return user.tags;
  }

  static async editTag(uid, _id, name) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "edit tag");
    if (
      user.tags === undefined ||
      user.tags.filter((t) => t._id == _id).length === 0
    )
      throw new MonkeyError(404, "Tag not found");
    return await mongoDB()
      .collection("users")
      .updateOne(
        {
          uid: uid,
          "tags._id": ObjectID(_id),
        },
        { $set: { "tags.$.name": name } }
      );
  }

  static async removeTag(uid, _id) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "remove tag");
    if (
      user.tags === undefined ||
      user.tags.filter((t) => t._id == _id).length === 0
    )
      throw new MonkeyError(404, "Tag not found");
    return await mongoDB()
      .collection("users")
      .updateOne(
        {
          uid: uid,
          "tags._id": ObjectID(_id),
        },
        { $pull: { tags: { _id: ObjectID(_id) } } }
      );
  }

  static async removeTagPb(uid, _id) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "remove tag pb");
    if (
      user.tags === undefined ||
      user.tags.filter((t) => t._id == _id).length === 0
    )
      throw new MonkeyError(404, "Tag not found");
    return await mongoDB()
      .collection("users")
      .updateOne(
        {
          uid: uid,
          "tags._id": ObjectID(_id),
        },
        { $set: { "tags.$.personalBests": {} } }
      );
  }

  static async updateLbMemory(uid, mode, mode2, language, rank) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "update lb memory");
    if (user.lbMemory === undefined) user.lbMemory = {};
    if (user.lbMemory[mode] === undefined) user.lbMemory[mode] = {};
    if (user.lbMemory[mode][mode2] === undefined)
      user.lbMemory[mode][mode2] = {};
    user.lbMemory[mode][mode2][language] = rank;
    return await mongoDB()
      .collection("users")
      .updateOne(
        { uid },
        {
          $set: { lbMemory: user.lbMemory },
        }
      );
  }

  static async checkIfPb(uid, result) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "check if pb");

    const {
      mode,
      mode2,
      acc,
      consistency,
      difficulty,
      lazyMode,
      language,
      punctuation,
      rawWpm,
      wpm,
      funbox,
    } = result;

    if (funbox !== "none" && funbox !== "plus_one" && funbox !== "plus_two") {
      return false;
    }

    if (mode === "quote") {
      return false;
    }

    let lbpb = user.lbPersonalBests;
    if (!lbpb) lbpb = {};

    let pb = checkAndUpdatePb(
      user.personalBests,
      lbpb,
      mode,
      mode2,
      acc,
      consistency,
      difficulty,
      lazyMode,
      language,
      punctuation,
      rawWpm,
      wpm
    );

    if (pb.isPb) {
      await mongoDB()
        .collection("users")
        .updateOne({ uid }, { $set: { personalBests: pb.obj } });
      if (pb.lbObj) {
        await mongoDB()
          .collection("users")
          .updateOne({ uid }, { $set: { lbPersonalBests: pb.lbObj } });
      }
      return true;
    } else {
      return false;
    }
  }

  static async checkIfTagPb(uid, result) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "check if tag pb");

    if (user.tags === undefined || user.tags.length === 0) {
      return [];
    }

    const {
      mode,
      mode2,
      acc,
      consistency,
      difficulty,
      lazyMode,
      language,
      punctuation,
      rawWpm,
      wpm,
      tags,
      funbox,
    } = result;

    if (funbox !== "none" && funbox !== "plus_one" && funbox !== "plus_two") {
      return [];
    }

    if (mode === "quote") {
      return [];
    }

    let tagsToCheck = [];
    user.tags.forEach((tag) => {
      tags.forEach((resultTag) => {
        if (resultTag == tag._id) {
          tagsToCheck.push(tag);
        }
      });
    });

    let ret = [];

    tagsToCheck.forEach(async (tag) => {
      let tagpb = checkAndUpdatePb(
        tag.personalBests,
        undefined,
        mode,
        mode2,
        acc,
        consistency,
        difficulty,
        lazyMode,
        language,
        punctuation,
        rawWpm,
        wpm
      );
      if (tagpb.isPb) {
        ret.push(tag._id);
        await mongoDB()
          .collection("users")
          .updateOne(
            { uid, "tags._id": ObjectID(tag._id) },
            { $set: { "tags.$.personalBests": tagpb.obj } }
          );
      }
    });

    return ret;
  }

  static async resetPb(uid) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "reset pb");
    return await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $set: { personalBests: {} } });
  }

  static async updateTypingStats(uid, restartCount, timeTyping) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user)
      throw new MonkeyError(404, "User not found", "update typing stats");

    return await mongoDB()
      .collection("users")
      .updateOne(
        { uid },
        {
          $inc: {
            startedTests: restartCount + 1,
            completedTests: 1,
            timeTyping,
          },
        }
      );
  }

  static async linkDiscord(uid, discordId) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "link discord");
    return await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $set: { discordId } });
  }

  static async unlinkDiscord(uid) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user) throw new MonkeyError(404, "User not found", "unlink discord");
    return await mongoDB()
      .collection("users")
      .updateOne({ uid }, { $set: { discordId: null } });
  }

  static async incrementBananas(uid, wpm) {
    const user = await mongoDB().collection("users").findOne({ uid });
    if (!user)
      throw new MonkeyError(404, "User not found", "increment bananas");

    let best60;
    try {
      best60 = Math.max(...user.personalBests.time[60].map((best) => best.wpm));
    } catch (e) {
      best60 = undefined;
    }

    if (best60 === undefined || wpm >= best60 - best60 * 0.25) {
      //increment when no record found or wpm is within 25% of the record
      return await mongoDB()
        .collection("users")
        .updateOne({ uid }, { $inc: { bananas: 1 } });
    } else {
      return null;
    }
  }
}

module.exports = UsersDAO;
