import { NextFunction, Request, Response } from "express";
import { Utils } from "../utils/Utils";
import User from "../models/User";
import Restaurant from "../models/Restaurant";
import Category from "../models/Category";

export class RestaurantController {
  static async addRestaurant(req: Request, res: Response, next: NextFunction) {
    const restaurant = req.body;
    const path = req.file?.path;
    const verification_token = Utils.generateVerificationToken();

    try {
      // create restaurant user
      const hash = await Utils.encryptPassword(restaurant.password);
      const user = await new User({
        email: restaurant.email,
        verification_token,
        verification_token_time: Date.now() + Utils.MAX_TOKEN_TIME,
        phone: restaurant.phone,
        password: hash,
        name: restaurant.name,
        type: "restaurant",
        status: "active",
      }).save();

      // create restaurant
      const restaurantDoc = await new Restaurant({
        name: restaurant.res_name,
        location: JSON.parse(restaurant.location),
        address: restaurant.address,
        openTime: restaurant.openTime,
        closeTime: restaurant.closeTime,
        status: restaurant.status,
        cuisines: JSON.parse(restaurant.cuisines),
        price: parseInt(restaurant.price),
        delivery_time: parseInt(restaurant.delivery_time),
        city_id: restaurant.city_id,
        user_id: user._id,
        cover: path,
        description: restaurant.description,
      }).save();

      // create categories
      if (restaurant.categories) {
        const categoriesData = JSON.parse(restaurant.categories).map(
          (x: string) => {
            return { name: x, restaurant_id: restaurantDoc._id };
          }
        );
        await Category.insertMany(categoriesData);
      }

      res.send(restaurantDoc);

      // send mail to restaurant user for verification
      // await NodeMailer.sendMail({
      //     to: [user.email],
      //     subject: 'Email Verification',
      //     html: `<h1>Your Otp is ${verification_token}</h1>`
      // });
    } catch (e) {
      next(e);
    }
  }

  static async getNearbyRestaurants(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // const METERS_PER_MILE = 1609.34;
    // const METERS_PER_KM = 1000;
    // const EARTH_RADIUS_IN_MILE = 3963.2;
    const EARTH_RADIUS_IN_KM = 6378.1;
    const data = req.query;
    const perPage = 10;
    const currentPage = parseInt(data.page as string) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage: number | null = currentPage + 1;
    try {
      const restaurants_count = await Restaurant.countDocuments({
        status: "active",
        location: {
          // $nearSphere: {
          //   $geometry: {
          //     type: "Point",
          //     coordinates: [parseFloat(data.lng), parseFloat(data.lat)],
          //   },
          //   $maxDistance: parseFloat(data.radius) * METERS_PER_KM,
          // },
          $geoWithin: {
            $centerSphere: [
              [parseFloat(data.lng as string), parseFloat(data.lat as string)],
              parseFloat(data.radius as string) / EARTH_RADIUS_IN_KM,
            ],
          },
        },
      });

      const totalPages = Math.ceil(restaurants_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }
      if (totalPages < currentPage) {
        // throw new Error('No more Orders available');
        throw "No more Restaurants available";
      }

      const restaurants = await Restaurant.find({
        status: "active",
        location: {
          // $nearSphere: {
          //     $geometry:
          //     {
          //         type: "Point",
          //         coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
          //     },
          //     $maxDistance: parseFloat(data.radius) * METERS_PER_KM
          // }
          $geoWithin: {
            $centerSphere: [
              [parseFloat(data.lng as string), parseFloat(data.lat as string)],
              parseFloat(data.radius as string) / EARTH_RADIUS_IN_KM,
            ],
          },
        },
      })
        .skip(currentPage * perPage - perPage)
        .limit(perPage);

      res.send(restaurants);
    } catch (e) {
      next(e);
    }
  }

  static async searchNearbyRestaurants(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // const METERS_PER_MILE = 1609.34;
    // const METERS_PER_KM = 1000;
    // const EARTH_RADIUS_IN_MILE = 3963.2;
    const EARTH_RADIUS_IN_KM = 6378.1;
    const data = req.query;
    try {
      const restaurants = await Restaurant.find({
        status: "active",
        name: { $regex: data.name, $options: "i" },
        location: {
          // $nearSphere: {
          //     $geometry:
          //     {
          //         type: "Point",
          //         coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
          //     },
          //     $maxDistance: parseFloat(data.radius) * METERS_PER_KM
          // }
          $geoWithin: {
            $centerSphere: [
              [parseFloat(data.lng as string), parseFloat(data.lat as string)],
              parseFloat(data.radius as string) / EARTH_RADIUS_IN_KM,
            ],
          },
        },
      });
      res.send(restaurants);
    } catch (e) {
      next(e);
    }
  }

  static async getRestaurants(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurants = await Restaurant.find({
        status: "active",
      });
      res.send(restaurants);
    } catch (e) {
      next(e);
    }
  }
}
