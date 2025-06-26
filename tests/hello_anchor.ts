import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenSale } from "../target/types/token_sale";

describe("hello_anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.helloAnchor as Program<TokenSale>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.swap().rpc();
    console.log("Your transaction signature", tx);
  });
});
