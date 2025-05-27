import mongoose from "mongoose";
import config from "./env.js";

mongoose.set("debug", (collectionName, methodName, ...methodArgs) => {
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

    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
  } catch (error) {
    console.error(`Initial MongoDB connection failed: ${error.message}`);
    if (error.name === "MongooseServerSelectionError" && error.reason) {
      console.error(
        "Detailed MongooseServerSelectionError reason:",
        error.reason.toString()
      );
    }
    throw error;
  }
};

export default connectDB;
