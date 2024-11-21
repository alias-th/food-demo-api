import { body } from "express-validator";
import { BadRequestError } from "../errors/BadRequestError";

export class BannerValidators {
  static checkAddBanner() {
    return [
      body("banner", "Banner image is required").custom((banner, { req }) => {
        if (!req.file) {
          throw new BadRequestError("File not uploaded");
        }
        return true;
      }),
    ];
  }
}
