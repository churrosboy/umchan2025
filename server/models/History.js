import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  count: { type: Number, default: 0 },
  lastSearchedAt: { type: Date, default: Date.now },
});

const History = mongoose.model("HistoryDev", historySchema);

export default History;