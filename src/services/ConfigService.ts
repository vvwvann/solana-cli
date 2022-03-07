import inquirer from "inquirer";
import chalk from "chalk";

import {
  DEFAULT_ACCOUNTS,
  SOLANA_MAIN_URL,
  CANDY_ADDRESS,
  DEFAULT_TOKEN,
} from "../const";
import { IConfig } from "../interfaces/IConfig";
import { SolanaWalletManager } from "../cli-options/SolanaWalletManager";
import { CandyMachineMinting } from "../cli-options/CandyMachineMinting";
import { SolanaMonitor } from "../cli-options/SolanaMonitor";
import { Settings } from "../cli-options/Settings";

class ConfigService {
  private _config: IConfig = {
    netUrl: SOLANA_MAIN_URL,
    token: DEFAULT_TOKEN,
    accounts: DEFAULT_ACCOUNTS,
    candyAddress: CANDY_ADDRESS,
  };

  get config() {
    return this._config;
  }

  set config(config) {
    this._config = config;
  }

  async init() {
    await inquirer
      .prompt([
        {
          type: "list",
          name: "option",
          message: "Select option",
          choices: [
            "1. Candy Machine V2 Minting",
            "2. Magic Eden Launchpad Minting",
            "3. Solana Monitor",
            "4. Solana Wallet Manager",
            "5. Settings",
          ],
        },
      ])
      .then((ans) => {
        switch(ans.option[0]) {
          case '1':
            CandyMachineMinting()
            break;
          case '3':
            SolanaMonitor();
            break;
          case '5':
            Settings()
            break;
          case '4':
            SolanaWalletManager()
            break;
          default:
            console.log(chalk.red("Not implemented"))
            this.init()
            break;
        }
      });
    return true;
  }

  async overwriteConfig() {
    const questions = [
      {
        type: "input",
        name: "netUrl",
        message: `Enter Candy Machine Address`,
        default: this.config.candyAddress,
      },
      {
        type: "input",
        name: "accounts",
        message: `Enter wallets splitted by comma`,
        default: this.config.accounts,
      },
    ];

    return inquirer
      .prompt(questions)
      .then((answers) => {
        let res = answers;
        if (typeof res.accounts == "string")
          res.accounts = answers.accounts.split(",");
        this._config = res;
        this.init()
      })
      .catch((error) => {
        if (error.isTtyError) {
          console.log("Sorry, TTY error.");
        } else {
          console.log(error);
        }
        process.exit();
      });
  }
}

export default new ConfigService();
