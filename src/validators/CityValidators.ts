import { body } from "express-validator";

export class CityValidators {
  static addCity() {
    return [
      body("name", "City name is required").isString(),
      body("lat", "Lat name is required").isNumeric(),
      body("lng", "Lng name is required").isNumeric(),
    ];
  }
}
