// services/solanaTokenService.js
require("dotenv").config();
const { Connection, Keypair, PublicKey, clusterApiUrl, Transaction } = require("@solana/web3.js");
const { getOrCreateAssociatedTokenAccount, createTransferInstruction } = require("@solana/spl-token");

// 1) Connexion à la blockchain Solana
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// 2) Clé secrète de ta trésorerie (Keypair)
const treasurySecret = JSON.parse(process.env.TREASURY_SECRET_KEY);
const treasuryKeypair = Keypair.fromSecretKey(Buffer.from(treasurySecret));

// 3) Adresse du mint NIM
const NIM_MINT = new PublicKey(process.env.NIM_MINT_ADDRESS);

/**
 * Envoie des NIM (SPL) depuis ta trésorerie vers un destinataire
 * @param {string} toBase58 - adresse publique du destinataire
 * @param {number|string} amount    - montant en tokens (ex. 10.5)
 */
async function sendNIM(toBase58, amount) {
  const toPubkey = new PublicKey(toBase58);

  // 4) Récupère/Crée les ATA (Associated Token Accounts)
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, treasuryKeypair, NIM_MINT, treasuryKeypair.publicKey
  );
  const toTokenAccount   = await getOrCreateAssociatedTokenAccount(
    connection, treasuryKeypair, NIM_MINT, toPubkey
  );

  // 5) Prépare la transaction de transfert
  const tx = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      treasuryKeypair.publicKey,
      Number(amount) * (10 ** fromTokenAccount.amount.decimals) // ajuste selon les décimales
    )
  );

  // 6) Sign et envoie
  const signature = await connection.sendTransaction(tx, [treasuryKeypair]);
  console.log("⏳ Signature:", signature);

  // 7) Attend la confirmation
  await connection.confirmTransaction(signature, "confirmed");
  console.log("✅ Transfert confirmé :", signature);

  return signature;
}

module.exports = { sendNIM };
