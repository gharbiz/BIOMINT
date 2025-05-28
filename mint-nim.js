require("dotenv").config();
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const { getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");
const fs = require("fs");

// 🔑 Clé secrète du trésorier
const secretKeyArray = JSON.parse(process.env.TREASURY_SECRET_KEY);
const treasury = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

// 📡 Connexion réseau
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// 🎯 Adresse du token et du destinataire
const mintAddress = new PublicKey(process.env.NIM_MINT_ADDRESS);
const destination = treasury.publicKey; // ou autre wallet si tu veux minter ailleurs

(async () => {
  try {
    console.log("🚀 Initialisation du mint...");

    // Trouver/créer le compte associé pour recevoir les tokens
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasury,
      mintAddress,
      destination
    );

    // 💰 Quantité à minter (ex: 100 tokens avec 6 décimales = 100_000_000)
    const amount = 100_000_000;

    // ⛏️ Mint des tokens
    const txSig = await mintTo(
      connection,
      treasury,
      mintAddress,
      tokenAccount.address,
      treasury, // authority qui a droit de minter
      amount
    );

    console.log("✅ Mint effectué avec succès !");
    console.log("🔗 Signature :", txSig);
  } catch (err) {
    console.error("❌ Erreur lors du mint :", err.message);
  }
})();
