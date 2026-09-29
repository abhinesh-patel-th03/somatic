const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const env = require("./env");
const { logger } = require("../utils/logger");

mongoose.set("strictQuery", true);

async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("DB CONNECTED");
  } catch (err) {
    console.log("DB NOT CONNECTED");
    console.log("ERROR:", err.message);
    console.log("CODE:", err.code);
  }
}

module.exports = connectDB;