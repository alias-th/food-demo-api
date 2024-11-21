import { NextFunction, Request, Response } from "express";
import Order from "../models/Order";
import Restaurant from "../models/Restaurant";
import { BadRequestError } from "../errors/BadRequestError";

export class OrderController {
  static async placeOrder(req: Request, res: Response, next: NextFunction) {
    const data = req.body;
    const user_id = req.user.id;

    try {
      const restaurant = await Restaurant.findById(data.restaurant_id);
      if (!restaurant) {
        throw new BadRequestError("Restaurant doesn't exist");
      }

      let orderData: any = {
        user_id,
        restaurant_id: data.restaurant_id,
        order: data.order,
        address: data.address,
        status: data.status,
        payment_status: data.payment_status,
        payment_mode: data.payment_mode,
        total: data.total,
        grandTotal: data.grandTotal,
        deliveryCharge: data.deliveryCharge,
      };
      if (data.instruction)
        orderData = { ...orderData, instruction: data.instruction };
      const order = await new Order(orderData).save();
      // delete order.user_id;
      // delete order.__v;
      const response_order = {
        restaurant_id: restaurant,
        address: order.address,
        order: order.order,
        instruction: order.instruction || null,
        grandTotal: order.grandTotal,
        total: order.total,
        deliveryCharge: order.deliveryCharge,
        status: order.status,
        payment_status: order.payment_status,
        payment_mode: order.payment_mode,
        created_at: order.created_at,
        updated_at: order.updated_at,
      };
      res.send(response_order);
    } catch (e) {
      next(e);
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    const user_id = req.user.id;
    const perPage = 5;
    const currentPage = parseInt(req.query.page as string) || 1;
    const prevPage = currentPage == 1 ? null : currentPage - 1;
    let nextPage: number | null = currentPage + 1;
    try {
      const orders_doc_count = await Order.countDocuments({ user_id: user_id });
      const totalPages = Math.ceil(orders_doc_count / perPage);
      if (totalPages == 0 || totalPages == currentPage) {
        nextPage = null;
      }
      if (totalPages < currentPage) {
        // throw new Error('No more Orders available');
        throw "No more Orders available";
      }
      const orders = await Order.find({ user_id }, { user_id: 0, __v: 0 })
        .skip(perPage * currentPage - perPage)
        .limit(perPage)
        .sort({ created_at: -1 })
        .populate("restaurant_id")
        .exec();
      // res.send(orders);
      res.json({
        orders,
        perPage,
        currentPage,
        prevPage,
        nextPage,
        totalPages,
        // totalRecords: orders_doc_count
      });
    } catch (e) {
      next(e);
    }
  }
}
