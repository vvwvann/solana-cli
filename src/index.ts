require("fix-esm").register();
import { PublicKey } from "@solana/web3.js";
import { SOLANA_MAIN_URL, DEFAULT_TOKEN } from "./const";
import config from "./config.json";
import ConfigService from "./services/ConfigService";
import Solana from "./services/Solana";
import Sqlite from "./services/Sqlite";
import { getKeyPair } from "./metaplex/commands/wallet";
import chalk from "chalk";
import { exit } from "process";

(async () => {
  console.log(`${chalk.cyan("Auth ...")}`);
  await Solana.connect(SOLANA_MAIN_URL);

  const keyPair = getKeyPair(config.PrivateKey);

  let hasToken = await Solana.checkToken(
    keyPair.publicKey,
    new PublicKey(DEFAULT_TOKEN)
  );

  if (!hasToken) {
    console.log(
      `${chalk.red("Failed auth")} >> not found token ${DEFAULT_TOKEN}`
    );
    exit(0);
  }

  await Sqlite.connect();

  await ConfigService.init();
})();

// 4HSVf714FtSYvNRB27VJXa3ryeAKtkA9SyqJFXxequDE

// ts-node D:/git/github/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts upload -e devnet -k "C:\Users\sneltyn\.config\solana\id.json" -cp config.json -c example ./assets

// ts-node D:/git/github/metaplex/js/packages/cli/src/candy-machine-v2-cli.ts mint_one_token  -e devnet -k "C:\Users\sneltyn\.config\solana\id.json" -c example
