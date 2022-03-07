import {
  mint_one_token,
  mint_multiple_tokens,
} from "../metaplex/candy-machine-v2-cli";

describe("minting", () => {
  it("mint_one", async function () {
    this.timeout(30000);
    const rpcUrl = "https://api.devnet.solana.com";
    const privKey =
      "3VY3VePVHEvfY2dcJ9wfUJRmrJFhVjmaTstH9LuhKijM2FJeVm5enU6ATKd4Gn7scwHTb5sjb3wZCY7fkYdaAL6g";
    await mint_one_token(
      "81yNUm79oDApyvgUn1nubQqMUFiUtGovFRYHknkrWcSn",
      privKey,
      rpcUrl
    );
  });

  it("mint_multiple_tokens", async function () {
    this.timeout(50000);
    const rpcUrl = "https://api.devnet.solana.com";
    const privKey =
      "3VY3VePVHEvfY2dcJ9wfUJRmrJFhVjmaTstH9LuhKijM2FJeVm5enU6ATKd4Gn7scwHTb5sjb3wZCY7fkYdaAL6g";
    await mint_multiple_tokens(
      "81yNUm79oDApyvgUn1nubQqMUFiUtGovFRYHknkrWcSn",
      privKey,
      rpcUrl,
      3
    );
  });
});
