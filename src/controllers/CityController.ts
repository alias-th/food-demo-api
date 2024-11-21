import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import City from "../models/City";

export class CityController {
  static async addCity(req: Request, res: Response, next: NextFunction) {
    const { name, lat, lng } = req.body;
    try {
      const city = await new City({ name, lat, lng }).save();
      res.send(city);
    } catch (error) {
      next(error);
    }
  }

  static async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const cities = await City.find({ status: "active" });
      res.send(cities);
    } catch (error) {
      next(error);
    }
  }
}
