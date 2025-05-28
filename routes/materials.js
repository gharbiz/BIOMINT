const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
require("dotenv").config();

const abi = require("../contract/MaterialsABI.json");
const CONTRACT_ADDRESS = "0xB7EaeCF4BFA4D659B4e3c3a77adc274c1DeD29aC";

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

router.post("/buy-material", async (req, res) => {
  const { playerAddress, materialId, quantity } = req.body;

  try {
    const tx = await contract.mintMaterials(playerAddress, materialId, quantity);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
