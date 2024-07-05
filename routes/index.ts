import { Router } from "express";

import mintRouter from "./NftRouter.js";
import marketplaceRouter from "./MarketplaceRouter.js";

const router = Router();

router.use("/", mintRouter);
router.use("/marketplace", marketplaceRouter);

export default router;
