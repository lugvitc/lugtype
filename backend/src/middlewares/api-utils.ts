import _ from "lodash";
import joi from "joi";
import MonkeyError from "../utils/error";
import { Response, NextFunction, RequestHandler } from "express";
import { handleMonkeyResponse, MonkeyResponse } from "../utils/monkey-response";
import { getUser } from "../dal/user";
import { isAdmin } from "../dal/admin-uids";
import { isDevEnvironment } from "../utils/misc";

type ValidationOptions<T> = {
  criteria: (data: T) => boolean;
  invalidMessage?: string;
};

const emptyMiddleware = (
  _req: MonkeyTypes.Request,
  _res: Response,
  next: NextFunction
): void => next();

/**
 * This utility checks that the server's configuration matches
 * the criteria.
 */
function validateConfiguration(
  options: ValidationOptions<SharedTypes.Configuration>
): RequestHandler {
  const {
    criteria,
    invalidMessage = "This service is currently unavailable.",
  } = options;

  return (req: MonkeyTypes.Request, _res: Response, next: NextFunction) => {
    const configuration = req.ctx.configuration;

    const validated = criteria(configuration);
    if (!validated) {
      throw new MonkeyError(503, invalidMessage);
    }

    next();
  };
}

/**
 * Check if the user is an admin before handling request.
 * Note that this middleware must be used after authentication in the middleware stack.
 */
function checkIfUserIsAdmin(): RequestHandler {
  return async (
    req: MonkeyTypes.Request,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      const { uid } = req.ctx.decodedToken;
      const admin = await isAdmin(uid);

      if (!admin) {
        throw new MonkeyError(403, "You don't have permission to do this.");
      }
    } catch (error) {
      next(error);
    }

    next();
  };
}

/**
 * Check user permissions before handling request.
 * Note that this middleware must be used after authentication in the middleware stack.
 */
function checkUserPermissions(
  options: ValidationOptions<MonkeyTypes.DBUser>
): RequestHandler {
  const { criteria, invalidMessage = "You don't have permission to do this." } =
    options;

  return async (
    req: MonkeyTypes.Request,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      const { uid } = req.ctx.decodedToken;

      const userData = await getUser(uid, "check user permissions");
      const hasPermission = criteria(userData);

      if (!hasPermission) {
        throw new MonkeyError(403, invalidMessage);
      }
    } catch (error) {
      next(error);
    }

    next();
  };
}

type AsyncHandler = (
  req: MonkeyTypes.Request,
  res?: Response
) => Promise<MonkeyResponse>;

/**
 * This utility serves as an alternative to wrapping express handlers with try/catch statements.
 * Any routes that use an async handler function should wrap the handler with this function.
 * Without this, any errors thrown will not be caught by the error handling middleware, and
 * the app will hang!
 */
function asyncHandler(handler: AsyncHandler): RequestHandler {
  return async (
    req: MonkeyTypes.Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const handlerData = await handler(req, res);
      return handleMonkeyResponse(handlerData, res);
    } catch (error) {
      next(error);
    }
  };
}

type ValidationSchema = {
  body?: object;
  query?: object;
  params?: object;
  headers?: object;
};

type ValidationSchemaOption = {
  allowUnknown?: boolean;
};

type ValidationHandlingOptions = {
  validationErrorMessage?: string;
};

type ValidationSchemaOptions = {
  [schema in keyof ValidationSchema]?: ValidationSchemaOption;
} & ValidationHandlingOptions;

const VALIDATION_SCHEMA_DEFAULT_OPTIONS: ValidationSchemaOptions = {
  body: { allowUnknown: false },
  headers: { allowUnknown: true },
  params: { allowUnknown: false },
  query: { allowUnknown: false },
};

function validateRequest(
  validationSchema: ValidationSchema,
  validationOptions: ValidationSchemaOptions = VALIDATION_SCHEMA_DEFAULT_OPTIONS
): RequestHandler {
  const options = {
    ...VALIDATION_SCHEMA_DEFAULT_OPTIONS,
    ...validationOptions,
  };
  const { validationErrorMessage } = options;
  const normalizedValidationSchema: ValidationSchema = _.omit(
    validationSchema,
    "validationErrorMessage"
  );

  return (req: MonkeyTypes.Request, _res: Response, next: NextFunction) => {
    _.each(
      normalizedValidationSchema,
      (schema: object, key: keyof ValidationSchema) => {
        const joiSchema = joi
          .object()
          .keys(schema)
          .unknown(options[key]?.allowUnknown);

        const { error } = joiSchema.validate(req[key] ?? {});
        if (error) {
          const errorMessage = error.details[0]?.message;
          throw new MonkeyError(
            422,
            validationErrorMessage ??
              `${errorMessage} (${error.details[0]?.context?.value})`
          );
        }
      }
    );

    next();
  };
}

/**
 * Uses the middlewares only in production. Otherwise, uses an empty middleware.
 */
function useInProduction(middlewares: RequestHandler[]): RequestHandler[] {
  return middlewares.map((middleware) =>
    isDevEnvironment() ? emptyMiddleware : middleware
  );
}

export {
  validateConfiguration,
  checkUserPermissions,
  checkIfUserIsAdmin,
  asyncHandler,
  validateRequest,
  useInProduction,
};
