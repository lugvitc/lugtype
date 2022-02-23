import ConfigurationDAO from "../dao/configuration";
import { Response, NextFunction } from "express";

async function contextMiddleware(
  req: MonkeyTypes.Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const configuration = await ConfigurationDAO.getCachedConfiguration(true);

  req.ctx = {
    configuration,
    decodedToken: {
      uid: null,
      email: null,
    },
  };

  next();
}

export default contextMiddleware;
