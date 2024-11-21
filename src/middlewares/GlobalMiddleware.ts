import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/RequestValidationError";
import { Utils } from "../utils/Utils";
import User from "../models/User";
import { NotAuthorizedError } from "../errors/NotAuthorizedError";
import { UserType } from "../enums/UserType";

export class GlobalMiddleware {
  static checkError(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    next();
  }

  static async auth(req: Request, res: Response, next: NextFunction) {
    const header_auth = req.headers.authorization;
    const token = header_auth ? header_auth.slice(7, header_auth.length) : null;

    try {
      const decoded = await Utils.jwtVerify(token);
      console.log(decoded);

      if (typeof decoded === "object") {
        const user = await User.findById(decoded.aud);
        if (!user) {
          throw new NotAuthorizedError();
        }

        req.user = user;
      }
      next();
    } catch (error) {
      next(new NotAuthorizedError());
    }
  }

  static role(req: Request, res: Response, next: NextFunction) {
    const { type } = req.user;

    if (UserType[type] !== UserType.admin) {
      throw new NotAuthorizedError();
    }

    next();
  }
}
