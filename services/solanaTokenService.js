// services/solanaTokenService.js
require("dotenv").config();
const { Connection, Keypair, PublicKey, Transaction } = require("@solana/web3.js");
const { getOrCreateAssociatedTokenAccount, createTransferInstruction } = require("@solana/spl-token");

// 1) Connexion à la blockchain Solana
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// 2) Clé secrète de ta trésorerie (Keypair) - AVEC VÉRIFICATION
let treasuryKeypair;
try {
  if (!process.env.TREASURY_SECRET_KEY) {
    throw new Error("TREASURY_SECRET_KEY variable d'environnement manquante");
  }
  
  const treasurySecret = JSON.parse(process.env.TREASURY_SECRET_KEY);
  treasuryKeypair = Keypair.fromSecretKey(Uint8Array.from(treasurySecret));
  console.log("✅ Clé de trésorerie chargée avec succès");
} catch (error) {
  console.error("❌ Erreur lors du chargement de la clé de trésorerie:", error.message);
  console.error("Vérifiez que TREASURY_SECRET_KEY est définie dans vos variables d'environnement");
  process.exit(1);
}

// 3) Adresse du mint NIM - AVEC VÉRIFICATION
let NIM_MINT;
try {
  if (!process.env.NIM_MINT_ADDRESS) {
    throw new Error("NIM_MINT_ADDRESS variable d'environnement manquante");
  }
  
  NIM_MINT = new PublicKey(process.env.NIM_MINT_ADDRESS);
  console.log("✅ Adresse NIM_MINT chargée:", NIM_MINT.toString());
} catch (error) {
  console.error("❌ Erreur lors du chargement de NIM_MINT_ADDRESS:", error.message);
  process.exit(1);
}

/**
 * Envoie des NIM (SPL) depuis ta trésorerie vers un destinataire
 * @param {string} toBase58 - adresse publique du destinataire
 * @param {number|string} amount    - montant en tokens (ex. 10.5)
 */
async function sendNIM(toBase58, amount) {
  try {
    const toPubkey = new PublicKey(toBase58);

    // 4) Récupère/Crée les ATA (Associated Token Accounts)
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, treasuryKeypair, NIM_MINT, treasuryKeypair.publicKey
    );
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, treasuryKeypair, NIM_MINT, toPubkey
    );

    // 5) Prépare la transaction de transfert
    const tx = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        treasuryKeypair.publicKey,
        Number(amount) * (10 ** 9) // Assuming 9 decimals for SPL tokens
      )
    );

    // 6) Sign et envoie
    const signature = await connection.sendTransaction(tx, [treasuryKeypair]);
    console.log("⏳ Signature:", signature);

    // 7) Attend la confirmation
    await connection.confirmTransaction(signature, "confirmed");
    console.log("✅ Transfert confirmé :", signature);

    return signature;
  } catch (error) {
    console.error("❌ Erreur lors du transfert NIM:", error);
    throw error;
  }
}

module.exports = { sendNIM };