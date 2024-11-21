import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import Banner from "../models/Banner";

export class BannerController {
  static async addBanner(req: Request, res: Response, next: NextFunction) {
    const path = req.file?.path;
    if (!path) {
      throw new BadRequestError("Not have a file path");
    }
    try {
      const banner = await new Banner({ banner: path }).save();
      res.send(banner);
    } catch (error) {
      next(error);
    }
  }

  static async getBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await Banner.find({ status: true });
      res.send(banners);
    } catch (e) {
      next(e);
    }
  }
}
