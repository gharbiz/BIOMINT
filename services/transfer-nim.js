const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const secretKey = Uint8Array.from(require('./phantom.json'));

const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);

(async () => {
  const mintPublicKey = new solanaWeb3.PublicKey('AtjbgY3n2cs2cqPDME8YWrk6pcXmRKDvRPAXWm8Rxa61'); // Adresse token NIM
  const toPublicKey = new solanaWeb3.PublicKey('6Z8D7AwmG9nAaNpjztCPScDnXfYV1uDRbMUXY6b8RrAJ'); // Adresse destinataire (ton Phantom)

  // Crée un objet Token
  const token = new splToken.Token(
    connection,
    mintPublicKey,
    splToken.TOKEN_PROGRAM_ID,
    keypair
  );

  // Trouve ou crée le compte associé au destinataire pour ce token
  const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(toPublicKey);

  // Trouve le compte token associé à l'envoyeur
  const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(keypair.publicKey);

  // Effectue le transfert (ici 1 NIM avec 9 décimales)
  const txSignature = await token.transfer(
    fromTokenAccount.address,
    toTokenAccount.address,
    keypair.publicKey,
    [],
    1 * 10 ** 9
  );

  console.log('Transfert SPL token Tx:', txSignature);
})();
