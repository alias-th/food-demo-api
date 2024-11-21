import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/BadRequestError";
import { NotAuthorizedError } from "../errors/NotAuthorizedError";
import multer from "multer";
import * as Crypto from "crypto";

const storageOptions = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/" + file.fieldname);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export class Utils {
  static MAX_TOKEN_TIME = 5 * 60 * 1000;

  static multer = multer({
    storage: storageOptions,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  static generateVerificationToken(digit: number = 6) {
    let otp = "";
    for (let i = 0; i < digit; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    // return parseInt(otp);
    return otp;
  }

  static encryptPassword(password: string) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (error, encrypted) => {
        if (error) {
          reject(error);
        } else {
          resolve(encrypted);
        }
      });
    });
  }

  static comparePassword(data: { password: string; encrypt_password: string }) {
    const { password, encrypt_password } = data;

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, encrypt_password, (error, same) => {
        if (error) {
          reject(error);
        }
        if (!same) {
          reject(new BadRequestError("User and Password does't match"));
        }

        resolve(true);
      });
    });
  }

  static jwtSign(payload: { user_id: string; email: string; type: string }) {
    if (!process.env.JWT_SECRET) {
      throw new Error("Must have jwt secret!");
    }

    const { email, user_id, type } = payload;
    const token = jwt.sign(
      {
        type,
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "3000",
        audience: user_id,
        issuer: "test.com",
      }
    );

    return token;
  }

  static jwtVerify(token: string | null): Promise<string | jwt.JwtPayload> {
    return new Promise((resolve, reject) => {
      if (!process.env.JWT_SECRET) {
        throw new Error("Must have jwt secret!");
      }
      if (!token) {
        throw new NotAuthorizedError();
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        }

        if (!decoded) {
          throw new NotAuthorizedError();
        }

        resolve(decoded);
      });
    });
  }

  static jwtSignRefreshToken({
    user_id,
    email,
    type,
  }: {
    user_id: string;
    email: string;
    type: string;
  }) {
    if (!process.env.JWT_SECRET) {
      throw new Error("Must have jwt secret!");
    }

    return jwt.sign({ email, type }, process.env.JWT_SECRET, {
      expiresIn: "1d",
      audience: user_id,
      issuer: "test.com",
    });
  }

  static jwtVerifyRefreshToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!process.env.JWT_SECRET) {
        throw new Error("Must have jwt secret!");
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        else if (!decoded) reject(new Error("User is not authorised."));
        else resolve(decoded);
      });
    });
  }

  private static gen_secret_key() {
    const DEV_access_token_secret_key = Crypto.randomBytes(32).toString("hex");
    const DEV_refresh_token_secret_key = Crypto.randomBytes(32).toString("hex");

    const PROD_access_token_secret_key = Crypto.randomBytes(32).toString("hex");
    const PROD_refresh_token_secret_key =
      Crypto.randomBytes(32).toString("hex");

    console.table({
      DEV_access_token_secret_key,
      DEV_refresh_token_secret_key,
      PROD_access_token_secret_key,
      PROD_refresh_token_secret_key,
    });
  }
}
