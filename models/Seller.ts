import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema({
  sellerAddress: {
    type: String,
    required: true,
    unique: true,
  },
  tokenIds: {
    type: [Number],
    required: true,
  },
  sellerAmt: {
    type: String,
  },
});

export const Seller = mongoose.model("Seller", SellerSchema);
