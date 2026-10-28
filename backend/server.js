import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting requests.
    await connectDB();

    // Start the HTTP server only after the DB connects.
    app.listen(PORT, () => {
      console.log(`Lanka Batiks API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the application:", error.message);
    process.exit(1);
  }
};

startServer();
