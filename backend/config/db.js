// /config/db.js
import mongoose from "mongoose";
import config from "./env.js";

// Enable Mongoose debugging to see its operations
mongoose.set("debug", (collectionName, methodName, ...methodArgs) => {
  // Avoid logging huge binary data if any
  const args = methodArgs.map((arg) => {
    if (arg instanceof Buffer && arg.length > 100)
      return `Buffer(length:${arg.length})`;
    return arg;
  });
  try {
    console.log(
      `Mongoose: ${collectionName}.${methodName}(${JSON.stringify(
        args,
        null,
        2
      )})`
    );
  } catch (e) {
    console.log(`Mongoose: ${collectionName}.${methodName} (circular_args)`);
  }
});

const connectDB = async () => {
  try {
    console.log(
      `Attempting to connect to MongoDB with URI: ${config.MONGO_URI}`
    );

    const db = mongoose.connection;

    db.on("error", (error) => {
      console.error("MongoDB connection error:", error);
      // Mongoose will attempt to reconnect, but good to log these.
    });

    db.on("connected", () => {
      console.log(
        `MongoDB connected to host: ${db.host}, port: ${db.port}, name: ${db.name}`
      );
    });

    db.on("disconnected", () => {
      console.warn("MongoDB disconnected.");
    });

    db.on("reconnected", () => {
      console.info("MongoDB reconnected.");
    });

    db.on("close", () => {
      console.warn("MongoDB connection closed.");
    });

    // mongoose.connect returns a Promise of the Mongoose instance
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // How long to wait for a server to be selected
      socketTimeoutMS: 45000, // How long a socket can be idle before closing
      connectTimeoutMS: 30000, // How long the driver will wait for a connection to be established
      // useNewUrlParser: true, // Not needed in Mongoose 6+
      // useUnifiedTopology: true, // Not needed in Mongoose 6+
    });
    // If mongoose.connect resolves, it means a connection was established.
    // The 'connected' event should also fire.
  } catch (error) {
    console.error(`Initial MongoDB connection failed: ${error.message}`);
    if (error.name === "MongooseServerSelectionError" && error.reason) {
      console.error(
        "Detailed MongooseServerSelectionError reason:",
        error.reason.toString()
      );
    }
    // Re-throw to be caught by startServer in server.js, which will exit the process
    throw error;
  }
};

export default connectDB;
