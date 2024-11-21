import { NextFunction, Request, Response } from "express";
import Category from "../models/Category";

export class CategoryController {
  static async getCategoriesByRestaurant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const restaurant_id = req.params.restaurantId;
      const categories = await Category.find(
        { restaurant_id: restaurant_id },
        { __v: 0 }
      )
        .populate("restaurant_id")
        .exec();
      // .populate('restaurant_id').exec()
      res.send(categories);
    } catch (e) {
      next(e);
    }
  }
}
