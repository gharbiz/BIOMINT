require("dotenv").config();
const { Connection, PublicKey } = require("@solana/web3.js");

(async () => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
  const treasuryPubKey = new PublicKey("HDbJaD17BYs3EEug8sak3U8edAPARy2afCpBjUt9FZz6"); // Ton wallet trésorier

  const accounts = await connection.getParsedTokenAccountsByOwner(treasuryPubKey, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  });

  for (const { account } of accounts.value) {
    const info = account.data.parsed.info;
    console.log(`🪙 Mint: ${info.mint} | 💰 Balance: ${info.tokenAmount.uiAmount}`);
  }
})();
