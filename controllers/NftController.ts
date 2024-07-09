import fs from "fs";
import pinataSDK from "@pinata/sdk";
import NFTDetails from "../models/NFTDetails.js";
import Users from "../models/Users.js";
import { NextFunction, Request, Response } from "express";
import TokenHistory from "../models/TokenHistory.js";
import { MINTER_CONTRACT } from "../config/web3.config.js";

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

const contract = MINTER_CONTRACT();

export const NftStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, account } = req.body;
  const file = req.file as Express.Multer.File;

  console.log("name", name);
  console.log("description", description);
  console.log("account", account);
  console.log("file", file);

  try {
    const response = await pinata.testAuthentication();
    if (!response) throw new Error("Error authenticating with Pinata");
    console.log("Pinata authentication successful", response);

    const imagePinataResponse = await pinata.pinFileToIPFS(
      fs.createReadStream(file.path),
      { pinataMetadata: { name: name } }
    );
    const body = {
      name: name,
      description: description,
      image: "ipfs://" + imagePinataResponse.IpfsHash,
    };
    const jsonPinataResponse = await pinata.pinJSONToIPFS(body);
    console.log("response:", "ipfs://" + jsonPinataResponse.IpfsHash);

    contract.once("Transfer", async (from, to, tokenId) => {
      console.log("Transfer event:", from, to, tokenId);

      try {
        const newToken = new NFTDetails({
          name: name,
          description: description,
          image:
            "https://beige-accepted-wildebeest-859.mypinata.cloud/ipfs/" +
            imagePinataResponse.IpfsHash,
          tokenId: parseInt(tokenId),
        });
        if (!newToken) throw new Error("Error saving token");

        const updatedUser = await Users.findOneAndUpdate(
          { accountAddress: account },
          { $push: { tokens: newToken._id } },
          { upsert: true, new: true }
        );
        if (!updatedUser) throw new Error("Error updating user");

        const tokenHistory = await TokenHistory.findOneAndUpdate(
          { tokenId: tokenId },
          {
            $push: {
              events: "Mint",
              prices: "",
              from: from,
              to: to,
              date: new Date().toLocaleString(),
            },
          },
          { upsert: true, new: true }
        );
        if (!tokenHistory) {
          throw new Error("Error creating tokenHistory");
        }

        newToken.history.push(account);
        await newToken.save();
        await updatedUser.save();
        await tokenHistory.save();
      } catch (err) {
        console.error(`Error in Transfer event: ${err}`);
      }
    });

    const ipfsFinalResponse = "ipfs://" + jsonPinataResponse.IpfsHash;
    res.status(200).send({ response: ipfsFinalResponse });
  } catch (err: any) {
    console.log(err);
    res.status(500).send({ Message: err.message });
  } finally {
    fs.unlink(file.path, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
    });
  }
};

export const NftFetchAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const nfts = await NFTDetails.find();
    res.status(200).json(nfts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const NftFetch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await Users.findOne({ accountAddress: req.params.account });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nfts = await NFTDetails.find({ _id: { $in: user.tokens } });
    res.status(200).json(nfts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const NftDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tokenId } = req.params;
    console.log("tokenId", tokenId);

    const nft = await NFTDetails.findOne({ tokenId: req.params.tokenId });
    if (!nft) {
      throw new Error("NFT not found");
    }

    const tokenHistory = await TokenHistory.findOne({ tokenId: nft.tokenId });
    if (!tokenHistory) {
      throw new Error("Token history not found");
    }

    const combinedResponse = {
      nft: nft,
      tokenHistory: tokenHistory,
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const transferNft = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { owner, to, fTokenId } = req.body;
  console.log("owner", owner);
  console.log("to", to);
  console.log("tokenId", fTokenId);

  try {
    contract.once("Transfer", async (from, to, tokenId) => {
      console.log("Transfer event:", from, to, tokenId);
      try {
        const tokenIdNumber = tokenId.toNumber();
        const nft = await NFTDetails.findOne({ tokenId: tokenIdNumber });
        if (!nft) throw new Error("NFT not found");

        if (from !== to) {
          const updateFromUser = await Users.findOneAndUpdate(
            { accountAddress: from },
            { $pull: { tokens: nft._id } }
          );

          const updatedToUser = await Users.findOneAndUpdate(
            { accountAddress: to },
            { $push: { tokens: nft._id } },
            { upsert: true, new: true }
          );

          if (!updateFromUser || !updatedToUser) {
            throw new Error("Error updating or creating user account");
          }
        }

        nft.history.push(to);
        await nft.save();
      } catch (error) {
        console.error(`Error in Transfer event handling: ${error}`);
        throw new Error("Error transferring NFT");
      }
    });
    res.status(200).json({ message: "Transfer in progress" });
  } catch (error) {
    console.error(`Error setting up Transfer event listener: ${error}`);
    res.status(500).json({ message: "Server error setting up transfer" });
  }
};
