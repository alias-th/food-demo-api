import { body, query } from "express-validator";
import User from "../models/User";
import { BadRequestError } from "../errors/BadRequestError";

export class UserValidators {
  static signup() {
    return [
      body("name", "Name is required").isString(),
      body("phone", "Phone is required").isString(),
      body("email", "Email is required")
        .isEmail()
        .custom(async (email) => {
          try {
            const user = await User.findOne({ email, type: "user" });
            if (user) {
              throw new BadRequestError("User Already Exists");
            }

            return true;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
          }
        }),
      body("password", "Password is required")
        .isAlphanumeric()
        .isLength({ min: 8, max: 25 }),
      body("status", "User status is required").isString(),
    ];
  }

  static verifyEmailToken() {
    return [
      body("verification_token", "Verification token is required").isNumeric(),
    ];
  }

  static login() {
    return [
      body("email", "Email is required")
        .isEmail()
        .custom(async (email, { req }) => {
          try {
            const user = await User.findOne({ email });
            if (!user) {
              throw new BadRequestError("User doesn't exists");
            }
            req.user = user;
            return true;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
          }
        }),
      body("password", "Password is required").isAlphanumeric(),
    ];
  }

  static checkResetPasswordEmail() {
    return [
      query("email", "Email is required")
        .isEmail()
        .custom(async (email) => {
          try {
            const user = await User.findOne({
              email,
              type: "user",
            });
            if (!user) {
              throw new BadRequestError("User doesn't exists");
            }
            return true;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
          }
        }),
    ];
  }

  static verifyResetPasswordToken() {
    return [
      query("email", "Email is required").isEmail(),
      query("reset_password_token,'Reset Password Token is required")
        .isString()
        .custom(async (reset_password_token, { req }) => {
          const { email } = req.body;
          try {
            const user = await User.findOne({
              email,
              reset_password_token,
              reset_password_token_time: { $gt: Date.now() },
            });

            if (!user) {
              throw new BadRequestError("User doesn't exists");
            }

            return true;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
          }
        }),
    ];
  }

  static resetPassword() {
    return [
      body("email", "Email is required")
        .isEmail()
        .custom(async (email, { req }) => {
          try {
            const user = await User.findOne({
              email,
            });

            if (!user) {
              throw new BadRequestError("User doesn't exists");
            }

            req.user = user;
            return true;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
          }
        }),
      body("new_password", "New Password is required")
        .isAlphanumeric()
        .isLength({ min: 8, max: 25 })
        .withMessage("Password must be between 8 and 25 characters long."),
      body("reset_password_token", "Reset password token is required")
        .isString()
        .custom((reset_password_token, { req }) => {
          if (req.user.reset_password_token !== reset_password_token) {
            throw new BadRequestError("Token is invalid");
          }
          return true;
        }),
    ];
  }

  static verifyPhoneNumber() {
    return [body("phone", "Phone is required").isString()];
  }

  static verifyUserProfile() {
    return [
      body("phone", "Phone is required").isString(),
      body("email", "Email is required")
        .isEmail()
        .custom(async (email) => {
          try {
            const user = await User.findOne({
              email: email,
            });

            if (user) {
              throw new BadRequestError(
                "A User with entered email already exist, please provide a unique email id"
              );
            }

            return true;
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
          }
        }),
      body("password", "Password is required").isAlphanumeric(),
    ];
  }

  static checkRefreshToken() {
    return [
      body("refreshToken", "Refresh token is required")
        .isString()
        .custom((refreshToken, { req }) => {
          if (refreshToken) {
            return true;
          } else {
            req.errorStatus = 403;
            // throw new Error('Access is forbidden');
            throw "Access is forbidden";
          }
        }),
    ];
  }
}
