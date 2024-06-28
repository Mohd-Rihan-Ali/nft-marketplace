import mongoose from "mongoose";

const TokenHistorySchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true,
  },
  events: {
    type: [String],
  },
  prices: {
    type: [String],
  },
  from: {
    type: [String],
  },
  to: {
    type: [String],
  },
  date: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const TokenHistory = mongoose.model("TokenHistory", TokenHistorySchema);
