import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "Traditional",
          "Clothing",
          "Accessories",
          "Home Decor",
          "Wall Art",
        ],
        message: "Invalid product category",
      },
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) =>
          images.length <= 10 &&
          images.every((image) => image.trim().length > 0),
        message: "Provide up to 10 non-empty image URLs",
      },
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
