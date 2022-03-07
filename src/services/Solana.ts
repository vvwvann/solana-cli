import { Connection, PublicKey } from "@solana/web3.js";
import chalk from "chalk";

import { TOKEN_PROGRAM_ID } from "../metaplex/helpers/constants";

class Solana {
  private _connection: Connection;

  private _onError() {}

  connect(url: string) {
    this._connection = new Connection(url);
    const msg = `Connected to ${url}`;
    console.log(chalk.cyan(msg));
  }

  get connection() {
    return this._connection;
  }

  async checkToken(address: PublicKey, tokenAddress: PublicKey) {
    // console.log(
    //   `Solana >> Checking ${tokenAddress.toString()} for ${address.toString()}`
    // );

    try {
      const tokens = (
        await this._connection.getTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
          mint: tokenAddress,
        })
      ).value;

      if (tokens.length > 0) {
        // console.log(
        //   `Solana >> Checked ${tokenAddress.toString()}! Account really has ${address.toString()}`
        // );
        return true;
      }
      // console.log(
      //   `Solana >> Checked ${tokenAddress.toString()}! Account really hasnt ${address.toString()}`
      // );
      return false;
    } catch (e) {
      // console.log(
      //   `Solana >> Checked ${tokenAddress.toString()}! Account really has'nt ${address.toString()}`
      // );
      return false;
    }
  }
}

export default new Solana();
