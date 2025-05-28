require("dotenv").config();
const express = require("express");
const { sendNIM }    = require("./services/solanaTokenService");
const { mintPaidNFT }= require("./services/solanaMintService");
const solanaWeb3 = require('@solana/web3.js');
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl('devnet'), // ou 'mainnet-beta' pour la vraie vie
  'confirmed' // confirmation commitment level
);
const secretKey = Uint8Array.from(require('./phantom.json'));
const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
(async () => {
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`Balance: ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL`);
})();
(async () => {
  const toPublicKey = new solanaWeb3.PublicKey('AdressePublicDuDestinataire');

  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: toPublicKey,
      lamports: 0.1 * solanaWeb3.LAMPORTS_PER_SOL, // 0.1 SOL
    })
  );

  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair]
  );

  console.log('Transaction signature', signature);
})();

const app  = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Route pour transfert simple de NIM
app.post("/send-nim", async (req, res) => {
  const { to, amount } = req.body;
  if (!to || !amount) return res.status(400).json({ error: "to & amount requis" });
  try {
    const sig = await sendNIM(to, amount);
    res.json({ success: true, signature: sig });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Route pour mint NFT payant
app.post("/mint-paid", async (req, res) => {
  const { userPublicKey, metadataUri } = req.body;
  if (!userPublicKey || !metadataUri)
    return res.status(400).json({ error: "userPublicKey & metadataUri requis" });
  try {
    const nft = await mintPaidNFT(userPublicKey, metadataUri);
    res.json({ success: true, nftAddress: nft.address.toBase58() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Serveur solana @ http://localhost:${PORT}`));
