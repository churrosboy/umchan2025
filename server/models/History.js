const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  count: { type: Number, default: 0 },
  lastSearchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", historySchema);