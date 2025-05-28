// services/solanaMintService.js
require("dotenv").config();
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { Metaplex, bundlrStorage, keypairIdentity } = require("@metaplex-foundation/js");

// 1) Connexion et instance Metaplex
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
const metaplex  = Metaplex.make(connection)
  .use(keypairIdentity(Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TREASURY_SECRET_KEY)))))
  .use(bundlrStorage());

// 2) Prix du NFT en NIM
const PRICE_NIM = 5; // nombre de tokens

/**
 * Mint un NFT Metaplex après collecte des NIM
 * @param {string} userPublicKey - public key du minter
 * @param {string} metadataUri   - URI JSON (image, nom, description…)
 */
async function mintPaidNFT(userPublicKey, metadataUri) {
  // 1) Transfert des NIM
  const { sendNIM } = require("./solanaTokenService");
  await sendNIM(userPublicKey, PRICE_NIM);

  // 2) Mint du NFT via Metaplex
  const { nft } = await metaplex.nfts().create({
    uri: metadataUri,
    name: "Bio Designer NFT",
    sellerFeeBasisPoints: 500,            // 5% de royalties
    maxSupply: 1,
    updateAuthority: Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TREASURY_SECRET_KEY))),
    creators: [
      { address: Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.TREASURY_SECRET_KEY))).publicKey, share: 100 }
    ]
  });

  console.log("🌱 NFT minté:", nft.address.toBase58());
  return nft;
}

module.exports = { mintPaidNFT };
