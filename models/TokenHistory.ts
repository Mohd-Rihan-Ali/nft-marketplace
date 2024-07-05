import mongoose from "mongoose";

const TokenHistorySchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true,
  },
  events: {
    type: [String],
    required: false,
  },
  prices: {
    type: [String],
    required: false,
  },
  from: {
    type: [String],
    required: false,
  },
  to: {
    type: [String],
    required: false,
  },
  date: {
    type: [String],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("TokenHistory", TokenHistorySchema);
