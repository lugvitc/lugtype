import { Response } from "express";
import { isCustomCode } from "../constants/monkey-status-codes";

export class MonkeyResponse<DataType> {
  message: string;
  data: DataType;
  status: number;

  constructor(message: string, data: DataType, status = 200) {
    this.message = message ?? "ok";
    this.data = data;
    this.status = status;
  }
}

export function handleMonkeyResponse<DataType = unknown>(
  monkeyResponse: MonkeyResponse<DataType>,
  res: Response
): void {
  const { message, data, status } = monkeyResponse;

  res.status(status);
  if (isCustomCode(status)) {
    res.statusMessage = message;
  }

  //@ts-expect-error ignored so that we can see message in swagger stats
  res.monkeyMessage = message;
  if ([301, 302].includes(status)) {
    //@ts-expect-error TODO FIND OUT WHY THIS IS USING DATA????
    return res.redirect(data);
  }

  res.json({ message, data });
}
