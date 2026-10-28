import bcrypt from "bcryptjs";
import User from "../models/user.models.js";

export async function registerUser({ name, email, password }) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Check for an existing account for a helpful response.
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Hash the password before saving it.
  const passwordHash = await bcrypt.hash(password, 12);

  // Role is deliberately assigned here, not accepted from the client.
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role: "customer",
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
