// services/solanaMintService.js
require("dotenv").config();
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { Metaplex, keypairIdentity, mockStorage } = require("@metaplex-foundation/js");

// Chargement sécurisé du keypair
let treasuryKeypair;
try {
  if (!process.env.TREASURY_SECRET_KEY) {
    throw new Error("TREASURY_SECRET_KEY variable d'environnement manquante");
  }
  
  const treasurySecret = JSON.parse(process.env.TREASURY_SECRET_KEY);
  treasuryKeypair = Keypair.fromSecretKey(Buffer.from(treasurySecret));
  console.log("✅ Keypair de mint chargé avec succès");
} catch (error) {
  console.error("❌ Erreur lors du chargement du keypair de mint:", error.message);
  process.exit(1);
}

// 1) Connexion et instance Metaplex
const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");

// Utilisation de mockStorage au lieu de bundlrStorage pour éviter les problèmes
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(treasuryKeypair))
  .use(mockStorage()); // Alternative à bundlrStorage

// 2) Prix du NFT en NIM
const PRICE_NIM = 5; // nombre de tokens

/**
 * Mint un NFT Metaplex après collecte des NIM
 * @param {string} userPublicKey - public key du minter
 * @param {string} metadataUri   - URI JSON (image, nom, description…)
 */
async function mintPaidNFT(userPublicKey, metadataUri) {
  try {
    // 1) Transfert des NIM
    const { sendNIM } = require("./solanaTokenService");
    console.log(`🔄 Transfert de ${PRICE_NIM} NIM vers ${userPublicKey}...`);
    await sendNIM(userPublicKey, PRICE_NIM);
    
    // 2) Mint du NFT via Metaplex
    console.log("🔄 Création du NFT...");
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: "Bio Designer NFT",
      sellerFeeBasisPoints: 500, // 5% de royalties
      symbol: "GHARB",
      maxSupply: 1,
      updateAuthority: treasuryKeypair,
      creators: [
        { 
          address: treasuryKeypair.publicKey, 
          share: 100 
        }
      ]
    });

    console.log("🌱 NFT minté avec succès:", nft.address.toBase58());
    
    return {
      success: true,
      nft: nft,
      mintAddress: nft.address.toBase58(),
      name: "Bio Designer NFT",
      uri: metadataUri
    };
    
  } catch (error) {
    console.error("❌ Erreur lors du mint du NFT payant:", error);
    throw error;
  }
}

module.exports = { mintPaidNFT };