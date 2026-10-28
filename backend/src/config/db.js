import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME || "lanka_batiks";

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(mongoURI, {
    dbName: databaseName,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    `MongoDB connected successfully: ${mongoose.connection.name}`
  );
};

export default connectDB;
