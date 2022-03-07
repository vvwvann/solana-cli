import { send, getKeyPair } from "../metaplex/commands/wallet";
import assert from "assert";
describe("wallet", () => {
  it("send", async function () {
    this.timeout(30000);
    const rpcUrl = "https://api.devnet.solana.com";
    const privKey =
      "3VY3VePVHEvfY2dcJ9wfUJRmrJFhVjmaTstH9LuhKijM2FJeVm5enU6ATKd4Gn7scwHTb5sjb3wZCY7fkYdaAL6g";
    await send(rpcUrl, privKey);
  });

  it("public key", () => {
    const privKey =
      "3VY3VePVHEvfY2dcJ9wfUJRmrJFhVjmaTstH9LuhKijM2FJeVm5enU6ATKd4Gn7scwHTb5sjb3wZCY7fkYdaAL6g";
    const pubKey = getKeyPair(privKey);

    assert.equal(
      pubKey.publicKey.toString(),
      "DeYWzqWAZEyYxCv7UJvMsGqiJtWqJ67Tz7ARW9xojMY8"
    );
  });
});
