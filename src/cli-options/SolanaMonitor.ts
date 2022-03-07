import { Wallet } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { getKeyPair } from "../metaplex/commands/wallet";
import getCandyMachineState from "../metaplex/get-candy-machine-state";
import ConfigService from "../services/ConfigService";
import { replyAndReturn } from "./_utils";


export const SolanaMonitor = async () => {
    let ans = await inquirer
        .prompt([
        {
            type: "input",
            name: "candy_address",
            message: "Please, provide candy machine address:nsfer from all to primary (or \"cancel\")",
            default: ConfigService.config.candyAddress
        }])

    if(!ans.candy_address) return replyAndReturn('Invalid candy address', SolanaMonitor)

    if(ans.candy_address == 'cancel') {
        ConfigService.init();
        return;
    }

    // ignore that
    let keypair = getKeyPair("3usoo4dAoSAr67MuV4jLDfyXCd8WMykCKdLsixo1NWav9mxVYko9e2x1xfJmKLfTUGnUDrKt3XJ5dxQr4y46EDc")
    
    try {
        let res = await getCandyMachineState(new Wallet(keypair), new PublicKey(ans.candy_address))
        .then(res => res.state);
        
        let txt = Object.keys(res).map(key => {
            return `${chalk.bold(key)}: ${res[key]}`
        }).join('\n');
        console.log(chalk.green.bold(`Analyzation Successful`))
        console.log(txt)
    } catch(e) {
        console.error(`${chalk.red(`Analyzation Failed`)}`)
    }

    ConfigService.init()

}