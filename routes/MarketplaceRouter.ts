import {
  buyNft,
  cancelListing,
  listNft,
  updatePrice,
} from "../controllers/ListNftController";
import express from "express";
import { Router } from "express";

const router = Router();

router.post("/list-nft", listNft);

router.post("/buy-nft", buyNft);

router.post("/cancel-list", cancelListing);

router.post("/update-list-price", updatePrice);

export default router;
