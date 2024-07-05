import mongoose from "mongoose";

const NFTDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  tokenId: {
    type: Number,
    required: true,
    unique: true,
  },

  isListed: {
    type: Boolean,
    default: false,
  },

  history: {
    type: [String],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("NFTDetails", NFTDetailsSchema);
