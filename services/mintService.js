const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

// Vérification des variables d'environnement
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'OK' : 'MISSING');
console.log('POLYGON_RPC_URL:', process.env.POLYGON_RPC_URL ? 'OK' : 'MISSING');
console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS ? 'OK' : 'MISSING');

// Chargement de l'ABI
const abi = JSON.parse(fs.readFileSync("contract/abi.json"));

// Configuration du provider et du wallet
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Instance du contrat avec l'adresse, ABI, et wallet (signer)
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

/**
 * Fonction pour mint un NFT
 * @param {string} recipient - Adresse qui recevra le NFT (doit commencer par "0x")
 * @param {string} tokenURI - URL vers les métadonnées JSON du NFT (IPFS, HTTP, etc.)
 * @returns {Promise<Object>} - Receipt de la transaction
 */
async function mintNFT(recipient, tokenURI) {
  try {
    console.log(`🔄 Mint du NFT pour ${recipient} avec tokenURI: ${tokenURI}`);
    const tx = await contract.mintNFT(recipient, tokenURI);
    console.log("⏳ Transaction envoyée :", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Mint confirmé dans le bloc :", receipt.blockNumber);
    return receipt;
  } catch (error) {
    console.error("❌ Erreur de mint :", error);
    throw error;
  }
}

module.exports = { mintNFT };
