import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { RestaurantController } from "../controllers/RestaurantController";
import { Utils } from "../utils/Utils";
import { RestaurantValidators } from "../validators/RestaurantValidators";

class RestaurantRouter {
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
      "/getRestaurants",
      GlobalMiddleware.auth,
      GlobalMiddleware.role,
      RestaurantController.getRestaurants
    );
    this.router.get(
      "/nearbyRestaurants",
      GlobalMiddleware.auth,
      RestaurantValidators.getNearbyRestaurants(),
      GlobalMiddleware.checkError,
      RestaurantController.getNearbyRestaurants
    );
    this.router.get(
      "/searchNearbyRestaurants",
      GlobalMiddleware.auth,
      RestaurantValidators.searchNearbyRestaurants(),
      GlobalMiddleware.checkError,
      RestaurantController.searchNearbyRestaurants
    );
  }

  postRoutes() {
    this.router.post(
      "/create",
      GlobalMiddleware.auth,
      GlobalMiddleware.role,
      Utils.multer.single("restaurantImages"),
      RestaurantValidators.addRestaurant(),
      GlobalMiddleware.checkError,
      RestaurantController.addRestaurant
    );
  }

  patchRoutes() {}

  putRoutes() {}

  deleteRoutes() {}
}

export default new RestaurantRouter().router;
