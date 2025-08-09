const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/polling-app";

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("DB Connected to:", mongoUri);
});
db.on("disconnected", () => {
  console.log("DB Disconnected.");
});
db.on("error", (error) => {
  console.log("DB Error:", error);
});

module.exports = db;
