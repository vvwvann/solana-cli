import chalk from "chalk";
import inquirer from "inquirer";
import { mint_multiple_tokens } from "../metaplex/candy-machine-v2-cli";
import ConfigService from "../services/ConfigService";
import Sqlite from "../services/Sqlite";
import { replyAndReturn } from "./_utils";

export async function CandyMachineMinting() {
  const wallets = await Sqlite.getWallets();
  if (!wallets.length || wallets.length < 1)
    return replyAndReturn(
      `${chalk.red(
        "WARN"
      )}! >>>  You don't have any wallets listed.\nUse Solana Wallet Manager.`,
      ConfigService.init
    );

  let ans = await inquirer.prompt([
    {
      type: "input",
      name: "candy",
      message: "Enter Candy Machine Address:",
      default: ConfigService.config.candyAddress,
    },
    {
      type: "checkbox",
      name: "wallets",
      choices: wallets.map((w) => w.pkey),
      message: "Choice wallet/wallets:",
    },
    {
      type: "input",
      name: "count",
      message: "Number of mint transactions",
      default: 1,
    },
  ]);

  for (let wallet of ans.wallets) {
    const rpcUrl = ConfigService.config.netUrl;
    const privKey = wallet;

    try {
      // console.log(`${chalk.cyan("INFO")} >> Minting being attempted`);
      await mint_multiple_tokens(ans.candy, privKey, rpcUrl, ans.count);
      console.log(`${chalk.green("SUCCESS")} >> Minting Successful`);
    } catch (ex) {
      console.log(ex);
      console.log(`${chalk.red("FAILED")} >> Minting error`);
    }
  }

  await replyAndReturn("", ConfigService.init, false);
}
