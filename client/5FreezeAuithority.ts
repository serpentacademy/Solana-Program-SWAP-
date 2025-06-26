import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  setAuthority,
  AuthorityType,
  TOKEN_PROGRAM_ID,          // legacy Token-v1
  TOKEN_2022_PROGRAM_ID,     // if your mint lives on the new Token-2022 program
} from "@solana/spl-token";
import { readFileSync } from "fs";



let token= {
  tokenAddress: new PublicKey("HCfyWwHhWGVLYQE93sF7Amweh218Fs63iw8xMRrMY8zs"),
  tokenAccount: new PublicKey("2gSpYpC3Mruu4fSHy8VQwmWdtUuTHAK2j5D65cjeuWsL")
}

// RPC endpoint and commitment level
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// The mint you want to modify
const MINT = token.tokenAddress

// ---------- 1.  Load wallet.json ----------
// wallet.json must contain the 64-byte secret-key array, e.g.
//   [12,34, … , 99]
const raw = readFileSync("./wallet.json", "utf8");   // adjust path if needed
const secretKey = Uint8Array.from(JSON.parse(raw));  // -> Uint8Array(64)

// ---------- 2.  Derive Keypair ----------
const freezeAuthority = Keypair.fromSecretKey(secretKey);


// Fee payer – often the same keypair
const payer = freezeAuthority;



// Pick the right program-ID
const PROGRAM_ID = TOKEN_PROGRAM_ID;          // or TOKEN_2022_PROGRAM_ID


(async () => {
  const sig = await setAuthority(
    connection,
    payer,                     // pays fees
    MINT,                      // account whose authority you’re changing
    freezeAuthority,           // current authority (signer)
    AuthorityType.FreezeAccount,
    null,                      // <<< this permanently removes it
    [],                        // multisig signers (if any)
    undefined,                 // confirmOptions
    PROGRAM_ID                 // token program to target
  );

  console.log("Freeze authority removed. Tx:", sig);
})();