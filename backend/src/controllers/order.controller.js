import { createOrder, getMyOrders, getOrderById } from "../services/order.service.js";

export const createOrderController = async (req, res, next) => {
  try {
    const order = await createOrder(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyOrdersController = async (req, res, next) => {
  try {
    const orders = await getMyOrders(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      data: {
        orders,
        count: orders.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrderByIdController = async (req, res, next) => {
  try {
    const order = await getOrderById(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully.",
      data: { order },
    });
  } catch (error) {
    return next(error);
  }
};
