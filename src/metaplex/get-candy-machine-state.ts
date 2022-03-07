import { Wallet, web3 } from "@project-serum/anchor";
import ConfigService from "../services/ConfigService";
import * as anchor from '@project-serum/anchor'
import { PublicKey } from "@solana/web3.js";

const CANDY_MACHINE_PROGRAM = new PublicKey("cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ")

export default async (anchorWallet: Wallet, candyMachineId: web3.PublicKey) => {
    const connection = new web3.Connection(ConfigService.config.netUrl);
    const provider = new anchor.Provider(connection, anchorWallet, {
        preflightCommitment: 'processed',
    }); 
    const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider); 
    const program = new anchor.Program(idl!, CANDY_MACHINE_PROGRAM, provider);

    const state: any = await program.account.candyMachine.fetch(candyMachineId);
    const itemsAvailable = state.data.itemsAvailable.toNumber();
    const itemsRedeemed = state.itemsRedeemed.toNumber();
    const itemsRemaining = itemsAvailable - itemsRedeemed;

    return {
        id: candyMachineId,
        program,
        state: {
          itemsAvailable,
          itemsRedeemed,
          itemsRemaining,
          isSoldOut: itemsRemaining === 0,
          isActive: false,
          isPresale: false,
          isWhitelistOnly: false,
          goLiveDate: state.data.goLiveDate,
          treasury: state.wallet,
          tokenMint: state.tokenMint,
          gatekeeper: state.data.gatekeeper,
          endSettings: state.data.endSettings,
          whitelistMintSettings: state.data.whitelistMintSettings,
          hiddenSettings: state.data.hiddenSettings,
          price: state.data.price,
        },
      };
}