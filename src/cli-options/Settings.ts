import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import ConfigService from "../services/ConfigService";
import { replyAndReturn } from "./_utils";

export const Settings = async () => {
    let ans = await inquirer.prompt([
        {
            type: "list",
            name: "opt",
            choices: [
                '1. Minting transactions timeout',
                '2. Custom RPC',
                '3. Discord Webhook',
                '4. Edit runtime options',
                '5. Go to main menu'
            ]
        }
    ])

    switch(ans.opt[0]) {
        case '5': 
            ConfigService.init();
            break;
        case '1': 
            changeMintTimeout();
            break;
        case '2': 
            changeRPC();
            break;
        case '3': 
            ConfigService.init();
            break;
        case '4': 
            ConfigService.overwriteConfig();
            break;
    }
}

const changeMintTimeout = async () => {
    let ans = await inquirer.prompt([
        {
            type: "input",
            name: "value",
            message: "Input minting transactions timeout (in ms)",
            default: 15000
        }
    ]);

    try {
        let int = parseInt(ans.value);
        await editConfigJson('timeout', int)
        return replyAndReturn(`${chalk.green('SUCCESS')} Saved`, Settings)
    } catch(e) {
        return replyAndReturn(`${chalk.red('INVALID')} Failed to save value`, Settings)
    }
}

const changeRPC = async () => {
    let ans = await inquirer.prompt([
        {
            type: "input",
            name: "value",
            message: "Input RPC",
            default: ConfigService.config.netUrl
        }
    ]);

    try {
        await editConfigJson('APIEndpoint', ans.value);
        ConfigService.config.netUrl = ans.value;
        return replyAndReturn(`${chalk.green('SUCCESS')} Saved`, Settings)
    } catch(e) {
        return replyAndReturn(`${chalk.red('INVALID')} Failed to save value`, Settings)
    }
}


let editConfigJson = async (key, value) => {
    let file = JSON.parse(readFileSync(__dirname + '/../config.json', 'utf8'));
    file[key] = value;
    await writeFileSync(__dirname + '/../config.json', JSON.stringify(file, null, '\t'))
}
// editConfigJson('APIEndpoint', '123');