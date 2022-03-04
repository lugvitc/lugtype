import { Response } from "express";
import { isCustomCode } from "../constants/monkey-status-codes";

export class MonkeyResponse {
  message: string;
  data: any;
  status: number;

  constructor(message?: string, data?: any, status = 200) {
    this.message = message ?? "ok";
    this.data = data ?? null;
    this.status = status;
  }
}

export function handleMonkeyResponse(
  monkeyResponse: MonkeyResponse,
  res: Response
): void {
  const { message, data, status } = monkeyResponse;

  res.status(status);
  if (isCustomCode(status)) {
    res.statusMessage = message;
  }

  //@ts-ignore ignored so that we can see message in swagger stats
  res.monkeyMessage = message;
  if ([301, 302].includes(status)) {
    return res.redirect(data);
  }

  res.json({ message, data });
}
