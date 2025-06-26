import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  /* ---------- Load the wallet ---------- */
  const secret = Uint8Array.from(
    JSON.parse(fs.readFileSync(path.resolve("wallet.json"), "utf8"))
  );
  const payer = Keypair.fromSecretKey(secret);

  /* ---------- Connect to devnet ---------- */
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  /* ---------- Create the mint ---------- */
  const decimals = 9; // standard SPL‐ERC20 style
  const mint = await createMint(
    connection,
    payer,                 // rent-payer + tx signer
    payer.publicKey,       // mint authority
    payer.publicKey,       // freeze authority
    decimals
  );

  /* ---------- Create / fetch our ATA ---------- */
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey        // token owner
  );

  /* ---------- Mint 1 billion whole tokens ---------- */
  const wholeTokens = 1_000_000_000n; // 1 B
  const amount = wholeTokens * 10n ** BigInt(decimals); // base units
  await mintTo(connection, payer, mint, ata.address, payer, amount);

  /* ---------- Persist addresses for later ---------- */
  const out = {
    tokenAddress: mint.toBase58(),
    tokenAccount: ata.address.toBase58(),
  };
  fs.writeFileSync("token.json", JSON.stringify(out, null, 2));

  console.log("✅  Mint created:", out.tokenAddress);
  console.log("🏦  Your token account:", out.tokenAccount);
  console.log("💰  Initial supply (base units):", amount.toString());
}

main().catch((err) => {
  console.error("❌  Error:", err);
  process.exit(1);
});