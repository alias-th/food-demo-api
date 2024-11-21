import { Router } from "express";
import { AddressController } from "../controllers/AddressController";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { AddressValidators } from "../validators/AddressValidators";

class AddressRouter {
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
      "/userAddresses",
      GlobalMiddleware.auth,
      AddressController.getUserAddresses
    );
    this.router.get(
      "/checkAddress",
      GlobalMiddleware.auth,
      AddressValidators.checkAddress(),
      GlobalMiddleware.checkError,
      AddressController.checkAddress
    );
    this.router.get(
      "/getUserLimitedAddresses",
      GlobalMiddleware.auth,
      AddressValidators.getUserLimitedAddresses(),
      GlobalMiddleware.checkError,
      AddressController.getUserLimitedAddresses
    );
    // this.router.get('/:id', GlobalMiddleware.auth, AddressController.getAddressById);
  }

  postRoutes() {
    this.router.post(
      "/create",
      GlobalMiddleware.auth,
      AddressValidators.addAddress(),
      GlobalMiddleware.checkError,
      AddressController.addAddress
    );
  }

  patchRoutes() {
    this.router.patch(
      "/edit/:id",
      GlobalMiddleware.auth,
      AddressValidators.editAddress(),
      GlobalMiddleware.checkError,
      AddressController.editAddress
    );
  }

  putRoutes() {
    this.router.put(
      "/edit/:id",
      GlobalMiddleware.auth,
      AddressValidators.editAddress(),
      GlobalMiddleware.checkError,
      AddressController.editAddress
    );
  }

  deleteRoutes() {
    this.router.delete(
      "/delete/:id",
      GlobalMiddleware.auth,
      AddressController.deleteAddress
    );
  }
}

export default new AddressRouter().router;
