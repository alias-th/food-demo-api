import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import { Utils } from "../utils/Utils";
import { NodeMailer } from "../utils/NodeMailer";
import { BadRequestError } from "../errors/BadRequestError";

export class UserController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    const { name, email, status, phone, email_verified, password } = req.body;

    const otp = Utils.generateVerificationToken();
    try {
      const hashedPassword = await Utils.encryptPassword(password);
      const user = await new User({
        name,
        email,
        password: hashedPassword,
        status,
        phone,
        email_verified,
        verification_token: otp,
        verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
      }).save();

      const access_token = Utils.jwtSign({
        user_id: user.id,
        email: user.email,
        type: user.type,
      });

      const refresh_token = Utils.jwtSignRefreshToken({
        user_id: user.id,
        email: user.email,
        type: user.type,
      });

      res.status(200).json({
        token: access_token,
        refresh_token,
        user,
      });

      await NodeMailer.sendMail({
        to: [user.email],
        html: `<h1>Your OTP is ${otp} </h1>`,
        subject: "test OTP",
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmailToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { verification_token } = req.body;
    const { email } = req.user;

    try {
      const user = await User.findOneAndUpdate(
        {
          email,
          verification_token,
          verification_token_time: { $gt: Date.now() },
        },
        { email_verified: true, updated_at: new Date() },
        {
          new: true,
        }
      );

      if (!user) {
        throw new BadRequestError(
          "Email verification token is expired. Please try again!"
        );
      }

      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const verification_token = Utils.generateVerificationToken();
    const { email } = user;

    try {
      const user = await User.findOneAndUpdate(
        {
          email,
        },
        {
          updated_at: new Date(),
          verification_token,
          verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
        },
        {
          new: true,
        }
      );

      if (!user) {
        throw new BadRequestError("User doesn't exist");
      }
      res.status(200).json({ message: "success" });

      await NodeMailer.sendMail({
        to: [user.email],
        html: `<h1>Your OTP is ${verification_token} </h1>`,
        subject: "test OTP",
      });
    } catch (error) {
      console.log(error);

      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    const { password } = req.body;
    const user = req.user;
    const encrypt_password = user.password;

    try {
      await Utils.comparePassword({ password, encrypt_password });

      const access_token = Utils.jwtSign({
        user_id: user.id,
        email: user.email,
        type: user.type,
      });

      const refresh_token = Utils.jwtSignRefreshToken({
        user_id: user.id,
        email: user.email,
        type: user.type,
      });

      res.json({
        token: access_token,
        refresh_token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendResetPasswordOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reset_password_token = Utils.generateVerificationToken();
    const { email } = req.query;

    try {
      const user = await User.findOneAndUpdate(
        {
          email,
        },
        {
          updated_at: new Date(),
          reset_password_token,
          reset_password_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
        },
        {
          new: true,
        }
      );

      if (!user) {
        throw new BadRequestError("User doesn't exist");
      }

      res.status(200).json({ message: "success" });

      await NodeMailer.sendMail({
        to: [user.email],
        html: `<h1>Your OTP is ${reset_password_token} </h1>`,
        subject: "reset password OTP",
      });
    } catch (error) {
      next(error);
    }
  }

  static verifyResetPasswordToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.json({ message: "success" });
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;
    const { new_password } = req.body;

    try {
      const encrypt_password = await Utils.encryptPassword(new_password);

      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { password: encrypt_password },
        {
          new: true,
        }
      );

      if (!updatedUser) {
        throw new BadRequestError("User doesn't exist");
      }

      res.json({ message: "success" });
    } catch (error) {
      next(error);
    }
  }

  static async profile(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;
    try {
      const user = await User.findById(id);

      if (!user) {
        throw new BadRequestError("User doesn't exist");
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updatePhoneNumber(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const phone = req.body.phone;
    try {
      const userData = await User.findByIdAndUpdate(
        user.id,
        { phone: phone, updated_at: new Date() },
        { new: true }
      );
      res.send(userData);
    } catch (e) {
      next(e);
    }
  }

  static async updateUserProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const phone = req.body.phone;
    const new_email = req.body.email;
    const plain_password = req.body.password;
    const verification_token = Utils.generateVerificationToken();
    try {
      const userData = await User.findById(user.id);
      if (!userData) throw new BadRequestError("User doesn't exist");

      await Utils.comparePassword({
        password: plain_password,
        encrypt_password: userData.password,
      });

      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        {
          phone: phone,
          email: new_email,
          email_verified: false,
          verification_token,
          verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
          updated_at: new Date(),
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new BadRequestError("User can't not update");
      }

      const access_token = Utils.jwtSign({
        user_id: updatedUser.id,
        email: updatedUser.email,
        type: updatedUser.type,
      });

      const refresh_token = Utils.jwtSignRefreshToken({
        user_id: updatedUser.id,
        email: updatedUser.email,
        type: updatedUser.type,
      });

      res.json({
        token: access_token,
        refresh_token,
        user: updatedUser,
      });

      // send email to user for updated email verification
      await NodeMailer.sendMail({
        to: [updatedUser.email],
        subject: "Email Verification",
        html: `<h1>Your Otp is ${verification_token}</h1>`,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getNewTokens(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.body.refreshToken;
    try {
      const decoded_data = await Utils.jwtVerifyRefreshToken(refreshToken);
      if (decoded_data) {
        const access_token = Utils.jwtSign({
          email: decoded_data.email,
          type: decoded_data.type,
          user_id: decoded_data.aud,
        });

        const refresh_token = Utils.jwtSignRefreshToken({
          email: decoded_data.email,
          type: decoded_data.type,
          user_id: decoded_data.aud,
        });

        res.json({
          token: access_token,
          refresh_token,
        });
      } else {
        req.errorStatus = 403;
        // throw new Error('Access is forbidden');
        throw "Access is forbidden";
      }
    } catch (e) {
      req.errorStatus = 403;
      next(e);
    }
  }
}
