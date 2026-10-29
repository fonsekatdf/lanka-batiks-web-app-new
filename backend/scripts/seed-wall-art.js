import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Product from "../src/models/product.model.js";

const wallArtProducts = [
  {
    name: "Island Bloom Wall Art",
    description:
      "A vibrant batik-inspired wall art piece featuring tropical blooms and rich island colours.",
    price: 18500,
    image: "/images/products/deco_1.webp",
  },
  {
    name: "Batik Garden Wall Art",
    description:
      "Bring handcrafted character to your home with this detailed floral batik wall art design.",
    price: 21000,
    image: "/images/products/deco_2.webp",
  },
  {
    name: "Tropical Rhythm Wall Art",
    description:
      "A bold decorative artwork inspired by Sri Lankan foliage, movement and expressive batik patterns.",
    price: 19500,
    image: "/images/products/deco_3.webp",
  },
  {
    name: "Heritage Motif Wall Art",
    description:
      "A warm, heritage-inspired batik artwork that adds texture and timeless Sri Lankan style to any room.",
    price: 22500,
    image: "/images/products/deco_4.webp",
  },
  {
    name: "Floral Harmony Wall Art",
    description:
      "A graceful floral composition made to bring colour, softness and artistic warmth to your walls.",
    price: 17500,
    image: "/images/products/deco_5.webp",
  },
  {
    name: "Island Story Wall Art",
    description:
      "A characterful batik wall piece celebrating the patterns, colours and stories of the island.",
    price: 23500,
    image: "/images/products/deco_6.webp",
  },
  {
    name: "Golden Foliage Wall Art",
    description:
      "A striking decorative panel with layered botanical details and a rich palette inspired by Sri Lankan craft.",
    price: 25000,
    image: "/images/products/deco_7.webp",
  },
].map((product) => ({
  ...product,
  category: "Wall Art",
  images: [product.image],
  stock: 10,
  isFeatured: false,
}));

const accessoryProducts = [
  {
    name: "Batik Blossom Scarf",
    description:
      "A lightweight batik scarf with a colourful floral pattern, perfect for adding an artistic touch to any outfit.",
    price: 6500,
    image: "/images/products/acc_1.webp",
  },
  {
    name: "Island Pattern Tote",
    description:
      "A practical everyday tote featuring a distinctive Sri Lankan batik-inspired pattern and handcrafted character.",
    price: 4800,
    image: "/images/products/acc_2.webp",
  },
  {
    name: "Handcrafted Batik Clutch",
    description:
      "A stylish batik clutch designed for special occasions, combining useful space with expressive island-inspired colour.",
    price: 7200,
    image: "/images/products/acc_3.webp",
  },
  {
    name: "Heritage Batik Pouch",
    description:
      "A compact fabric pouch with a heritage batik design, ideal for carrying small essentials in everyday style.",
    price: 3500,
    image: "/images/products/acc_4.webp",
  },
].map((product) => ({
  ...product,
  category: "Accessories",
  images: [product.image],
  stock: 10,
  isFeatured: false,
}));

const products = [...wallArtProducts, ...accessoryProducts];

async function seedProducts() {
  await connectDB();

  for (const product of products) {
    await Product.findOneAndUpdate(
      { name: product.name },
      product,
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        returnDocument: "after",
      },
    );
  }

  console.log(
    `Seeded ${wallArtProducts.length} wall art and ${accessoryProducts.length} accessory products.`,
  );
}

try {
  await seedProducts();
} finally {
  await mongoose.disconnect();
}
