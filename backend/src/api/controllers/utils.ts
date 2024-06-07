import { omit } from "lodash";
export function convertId<T extends { _id: string }>(
  db: MonkeyTypes.WithObjectId<T>
): T {
  return { ...omit(db, "_id"), _id: db._id.toString() } as unknown as T;
}
