import mongoose from "mongoose";
import "dotenv/config";

const Connection = async () => {
  const URL = process.env.DB_URL;

  try {
    await mongoose.connect(URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error while connecting with the database ", error);
  }
};

export default Connection;
