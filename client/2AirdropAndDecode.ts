import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  /* ---------- load secret key from wallet.json ---------- */
  const walletPath = path.resolve(process.cwd(), "wallet.json");
  if (!fs.existsSync(walletPath)) {
    throw new Error("wallet.json not found – run the generate script first.");
  }
  const secretBytes = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf8")));
  const kp = Keypair.fromSecretKey(secretBytes);

  /* ---------- save hex-encoded secret to walletString.json ---------- */
  const hexString = Buffer.from(secretBytes).toString("hex");
  const stringPath = path.resolve(process.cwd(), "walletString.json");
  fs.writeFileSync(stringPath, JSON.stringify({ secretKeyHex: hexString }, null, 2));

  console.log("📝  Saved hex secret key to", stringPath);
  console.log("🔑  Public key:", kp.publicKey.toBase58());

  /* ---------- request 2 SOL airdrop on devnet ---------- */
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  console.log("⛲  Requesting 2 SOL airdrop…");

  //const sig = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
  //await connection.confirmTransaction(sig, "confirmed");

  //console.log("✅  Airdrop confirmed! Signature:", sig);
}

main().catch((e) => {
  console.error("❌  Something went wrong:", e);
  process.exit(1);
});