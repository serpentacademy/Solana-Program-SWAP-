import { Keypair } from "@solana/web3.js";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Generates a new Solana keypair and saves it as wallet.json
 * in the project root. The file is compatible with `solana-keygen`.
 */
function main() {
  const kp = Keypair.generate();
  const secretKeyBytes = Array.from(kp.secretKey);        // number[]

  const outPath = path.resolve(process.cwd(), "wallet.json");
  fs.writeFileSync(outPath, JSON.stringify(secretKeyBytes));

  console.log("✅  Wallet written to", outPath);
  console.log("🔑  Public key:", kp.publicKey.toBase58());
}

main();