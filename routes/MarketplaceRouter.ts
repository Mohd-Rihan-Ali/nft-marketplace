import {
  buyNft,
  cancelListing,
  listNft,
  updatePrice,
} from "../controllers/ListNftController";
import { Router } from "express";
import multer from "multer";

const upload = multer();

const marketplaceRouter = Router();

marketplaceRouter.post("/list-nft", upload.none(), listNft);
marketplaceRouter.post("/buy-nft", upload.none(), buyNft);
marketplaceRouter.post("/cancel-list", upload.none(), cancelListing);
marketplaceRouter.post("/update-price", upload.none(), updatePrice);



// marketplaceRouter.use("/marketplace", marketplaceRouter);

export default marketplaceRouter;
