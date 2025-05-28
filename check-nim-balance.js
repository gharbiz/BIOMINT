// check-nim-balance.js
const { Connection, PublicKey } = require("@solana/web3.js");
const { getAccount, getAssociatedTokenAddress } = require("@solana/spl-token");

(async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com", "confirmed");

  const mint = new PublicKey(process.env.NIM_MINT_ADDRESS);         // Mint NIM fixé (ex: AtjbgY3n2...)
  const treasuryPubkey = new PublicKey(process.env.TREASURY_PUBLIC_KEY); // Ton wallet trésorier

  // Récupérer le compte associé
  const associatedTokenAddress = await getAssociatedTokenAddress(mint, treasuryPubkey);

  try {
    const accountInfo = await getAccount(connection, associatedTokenAddress);
    const decimals = 6;  // Généralement 6 décimales pour SPL tokens
    console.log(`💰 Balance dans le trésorier : ${Number(accountInfo.amount) / 10 ** decimals} NIM`);
  } catch (error) {
    console.log("❌ Compte token associé non trouvé ou vide.");
  }
})();
