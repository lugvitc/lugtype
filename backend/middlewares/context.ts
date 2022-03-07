import ConfigurationClient from "../init/configuration";
import { Response, NextFunction } from "express";

async function contextMiddleware(
  req: MonkeyTypes.Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const configuration = await ConfigurationClient.getCachedConfiguration(true);

  req.ctx = {
    configuration,
    decodedToken: {
      uid: "",
      email: "",
    },
  };

  next();
}

export default contextMiddleware;
