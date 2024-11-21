import { Router } from "express";
import { CityController } from "../controllers/CityController";
import { CityValidators } from "../validators/CityValidators";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";

class CityRouter {
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
    this.router.get("/cities", GlobalMiddleware.auth, CityController.getCities);
  }

  postRoutes() {
    this.router.post(
      "/add",
      CityValidators.addCity(),
      GlobalMiddleware.checkError,
      CityController.addCity
    );
  }

  patchRoutes() {}

  putRoutes() {}

  deleteRoutes() {}
}

export default new CityRouter().router;
