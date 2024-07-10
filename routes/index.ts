import { Router } from "express";

import mintRouter from "./NftRouter";
import marketplaceRouter from "./MarketplaceRouter";

const router = Router();

router.use("/", mintRouter);
router.use("/marketplace", marketplaceRouter);

export default router;
