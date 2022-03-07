import * as web3 from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { from_b58 } from "../../utils";

export async function send(rpcUrl, privKey, value, toPrivKey) {
  // Connect to cluster
  const connection = new web3.Connection(rpcUrl);

  const privKeyb58 = from_b58(privKey);
  let toPrivKey58 = from_b58(toPrivKey);

  // Construct a `Keypair` from secret key
  const from = web3.Keypair.fromSecretKey(privKeyb58);
  // Generate a new random public key
  const to = web3.Keypair.fromSecretKey(toPrivKey58);

  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: value,
    })
  );
  // Sign transaction, broadcast, and confirm
  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  console.log("SIGNATURE", signature);
  console.log("SUCCESS");
}

export async function checkToken(rpcUrl, privKey, tokenAddr) {}

export function getKeyPair(privKey: string): web3.Keypair {
  let privKeyb58 = from_b58(privKey);
  const res = web3.Keypair.fromSecretKey(privKeyb58);
  return res;
}
