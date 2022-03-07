import inquirer from "inquirer";
import chalk from "chalk";
import { replyAndReturn } from "./_utils";
import Sqlite from "../services/Sqlite";
import { send } from "../metaplex/commands/wallet";
import { getBalance } from "../metaplex/helpers/accounts";
import { web3 } from "@project-serum/anchor";
import { from_b58 } from "../utils";
import ConfigService from "../services/ConfigService";
const base58 = require("base-58");

export const SolanaWalletManager = async () => {
  const wallets = await Sqlite.getWallets();
  let primaryWallet = wallets.find((wallet) => wallet.isPrimary == 1);
  let visiblePrimaryWallet = "None";
  if (primaryWallet) {
    try {
      let pk58 = from_b58(primaryWallet.pkey);
      let keypair = web3.Keypair.fromSecretKey(pk58);
      visiblePrimaryWallet = keypair.publicKey.toBase58();
    } catch (e) {
      return replyAndReturn(
        `
                ${chalk.cyan("INFO")} >> Invalid private key
            `,
        SolanaWalletManager
      );
    }
  }
  let other = wallets.filter((wallet) => wallet.isPrimary != 1);
  console.log(`
    
        ${chalk.bold(`*** Solana Wallet Mananager ***`)}
        ** Currently primary wallet **: ${chalk.bold(visiblePrimaryWallet)}
        ** Other wallets **: ${chalk.bold(other.length)}
    `);
  await inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "Select option",
        choices: [
          "1. Mark wallet as primary",
          "2. Add wallet",
          "3. Remove wallet",
          new inquirer.Separator(),
          "4. Transfer from primary to all",
          "5. Transfer from all to primary",
          "6. Go to main menu",
        ],
      },
    ])
    .then((ans) => {
      switch (ans.option[0]) {
        case "1": {
          SelectPrimary();
          break;
        }
        case "2": {
          AddWallet();
          break;
        }
        case "3": {
          RemoveWallet();
          break;
        }
        case "4": {
          if (wallets.length <= 1) {
            return replyAndReturn(
              `
                            ${chalk.red(
                              "INVALID"
                            )} >> Please, add more wallets before using that
                        `,
              SolanaWalletManager
            );
          }
          FromPrimaryToAll(primaryWallet?.pkey, other);
          break;
        }
        case "5": {
          if (wallets.length <= 1) {
            return replyAndReturn(
              `
                            ${chalk.red(
                              "INVALID"
                            )} >> Please, add more wallets before using that
                        `,
              SolanaWalletManager
            );
          }
          FromAllToPrimary(primaryWallet?.pkey, other);
          break;
        }
        case "6": {
          ConfigService.init();
          break;
        }
      }
    });
  return true;
};

const AddWallet = async () => {
  const ans = await inquirer.prompt({
    type: "input",
    name: "wallet",
    message: 'Enter wallet private key (or "cancel"):',
  });
  if (!ans.wallet)
    return replyAndReturn(
      `
            ${chalk.red("INVALID")} >> Invalid wallet private key
        `,
      SolanaWalletManager
    );

  if (ans.wallet == "cancel") {
    return replyAndReturn(
      `
            ${chalk.cyan("INFO")} >> Moved to main menu
        `,
      SolanaWalletManager
    );
  }

  try {
    let pk58 = from_b58(ans.wallet);
    let keypair = web3.Keypair.fromSecretKey(pk58);
  } catch (e) {
    return replyAndReturn(
      `
            ${chalk.cyan("INFO")} >> Invalid private key
        `,
      SolanaWalletManager
    );
  }

  // return;

  try {
    Sqlite.addWallet(ans.wallet);
    replyAndReturn(
      `
            ${chalk.green("SUCCESS")} >> Wallet added
        `,
      SolanaWalletManager
    );
  } catch (e) {
    replyAndReturn(
      `
        ${chalk.red("INVALID")} >> Error while adding wallet: ${e.message}
    `,
      SolanaWalletManager
    );
  }
};

const RemoveWallet = async () => {
  let wallets = await Sqlite.getWallets();
  wallets = wallets.map((wallet) => wallet.pkey);
  let keypairs: { publicKey: string; privateKey: string }[] = wallets.map(
    getKeypairFromPrivateKey
  );
  const ans = await inquirer.prompt({
    type: "list",
    name: "wallet",
    message: "Select wallet to remove",
    choices: [...keypairs.map((k) => k.publicKey), "cancel"],
  });

  if (ans.wallet == "cancel") {
    return replyAndReturn(
      `
            ${chalk.cyan("INFO")} >> Moved to main menu
        `,
      SolanaWalletManager
    );
  }

  try {
    let keypair = keypairs.find((k) => k.publicKey == ans.wallet);
    await Sqlite.removeWallet(keypair.privateKey);
    replyAndReturn(
      `
            ${chalk.green("SUCCESS")} >> Wallet removed
        `,
      SolanaWalletManager
    );
  } catch (e) {
    replyAndReturn(
      `
        ${chalk.cyan("INVALID")} >> Error while removing wallet: ${e.message}
    `,
      SolanaWalletManager
    );
  }
};

const SelectPrimary = async () => {
  let wallets = await Sqlite.getWallets();
  wallets = wallets.map((wallet) => wallet.pkey);
  let keypairs: { publicKey: string; privateKey: string }[] = wallets.map(
    getKeypairFromPrivateKey
  );
  const ans = await inquirer.prompt({
    type: "list",
    name: "wallet",
    message: "Select wallet to make primary",
    choices: [...keypairs.map((k) => k.publicKey), "cancel"],
  });

  if (ans.wallet == "cancel") {
    return replyAndReturn(
      `
            ${chalk.green("INFO")} >> Moved to main menu
        `,
      SolanaWalletManager
    );
  }

  try {
    let keypair = keypairs.find((k) => k.publicKey == ans.wallet);
    await Sqlite.markPrimaryWallet(keypair.privateKey);
    replyAndReturn(
      `
            ${chalk.green("SUCCESS")} >> Wallet marked as primary
        `,
      SolanaWalletManager
    );
  } catch (e) {
    replyAndReturn(
      `
        ${chalk.red("INVALID")} >> Error while marking wallet: ${e.message}
    `,
      SolanaWalletManager
    );
  }
};

const FromAllToPrimary = async (
  primaryWallet: string,
  otherWallets: { pkey: string }[]
) => {
  try {
    console.clear();
    console.log(`${chalk.cyan("INFO")} Starting transfering SOL.`);

    for (let wallet of otherWallets) {
      let privKey58 = from_b58(wallet.pkey);
      let walletKeypair = web3.Keypair.fromSecretKey(privKey58);
      let rpcUrl = ConfigService.config.netUrl;
      let balance = await getBalance(walletKeypair.publicKey, "", rpcUrl);
      if (balance == 0) {
        console.log(
          `${chalk.cyan("INFO")} Skipping ${wallet.pkey}, balance equals zero`
        );
        continue;
      }
      await send(rpcUrl, wallet.pkey, balance - balance * 0.05, primaryWallet);
    }

    let ans = await inquirer
      .prompt({
        type: "confirm",
        name: "confirm",
        message: "Exit to menu  ?",
      })
      .then(() => {
        replyAndReturn(
          `
                ${chalk.green("SUCCESS")} >> Exit to main menu
            `,
          SolanaWalletManager
        );
      });
  } catch (e) {
    replyAndReturn(
      `
                ${chalk.green("SUCCESS")} >> Exit to main menu
            `,
      SolanaWalletManager
    );
    console.error(e);
  }
};

const FromPrimaryToAll = async (
  primaryWallet: string,
  otherWallets: { pkey: string }[]
) => {
  try {
    let privKey58 = from_b58(primaryWallet);
    let walletKeypair = web3.Keypair.fromSecretKey(privKey58);
    let rpcUrl = ConfigService.config.netUrl;
    let balance = await getBalance(walletKeypair.publicKey, "", rpcUrl);
    let availableBalance = balance - balance * 0.01;
    // await send()

    if (balance == 0) {
      return replyAndReturn(
        `${chalk.red("Failed")} | Balance equaals ZEOR`,
        SolanaWalletManager
      );
    }

    console.clear();
    console.log(balance);
    console.log(`${chalk.cyan("INFO")} Starting transfering SOL.`);

    for (let wallet of otherWallets) {
      try {
        await send(
          rpcUrl,
          primaryWallet,
          availableBalance / otherWallets.length,
          wallet.pkey
        );
        console.log(
          `${chalk.green("Successfuly")} transfered ${
            availableBalance / otherWallets.length
          } SOL`
        );
      } catch (e) {
        console.error(
          `${chalk.red("Invalid")} transfer to ${wallet.pkey} because ${
            e.message
          }`
        );
      }
    }

    let ans = await inquirer
      .prompt({
        type: "confirm",
        name: "confirm",
        message: "Exit?",
      })
      .then(() => {
        replyAndReturn(
          `
                ${chalk.green("SUCCESS")} >> Exit to main menu
            `,
          SolanaWalletManager
        );
      });
  } catch (e) {
    replyAndReturn(
      `
                ${chalk.green("SUCCESS")} >> Exit to main menu
            `,
      SolanaWalletManager
    );
    console.error(e);
  }
};

export const getKeypairFromPrivateKey = (privateKey) => {
  let privateKey58 = from_b58(privateKey);
  let keypair = web3.Keypair.fromSecretKey(privateKey58);
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: base58.encode(keypair.secretKey),
  };
};
