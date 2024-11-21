import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import mongoose from "mongoose";
import UserRouter from "./routes/UserRouter";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { CustomError } from "./errors/CustomError";
import { NotFoundError } from "./errors/NotFoundError";
import { UserDoc } from "./models/User";
import BannerRouter from "./routes/BannerRouter";
import CityRouter from "./routes/CityRouter";
import RestaurantRouter from "./routes/RestaurantRouter";
import CategoryRouter from "./routes/CategoryRouter";
import ItemRouter from "./routes/ItemRouter";
import AddressRouter from "./routes/AddressRouter";
import OrderRouter from "./routes/OrderRouter";

declare global {
  namespace Express {
    interface Request {
      errorStatus: number;
      user: UserDoc;
    }

    interface ErrorRequestHandler {
      message: string;
    }
  }
}

declare module "jsonwebtoken" {
  export interface JwtPayload {
    email: string;
  }
}

export class Server {
  public app;

  constructor() {
    this.app = express();
    this.setConfigs();
    this.setRoutes();
    this.error404Handler();
    this.handleErrors();
  }

  setConfigs() {
    this.dotEnvConfig();
    this.connectMongoDB();
    this.allowCors();
    this.configureBodyParser();
  }

  dotEnvConfig() {
    dotenv.config();
  }

  configureBodyParser() {
    this.app.use(bodyParser.json());
  }

  async connectMongoDB() {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI must be defined");
    }

    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to mongodb");
    } catch (error) {
      console.log(error);
    }
  }

  setRoutes() {
    this.app.use("/src/uploads", express.static("src/uploads"));
    this.app.use("/api/user", UserRouter);
    this.app.use("/api/banner", BannerRouter);
    this.app.use("/api/city", CityRouter);
    this.app.use("/api/restaurant", RestaurantRouter);
    this.app.use("/api/category", CategoryRouter);
    this.app.use("/api/item", ItemRouter);
    this.app.use("/api/address", AddressRouter);
    this.app.use("/api/order", OrderRouter);
  }

  error404Handler() {
    this.app.use((req, res) => {
      throw new NotFoundError();
    });
  }

  handleErrors() {
    this.app.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof CustomError) {
          res
            .status(error.statusCode)
            .send({ errors: error.serializeErrors() });
          return;
        }

        console.error(error);

        res.status(400).send({
          errors: [{ message: "Something went wrong" }],
        });
      }
    );
  }

  allowCors() {
    this.app.use(cors());
  }
}
