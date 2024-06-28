import dotenv from "dotenv";
import { ethers } from "ethers";
import { ABI } from "../ABI";
import { Seller } from "../models/Seller";
import { ListNFT } from "../models/ListNFT";
import { TokenHistory } from "../models/TokenHistory";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const privateKey = process.env.PRIVATE_KEY || "";
const signer = new ethers.Wallet(privateKey, provider);
const contract = process.env.CONTRACT_ADDRESS
  ? new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, signer)
  : null;

export const listNft = async (req: any, res: any) => {
  const { tokenId, price } = req.body;
  console.log(tokenId, price);

  try {
    contract?.once(
      "Listed",
      async (contractAddress, tokenId, seller, price) => {
        console.log(contractAddress, tokenId, seller, price);

        const listNft = new ListNFT({
          tokenId,
          seller,
          price,
        });
        if (!listNft) {
          throw new Error("Error creating listNft");
        }

        const sellerData = await Seller.findOneAndUpdate(
          { sellerAddress: seller },
          { tokenIds: { $push: tokenId } },
          { upsert: true }
        );
        if (!sellerData) {
          throw new Error("Error creating sellerData");
        }

        const tokenHistory = await TokenHistory.findOneAndUpdate(
          { tokenId: tokenId },
          {
            $push: {
              events: "Listed",
              prices: price,
              from: seller,
              to: "",
              date: new Date().toLocaleString(),
            },
          },
          { upsert: true }
        );
        if (!tokenHistory) {
          throw new Error("Error creating tokenHistory");
        }

        await listNft.save();
        await sellerData.save();
        await tokenHistory.save();
      }
    );
    res.status(200).json({ message: "NFT listed successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const buyNft = async (req: any, res: any) => {
  const { tokenId, price, buyer } = req.body;
  console.log(tokenId, price, buyer);

  try {
    contract?.once("Sale", async (contractAddress, tokenId, buyer, price) => {
      console.log(contractAddress, tokenId, buyer, price);

      const listNft = await ListNFT.findOneAndDelete({ tokenId: tokenId});
      if (!listNft) {
        throw new Error("Error deleting NFT from listNft");
      }

      const data = await Seller.findOne({ sellerAddress: buyer });
      const newAmt = data?.sellerAmt + price;
      const sellerData = await Seller.findOneAndUpdate(
        { sellerAddress: buyer },
        { $pull: { tokenIds: tokenId } },
        { sellerAmt: newAmt }
      );
      if (!sellerData) {
        throw new Error("Error creating sellerData");
      }

      const _data = await TokenHistory.findOne({ tokenId });
      const _from = _data?.from;
      const tokenHistory = await TokenHistory.findOneAndUpdate(
        { tokenId: tokenId },
        {
          $push: {
            events: "Sale",
            prices: price,
            from: _from,
            to: buyer,
            date: new Date().toLocaleString(),
          },
        },
        { upsert: true }
      );
      if (!tokenHistory) {
        throw new Error("Error creating tokenHistory");
      }

      await sellerData.save();
      await tokenHistory.save();
    });
    res.status(200).json({ message: "NFT bought successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const cancelListing = async (req: any, res: any) => {
  const { tokenId } = req.body;
  console.log(tokenId);

  try {
    contract?.once("ListingCancelled", async (contractAddress, tokenId) => {
      console.log(contractAddress, tokenId);

      const listNft = await ListNFT.findOneAndDelete({ tokenId: tokenId});
      if (!listNft) {
        throw new Error("Error deleting NFT from listNft");
      }
    });
    res.status(200).json({ message: "NFT listing cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const updatePrice = async (req: any, res: any) => {
  const { tokenId, price } = req.body;
  console.log(tokenId, price);

  try {
    contract?.once("PriceUpdated", async (contractAddress, tokenId, price) => {
      console.log(tokenId, price);

      const listNft = await ListNFT.findOneAndUpdate(
        { tokenId: tokenId },
        { price: price }
      );
      if (!listNft) {
        throw new Error("Error updating price in listNft");
      }

      await listNft.save();
    });
    res.status(200).json({ message: "Price updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
