import _ from "lodash";
import { DeleteResult, ObjectId, UpdateResult } from "mongodb";
import MonkeyError from "../utils/error";
import * as db from "../init/db";

import { getUser, getTags } from "./user";

type DBResult = MonkeyTypes.WithObjectId<
  SharedTypes.DBResult<SharedTypes.Config.Mode>
>;

export async function addResult(
  uid: string,
  result: DBResult
): Promise<{ insertedId: ObjectId }> {
  let user: MonkeyTypes.DBUser | null = null;
  try {
    user = await getUser(uid, "add result");
  } catch (e) {
    user = null;
  }
  if (!user) throw new MonkeyError(404, "User not found", "add result");
  if (result.uid === undefined) result.uid = uid;
  // result.ir = true;
  const res = await db.collection<DBResult>("results").insertOne(result);
  return {
    insertedId: res.insertedId,
  };
}

export async function deleteAll(uid: string): Promise<DeleteResult> {
  return await db.collection<DBResult>("results").deleteMany({ uid });
}

export async function updateTags(
  uid: string,
  resultId: string,
  tags: string[]
): Promise<UpdateResult> {
  const result = await db
    .collection<DBResult>("results")
    .findOne({ _id: new ObjectId(resultId), uid });
  if (!result) throw new MonkeyError(404, "Result not found");
  const userTags = await getTags(uid);
  const userTagIds = userTags.map((tag) => tag._id.toString());
  let validTags = true;
  tags.forEach((tagId) => {
    if (!userTagIds.includes(tagId)) validTags = false;
  });
  if (!validTags) {
    throw new MonkeyError(422, "One of the tag id's is not valid");
  }
  return await db
    .collection<DBResult>("results")
    .updateOne({ _id: new ObjectId(resultId), uid }, { $set: { tags } });
}

export async function getResult(uid: string, id: string): Promise<DBResult> {
  const result = await db
    .collection<DBResult>("results")
    .findOne({ _id: new ObjectId(id), uid });
  if (!result) throw new MonkeyError(404, "Result not found");
  return result;
}

export async function getLastResult(
  uid: string
): Promise<Omit<DBResult, "uid">> {
  const [lastResult] = await db
    .collection<DBResult>("results")
    .find({ uid })
    .sort({ timestamp: -1 })
    .limit(1)
    .toArray();
  if (!lastResult) throw new MonkeyError(404, "No results found");
  return _.omit(lastResult, "uid");
}

export async function getResultByTimestamp(
  uid: string,
  timestamp
): Promise<DBResult | null> {
  return await db.collection<DBResult>("results").findOne({ uid, timestamp });
}

type GetResultsOpts = {
  onOrAfterTimestamp?: number;
  limit?: number;
  offset?: number;
};

export async function getResults(
  uid: string,
  opts?: GetResultsOpts
): Promise<DBResult[]> {
  const { onOrAfterTimestamp, offset, limit } = opts ?? {};
  let query = db
    .collection<DBResult>("results")
    .find({
      uid,
      ...(!_.isNil(onOrAfterTimestamp) &&
        !_.isNaN(onOrAfterTimestamp) && {
          timestamp: { $gte: onOrAfterTimestamp },
        }),
    })
    .sort({ timestamp: -1 });

  if (limit !== undefined) {
    query = query.limit(limit);
  }
  if (offset !== undefined) {
    query = query.skip(offset);
  }

  const results = await query.toArray();
  if (results === undefined) throw new MonkeyError(404, "Result not found");
  return results;
}
