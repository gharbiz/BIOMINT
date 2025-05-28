require("dotenv").config();
const fs = require("fs");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const {
  getOrCreateAssociatedTokenAccount,
  transfer,
} = require("@solana/spl-token");

// 📡 Connexion à Solana
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// 🎩 Trésorier : clé privée depuis .env
const secretKeyArray = JSON.parse(process.env.TREASURY_SECRET_KEY);
const treasury = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

console.log("💼 Adresse publique du trésorier :", treasury.publicKey.toBase58());
// 🔑 Paramètres du .env
const mintAddress = new PublicKey(process.env.NIM_MINT_ADDRESS);
const toWallet = new PublicKey(process.env.USER_PUBLIC_KEY);

(async () => {
  try {
    const solBalance = await connection.getBalance(treasury.publicKey);
    console.log("💰 SOL disponible dans le trésor :", solBalance / 1e9, "SOL");

    if (solBalance < 0.001 * 1e9) {
      console.error("🚨 Pas assez de SOL pour créer un compte associé ou payer les frais.");
      return;
    }

    console.log("🔍 Récupération ou création des comptes associés au token NIM...");

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasury,
      mintAddress,
      treasury.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasury,
      mintAddress,
      toWallet
    );

    console.log("💸 Transfert de NIM en cours...");

    const tx = await transfer(
      connection,
      treasury,
      fromTokenAccount.address,
      toTokenAccount.address,
      treasury.publicKey,
      10_000_000 // 1 NIM = 10⁶ si ton mint a 6 décimales (à adapter)
    );

    console.log("✅ Transfert terminé !");
    console.log("🔗 Transaction signature :", tx);
  } catch (error) {
    console.error("❌ Erreur attrapée :", error.message || error);
  }
})();
 
