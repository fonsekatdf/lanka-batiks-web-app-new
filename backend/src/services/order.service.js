import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    throw createError("A shipping address is required.", 400);
  }

  const requiredFields = ["fullName", "phone", "addressLine1", "city"];

  for (const field of requiredFields) {
    if (typeof address[field] !== "string" || !address[field].trim()) {
      throw createError(`Shipping address field '${field}' is required.`, 400);
    }
  }

  return {
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    addressLine1: address.addressLine1.trim(),
    addressLine2:
      typeof address.addressLine2 === "string"
        ? address.addressLine2.trim()
        : "",
    city: address.city.trim(),
    postalCode:
      typeof address.postalCode === "string" ? address.postalCode.trim() : "",
  };
};

export const createOrder = async (userId, data) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID.", 400);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createError("Invalid order request.", 400);
  }

  if (
    data.paymentMethod !== undefined &&
    data.paymentMethod !== "cash_on_delivery"
  ) {
    throw createError("The selected payment method is not supported.", 400);
  }

  const shippingAddress = validateShippingAddress(data.shippingAddress);

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw createError("Your order must contain at least one product.", 400);
  }

  if (data.items.length > 50) {
    throw createError(
      "An order cannot contain more than 50 product entries.",
      400,
    );
  }

  // Validate the complete cart before changing inventory.
  const requestedItems = data.items.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw createError("Invalid order item.", 400);
    }

    const { productId, quantity } = item;

    if (typeof productId !== "string" || !/^[a-fA-F0-9]{24}$/.test(productId)) {
      throw createError("An order contains an invalid product ID.", 400);
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw createError(
        "Product quantities must be positive whole numbers.",
        400,
      );
    }

    if (quantity > 1000) {
      throw createError("The requested quantity is too large.", 400);
    }

    return {
      productId,
      quantity,
    };
  });

  // Reject duplicate product IDs to avoid ambiguous inventory updates.
  const uniqueIds = new Set(
    requestedItems.map((item) => item.productId.toLowerCase()),
  );

  if (uniqueIds.size !== requestedItems.length) {
    throw createError("Each product must appear only once in the order.", 400);
  }

  const products = await Product.find({
    _id: {
      $in: requestedItems.map((item) => item.productId),
    },
  });

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  // Build order snapshots using trusted database values.
  const orderItems = requestedItems.map(({ productId, quantity }) => {
    const product = productMap.get(productId);

    if (!product) {
      throw createError(`Product '${productId}' was not found.`, 404);
    }

    if (!Number.isFinite(product.price) || product.price < 0) {
      throw createError(`Product '${product.name}' has an invalid price.`, 500);
    }

    const unitPriceCents = Math.round(product.price * 100);
    const lineTotalCents = unitPriceCents * quantity;

    if (!Number.isSafeInteger(lineTotalCents)) {
      throw createError("The order total is too large.", 400);
    }

    return {
      productId,
      quantity,
      product,
      unitPriceCents,
      lineTotalCents,
    };
  });

  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0,
  );

  if (!Number.isSafeInteger(subtotalCents)) {
    throw createError("The order total is too large.", 400);
  }

  const savedItems = orderItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0] ?? "",
    unitPrice: item.unitPriceCents / 100,
    quantity: item.quantity,
    lineTotal: item.lineTotalCents / 100,
  }));

  const deductedStock = [];

  try {
    // Atomically deduct stock. The stock and price conditions protect
    // against overselling and a price change since products were fetched.
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          stock: { $gte: item.quantity },
          price: item.product.price,
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedProduct) {
        throw createError(
          `Product '${item.product.name}' is out of stock, has insufficient stock, or its price changed. Please refresh your cart.`,
          409,
        );
      }

      deductedStock.push({
        productId: item.product._id,
        quantity: item.quantity,
      });
    }

    const [order] = await Order.create([
      {
        user: userId,
        items: savedItems,
        shippingAddress,
        subtotal: subtotalCents / 100,
        total: subtotalCents / 100,
        paymentMethod: "cash_on_delivery",
        paymentStatus: "pending",
        status: "pending",
      },
    ]);

    return order;
  } catch (error) {
    // Compensate for stock deductions if order creation fails.
    const rollbackErrors = [];

    for (const item of [...deductedStock].reverse()) {
      try {
        const restoredProduct = await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
        );

        if (restoredProduct.matchedCount !== 1) {
          rollbackErrors.push(
            `Could not restore stock for product ${item.productId}.`,
          );
        }
      } catch {
        rollbackErrors.push(
          `Could not restore stock for product ${item.productId}.`,
        );
      }
    }

    if (rollbackErrors.length > 0) {
      console.error("Order stock rollback failed:", rollbackErrors);
      throw createError(
        "The order could not be completed, and inventory restoration requires administrator attention.",
        500,
      );
    }

    throw error;
  }
};

export const getMyOrders = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID.", 400);
  }

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  return orders;
};

export const getOrderById = async (userId, orderId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid customer ID.", 400);
  }

  if (typeof orderId !== "string" || !mongoose.isValidObjectId(orderId)) {
    throw createError("Invalid order ID.", 400);
  }

  // Include the authenticated customer in the query.
  // This prevents customers from accessing other customers' orders.
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).lean();

  if (!order) {
    throw createError("Order not found.", 404);
  }

  return order;
};

const ALLOWED_ORDER_TRANSITIONS = {
  pending: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const getAllOrders = async () => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return orders;
};

export const updateOrderStatus = async (orderId, nextStatus) => {
  if (typeof orderId !== "string" || !mongoose.isValidObjectId(orderId)) {
    throw createError("Invalid order ID.", 400);
  }

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  if (typeof nextStatus !== "string" || !validStatuses.includes(nextStatus)) {
    throw createError(
      "Invalid status. Choose a supported fulfillment status.",
      400,
    );
  }

  const currentOrder = await Order.findById(orderId).lean();

  if (!currentOrder) {
    throw createError("Order not found.", 404);
  }

  // Repeating the current status is safe and idempotent.
  if (currentOrder.status === nextStatus) {
    return await Order.findById(orderId).populate("user", "name email").lean();
  }

  const allowedTransitions =
    ALLOWED_ORDER_TRANSITIONS[currentOrder.status] ?? [];

  if (!allowedTransitions.includes(nextStatus)) {
    throw createError(
      `Cannot change order status from '${currentOrder.status}' to '${nextStatus}'.`,
      409,
    );
  }

  // Match the previous status as well, preventing concurrent updates
  // from silently overwriting a newer status.
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: currentOrder.status,
    },
    {
      $set: { status: nextStatus },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("user", "name email")
    .lean();

  if (!updatedOrder) {
    throw createError(
      "The order was updated by another request. Refresh and try again.",
      409,
    );
  }

  return updatedOrder;
};
