import { registerUser } from "../services/auth.services.js";

export async function register(req, res, next) {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  if (name.trim().length < 2 || name.trim().length > 80) {
    return res.status(400).json({
      success: false,
      message: "Name must contain between 2 and 80 characters.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  // Keep bcrypt's input limit in mind. Do not silently truncate passwords.
  if (
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes.",
    });
  }

  try {
    const user = await registerUser({
      name,
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: user,
    });
  } catch (error) {
    if (error.statusCode === 409 || error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return next(error);
  }
}
