import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";

/* ── constants ─────────────────────────────────────────────── */
const PROGRAM_ID = new PublicKey("ktnDVvgC8yhd2QqU32shpSA3dRQCYjUJBM4wbUVTycD");
const MINT_ID    = new PublicKey("HCfyWwHhWGVLYQE93sF7Amweh218Fs63iw8xMRrMY8zs");

/* ── provider / payer ──────────────────────────────────────── */
const provider = anchor.AnchorProvider.env();   // uses ANCHOR_WALLET & _URL
anchor.setProvider(provider);
const payer    = (provider.wallet as anchor.Wallet).payer;
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

/* ── main ──────────────────────────────────────────────────── */
(async () => {
  /* 1. PDA that will own the vault */
  const [tokenAuthPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token-auth")],
    PROGRAM_ID,
  );

  /* 2. ATA address (allowOwnerOffCurve = true) */
  const vaultAta = getAssociatedTokenAddressSync(
    MINT_ID,
    tokenAuthPda,
    true,                    // PDA is off-curve
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("vault ATA =", vaultAta.toBase58());

  /* 3. Build the instruction manually */
  const ataIx = createAssociatedTokenAccountInstruction(
    payer.publicKey,         // rent payer
    vaultAta,                // new ATA
    tokenAuthPda,            // owner (off-curve PDA)
    MINT_ID,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  /* 4. Send the transaction once */
  const tx = new Transaction().add(ataIx);
  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("✅ ATA created in tx:", sig);
})();