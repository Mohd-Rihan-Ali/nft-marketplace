import { Router } from "express";
import {
  NftDetails,
  NftFetch,
  NftFetchAll,
  NftStore,
  stats,
  transferNft,
} from "../controllers/NftController";
import multer from "multer";

const mintRouter = Router();
const upload = multer({ dest: "uploads/" });

mintRouter.post("/mint", upload.single("file"), NftStore);

mintRouter.get("/nfts", NftFetchAll);

mintRouter.get("/nfts/:account", NftFetch);

mintRouter.get("/nfts/nft/:tokenId", NftDetails);

mintRouter.post("/transfer", transferNft);

mintRouter.get("/stats", stats);

export default mintRouter;
