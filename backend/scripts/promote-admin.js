import "dotenv/config";

import mongoose from "mongoose";
import User from "../src/models/user.model.js";

const promoteAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Set ADMIN_EMAIL to the existing account you want to promote."
    );
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const databaseName =
    process.env.MONGODB_DB_NAME || "lanka_batiks";

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: databaseName,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`Connected to database: ${mongoose.connection.name}`);

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error(
      `No account found for ${email}. Register that account first.`
    );
  }

  if (user.role === "admin") {
    console.log("This account is already an administrator.");
    return;
  }

  user.role = "admin";
  await user.save();

  console.log(`Administrator role assigned to ${user.email}.`);
};

try {
  await promoteAdmin();
} catch (error) {
  console.error("Admin promotion failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
