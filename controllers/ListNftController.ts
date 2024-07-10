import Seller from "../models/Seller";
import ListNFT from "../models/ListNFT";
import TokenHistory from "../models/TokenHistory";
import NFTDetails from "../models/NFTDetails";
import Users from "../models/Users";
import { NextFunction, Request, Response } from "express";
import { MARKETPLACE_CONTRACT } from "../config/web3.config";


const contract = MARKETPLACE_CONTRACT();

const listNft = async (req: Request, res: Response, next: NextFunction) => {
  const { isListed, tokenId } = req.body;
  console.log("isListed: ", isListed);
  console.log("tokenId: ", tokenId);

  try {
    contract?.once(
      "Listed",
      async (contractAddress, tokenId, seller, price) => {
        console.log(contractAddress, tokenId, seller, price);

        const tokenIdNumber = Number(tokenId);

        const listNft = new ListNFT({
          tokenId: tokenIdNumber,
          seller,
          price,
        });
        if (!listNft) {
          throw new Error("Error creating listNft");
        }

        const sellerData = await Seller.findOneAndUpdate(
          { sellerAddress: seller },
          { $push: { tokenIds: tokenIdNumber } },
          { upsert: true, new: true }
        );
        if (!sellerData) {
          throw new Error("Error creating sellerData");
        }

        const tokenHistory = await TokenHistory.findOneAndUpdate(
          { tokenId: tokenIdNumber },
          {
            $push: {
              events: "Listed",
              prices: price,
              from: seller,
              to: "",
              date: new Date().toLocaleString(),
            },
          },
          { upsert: true, new: true }
        );
        if (!tokenHistory) {
          throw new Error("Error creating tokenHistory");
        }

        const nftDetails = await NFTDetails.findOneAndUpdate(
          { tokenId: tokenIdNumber },
          { isListed: isListed },
          { upsert: true, new: true }
        );
        if (!nftDetails) {
          throw new Error("Error updating NFTDetails");
        }

        await listNft.save();
        await sellerData.save();
        await tokenHistory.save();
        await nftDetails.save();
      }
    );
    res.status(200).json({ message: "NFT listed successfully" });
  } catch (error) {
    next(error);
  }
};

const buyNft = async (req: Request, res: Response, next: NextFunction) => {
  const { isListed, tokenId } = req.body;
  console.log("isListed: ", isListed);
  console.log("tokenId: ", tokenId);

  try {
    contract?.once("Sale", async (contractAddress, tokenId, buyer, price) => {
      console.log(contractAddress, tokenId, buyer, price);

      const tokenIdNumber = tokenId.toNumber();
      const listNft = await ListNFT.findOneAndDelete({
        tokenId: tokenIdNumber,
      });
      if (!listNft) {
        throw new Error("Error deleting NFT from listNft");
      }

      const data = await Seller.findOne({ sellerAddress: buyer });
      const newAmt = data?.sellerAmt + price;
      const sellerData = await Seller.findOneAndUpdate(
        { sellerAddress: buyer },
        { $pull: { tokenIds: tokenIdNumber }, $set: { sellerAmt: newAmt } },
        { upsert: true, new: true }
      );
      if (!sellerData) {
        throw new Error("Error creating sellerData");
      }

      const _data = await TokenHistory.findOne({ tokenId });
      const _from = _data?.from ?? [];
      const tokenHistory = await TokenHistory.findOneAndUpdate(
        { tokenId: tokenIdNumber },
        {
          $push: {
            events: "Sale",
            prices: price,
            from: _from[_from?.length - 1],
            to: buyer,
            date: new Date().toLocaleString(),
          },
        },
        { upsert: true }
      );
      if (!tokenHistory) {
        throw new Error("Error creating tokenHistory");
      }

      const nft = await NFTDetails.findOne({ tokenId: tokenIdNumber });
      if (!nft) throw new Error("NFT not found");

      if (_from !== buyer) {
        const updateFromUser = await Users.findOneAndUpdate(
          { accountAddress: _from },
          { $pull: { tokens: nft._id } }
        );

        const updatedToUser = await Users.findOneAndUpdate(
          { accountAddress: buyer },
          { $push: { tokens: nft._id } },
          { upsert: true, new: true }
        );

        if (!updateFromUser || !updatedToUser) {
          throw new Error("Error updating or creating user account");
        }

        await updateFromUser.save();
        await updatedToUser.save();
      }

      nft.history.push(buyer);
      nft.isListed = false;

      await nft.save();

      await sellerData.save();
      await tokenHistory.save();

      console.log("nft: ", nft);
    });
    res.status(200).json({ message: "NFT bought successfully" });
  } catch (error) {
    next(error);
  }
};

const cancelListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { isListed, tokenId } = req.body;
  console.log("isListed: ", isListed);
  console.log("tokenId: ", tokenId);

  try {
    contract?.once("ListingCancelled", async (contractAddress, tokenId) => {
      console.log(contractAddress, tokenId);

      const tokenIdNumber = tokenId.toNumber();
      await ListNFT.findOneAndDelete({
        tokenId: tokenIdNumber,
      });

      const nftDetails = await NFTDetails.findOneAndUpdate(
        { tokenId: tokenIdNumber },
        { isListed: isListed },
        { upsert: true, new: true }
      );
      if (!nftDetails) {
        throw new Error("Error updating NFTDetails");
      }

      const _data = await TokenHistory.findOne({ tokenId });
      const _from = _data?.from;
      const tokenHistory = await TokenHistory.findOneAndUpdate(
        { tokenId: tokenIdNumber },
        {
          $push: {
            events: "ListingCancelled",
            prices: "",
            from: _from,
            to: "",
            date: new Date().toLocaleString(),
          },
        },
        { upsert: true }
      );
      if (!tokenHistory) {
        throw new Error("Error creating tokenHistory");
      }

      nftDetails.save();
      tokenHistory.save();
      console.log("nftDetails: ", nftDetails);
    });
    res.status(200).json({ message: "NFT listing cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

const updatePrice = async (req: Request, res: Response, next: NextFunction) => {
  const { tokenId, price } = req.body;
  console.log(tokenId, price);

  try {
    contract?.once(
      "PriceUpdated",
      async (contractAddress, tokenId, newPrice) => {
        console.log(contractAddress, tokenId, newPrice);
        const tokenIdNumber = Number(tokenId);

        const listNft = await ListNFT.findOneAndUpdate(
          { tokenId: tokenIdNumber },
          { price: newPrice }
        );
        if (!listNft) {
          throw new Error("Error updating listNft price");
        }

        const tokenHistory = await TokenHistory.findOneAndUpdate(
          { tokenId: tokenIdNumber },
          {
            $push: {
              events: "PriceUpdated",
              prices: newPrice,
              date: new Date().toLocaleString(),
            },
          },
          { upsert: true }
        );
        if (!tokenHistory) {
          throw new Error("Error creating tokenHistory");
        }

        await listNft.save();
        await tokenHistory.save();
      }
    );
    res.status(200).json({ message: "Price updated successfully" });
  } catch (error) {
    next(error);
  }
};

export { listNft, buyNft, cancelListing, updatePrice };
