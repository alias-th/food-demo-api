import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserValidators } from "../validators/UserValidators";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";

class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.patchRoutes();
    this.putRoutes();
    this.deleteRoutes();
  }

  getRoutes() {
    this.router.get(
      "/send/verification/email",
      GlobalMiddleware.auth,
      UserController.resendVerificationEmail
    );

    this.router.get(
      "/send/verification/password",
      UserValidators.checkResetPasswordEmail(),
      GlobalMiddleware.checkError,
      UserController.sendResetPasswordOtp
    );

    this.router.get(
      "/verify/resetPasswordToken",
      UserValidators.verifyResetPasswordToken(),
      GlobalMiddleware.checkError,
      UserController.verifyResetPasswordToken
    );

    this.router.get("/profile", GlobalMiddleware.auth, UserController.profile);
  }

  postRoutes() {
    this.router.post(
      "/login",
      UserValidators.login(),
      GlobalMiddleware.checkError,
      UserController.login
    );

    this.router.post(
      "/signup",
      UserValidators.signup(),
      GlobalMiddleware.checkError,
      UserController.signup
    );

    this.router.post(
      "/refresh_token",
      UserValidators.checkRefreshToken(),
      GlobalMiddleware.checkError,
      UserController.getNewTokens
    );
  }

  patchRoutes() {
    this.router.patch(
      "/verify/email",
      UserValidators.verifyEmailToken(),
      GlobalMiddleware.checkError,
      GlobalMiddleware.auth,
      UserController.verifyEmailToken
    );

    this.router.patch(
      "/reset/password",
      UserValidators.resetPassword(),
      GlobalMiddleware.checkError,
      UserController.resetPassword
    );

    this.router.patch(
      "/update/phone",
      GlobalMiddleware.auth,
      UserValidators.verifyPhoneNumber(),
      GlobalMiddleware.checkError,
      UserController.updatePhoneNumber
    );

    this.router.patch(
      "/update/profile",
      GlobalMiddleware.auth,
      UserValidators.verifyUserProfile(),
      GlobalMiddleware.checkError,
      UserController.updateUserProfile
    );
  }

  putRoutes() {}

  deleteRoutes() {}
}

export default new UserRouter().router;
