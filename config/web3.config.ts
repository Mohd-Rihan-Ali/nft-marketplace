import { ethers } from "ethers";
import { MarketplaceABI } from "../utils/marketplaceABI.js";
import { MinterABI } from "../utils/minterABI.js";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

const MINTER_CONTRACT = () => {
  const contract = new ethers.Contract(
    process.env.MINTER_CONTRACT_ADDRESS as string,
    MinterABI,
    signer
  );

  return contract;
};

const MARKETPLACE_CONTRACT = () => {
  const contract = new ethers.Contract(
    process.env.MARKETPLACE_CONTRACT_ADDRESS as string,
    MarketplaceABI,
    signer
  );

  return contract;
};

export { MINTER_CONTRACT, MARKETPLACE_CONTRACT };
