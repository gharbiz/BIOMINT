const bip39 = require('bip39');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const ed25519 = require('ed25519-hd-key');
const fs = require('fs');

// Remplace ici par ta seed phrase Phantom (12 mots)
const mnemonic = "entre ici ta seed phrase exacte entre guillemets";
const derivationPath = "m/44'/501'/0'/0'"; // Standard Phantom derivation

(async () => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const derived = ed25519.derivePath(derivationPath, seed.toString('hex'));
  const keypair = nacl.sign.keyPair.fromSeed(derived.key);

  // Format attendu par Solana CLI (array de 64 octets)
  const secretKey = [...keypair.secretKey];
  fs.writeFileSync('phantom.json', JSON.stringify(secretKey));
  console.log("✅ phantom.json généré avec succès !");
})();
