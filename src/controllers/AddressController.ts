import { NextFunction, Request, Response } from "express";
import Address from "../models/Address";
import { BadRequestError } from "../errors/BadRequestError";

export class AddressController {
  static async addAddress(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    const user_id = req.user.id;
    try {
      const addressData = {
        user_id,
        title: data.title,
        address: data.address,
        landmark: data.landmark,
        house: data.house,
        lat: data.lat,
        lng: data.lng,
      };
      const address = await new Address(addressData).save();
      // delete address.user_id;
      // delete address.__v;
      const response_address = {
        title: address.title,
        address: address.address,
        landmark: address.landmark,
        house: address.house,
        lat: address.lat,
        lng: address.lng,
        created_at: address.created_at,
        updated_at: address.updated_at,
      };
      res.send(response_address);
    } catch (e) {
      next(e);
    }
  }

  static async getUserAddresses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user_id = req.user.id;
    const perPage = 5;
    const currentPage = parseInt(req.query.page as string) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage: number | null = currentPage + 1;
    try {
      const address_doc_count = await Address.countDocuments({
        user_id: user_id,
      });
      const totalPages = Math.ceil(address_doc_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }
      if (totalPages < currentPage) {
        throw new BadRequestError("No more Addresses available");
      }
      const addresses = await Address.find({ user_id }, { user_id: 0, __v: 0 })
        .skip(currentPage * perPage - perPage)
        .limit(perPage);
      // res.send(addresses);
      res.json({
        addresses,
        perPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
        // totalRecords: address_doc_count
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserLimitedAddresses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user_id = req.user.id;
    const limit = req.query.limit as string;
    try {
      const addresses = await Address.find(
        { user_id },
        { user_id: 0, __v: 0 }
      ).limit(parseInt(limit));
      res.send(addresses);
    } catch (e) {
      next(e);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    const user_id = req.user.id;
    const id = req.params.id;
    try {
      await Address.findOneAndDelete({
        user_id: user_id,
        _id: id,
      });
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }

  static async getAddressById(req: Request, res: Response, next: NextFunction) {
    const user_id = req.user.id;
    const id = req.params.id;
    try {
      const address = await Address.findOne(
        {
          user_id: user_id,
          _id: id,
        },
        { user_id: 0, __v: 0 }
      );
      res.send(address);
    } catch (e) {
      next(e);
    }
  }

  static async editAddress(req: Request, res: Response, next: NextFunction) {
    const user_id = req.user.id;
    const id = req.params.id;
    const data = req.body;
    try {
      const address = await Address.findOneAndUpdate(
        {
          user_id: user_id,
          _id: id,
        },
        {
          title: data.title,
          address: data.address,
          landmark: data.landmark,
          house: data.house,
          lat: data.lat,
          lng: data.lng,
          updated_at: new Date(),
        },
        { new: true, projection: { user_id: 0, __v: 0 } }
      );
      if (address) {
        res.send(address);
      } else {
        // throw new Error('Address doesn\'t exist');
        throw "Address doesn't exist";
      }
    } catch (e) {
      next(e);
    }
  }

  static async checkAddress(req: Request, res: Response, next: NextFunction) {
    const user_id = req.user.id;
    const data = req.query;
    try {
      const address = await Address.findOne(
        { user_id, lat: data.lat, lng: data.lng },
        { user_id: 0, __v: 0 }
      );
      res.send(address);
    } catch (e) {
      next(e);
    }
  }
}
