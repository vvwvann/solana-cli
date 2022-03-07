#!/usr/bin/env ts-node
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { mintV2 } from "./commands/mint";
import log from "loglevel";

log.setLevel(log.levels.INFO);

export async function mint_one_token(candyAddress, privKey, rpcUrl) {
  // '-r, --rpc-url <string>',

  const candyMachine = new PublicKey(candyAddress);
  const tx = await mintV2(privKey, candyMachine, rpcUrl);

  log.info("mint_one_token finished", tx);
}

export async function mint_multiple_tokens(
  candyAddress,
  privKey,
  rpcUrl,
  number
) {
  const NUMBER_OF_NFTS_TO_MINT = parseInt(number, 10);
  const candyMachine = new PublicKey(candyAddress);

  log.info(`Minting ${NUMBER_OF_NFTS_TO_MINT} tokens...`);

  const mintToken = async (index) => {
    const tx = await mintV2(privKey, candyMachine, rpcUrl);
    log.info(`transaction ${index + 1} complete`, tx);

    if (index < NUMBER_OF_NFTS_TO_MINT - 1) {
      log.info("minting another token...");
      await mintToken(index + 1);
    }
  };

  await mintToken(0);

  log.info(`minted ${NUMBER_OF_NFTS_TO_MINT} tokens`);
  log.info("mint_multiple_tokens finished");
}
