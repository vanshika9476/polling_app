import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("DB Connected.");
});
db.on("disconnected", () => {
  console.log("DB Disconnected.");
});
db.on("error", () => {
  console.log("Error Came");
});

export default db;
