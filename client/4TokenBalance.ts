
import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { getMint, getAccount } from "@solana/spl-token";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  /* ---------- load your wallet.json ---------- */
  const secret = Uint8Array.from(
    JSON.parse(fs.readFileSync(path.resolve("wallet.json"), "utf8"))
  );
  const wallet = Keypair.fromSecretKey(secret);

  /* ---------- constants you gave me ---------- */
  const TOKEN_ACCOUNT = new PublicKey(
    "2gSpYpC3Mruu4fSHy8VQwmWdtUuTHAK2j5D65cjeuWsL"
  );
  const MINT = new PublicKey(
    "HCfyWwHhWGVLYQE93sF7Amweh218Fs63iw8xMRrMY8zs"
  );

  /* ---------- connect to devnet ---------- */
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  /* ---------- fetch mint + account info ---------- */
  const [mintInfo, accountInfo] = await Promise.all([
    getMint(connection, MINT),
    getAccount(connection, TOKEN_ACCOUNT),
  ]);

  /* ---------- sanity check (optional) ---------- */
  if (!accountInfo.owner.equals(wallet.publicKey)) {
    console.warn(
      "⚠️  Note: token account owner ≠ wallet.json pubkey. Proceeding anyway."
    );
  }

  /* ---------- convert to UI amount ---------- */
  const raw = accountInfo.amount;                  // bigint (base units)
  const decimals = mintInfo.decimals;
  const uiAmount = Number(raw) / 10 ** decimals;   // human-readable

  /* ---------- output ---------- */
  console.log("Wallet      :", wallet.publicKey.toBase58());
  console.log("Token mint  :", MINT.toBase58(), `(decimals ${decimals})`);
  console.log("Token acct  :", TOKEN_ACCOUNT.toBase58());
  console.log(
    `Balance      : ${uiAmount.toLocaleString()} tokens  (${raw} base units)`
  );
}

main().catch((err) => {
  console.error("❌  Error:", err);
  process.exit(1);
});
