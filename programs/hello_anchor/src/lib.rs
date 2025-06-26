use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

/* ───────────────────────────── constants ───────────────────────────── */
declare_id!("Az5z7oWzyithG4aQRp3wDuEpdeiVfSqPf86eT6KEcieY");

/// fixed payout wallet (receives the 0.02 SOL)
pub const PAYOUT:   Pubkey = pubkey!("J8W7cSvV3iEcBFVuFPMHPHPbo7bHCrhRymyjsQ7eEcEP");

/// program’s vault token-account (authority = PDA “token-auth”)
pub const VAULT_TA: Pubkey = pubkey!("8rLKLZpiHv4qBvGeoxR5fD1UKfzY7ML6ebDENXRPUv2j");

const PRICE_LAMPORTS: u64 = 20_000_000;  // 0.02 SOL
const HALF_NUM: u64 = 5;                 // 0.5 = 5 ÷ 10
const HALF_DEN: u64 = 10;

/* ───────────────────────────── program ─────────────────────────────── */
#[program]
pub mod token_sale {
    use super::*;

    pub fn swap(ctx: Context<Swap>) -> Result<()> {
        /* 1️⃣ pull 0.02 SOL from the caller, forward to payout wallet */
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.buyer.key(),
                &ctx.accounts.payout.key(),
                PRICE_LAMPORTS,
            ),
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.payout.to_account_info(),
            ],
        )?;

        /* 2️⃣ send 0.5 tokens from vault → buyer_ata */
        let decimals = ctx.accounts.mint.decimals;
        let amount = HALF_NUM * 10u64.pow(decimals as u32) / HALF_DEN;

        /* signer seeds must out-live the CPI */
        let auth_seed_slice: &[&[u8]] = &[b"token-auth", &[ctx.bumps.token_auth]];
        let signer_seeds: &[&[&[u8]]] = &[auth_seed_slice];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.vault.to_account_info(),
                to:        ctx.accounts.buyer_ata.to_account_info(),
                authority: ctx.accounts.token_auth.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

/* ───────────────────────────── accounts ────────────────────────────── */
#[derive(Accounts)]
pub struct Swap<'info> {
    /* caller who pays 0.02 SOL and receives 0.5 tokens */
    #[account(mut)]
    pub buyer: Signer<'info>,

    /* fixed payout wallet */
    #[account(mut, address = PAYOUT)]
    pub payout: SystemAccount<'info>,

    /* PDA = ["token-auth"] (no data) */
    #[account(seeds = [b"token-auth"], bump)]
    /// CHECK: signer-only PDA
    pub token_auth: UncheckedAccount<'info>,

    /* program vault token-account */
    #[account(
        mut,
        address          = VAULT_TA,
        token::authority = token_auth,
        token::mint      = mint
    )]
    pub vault: Account<'info, TokenAccount>,

    /* destination ATA for the buyer (created if needed) */
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint      = mint,
        associated_token::authority = buyer
    )]
    pub buyer_ata: Account<'info, TokenAccount>,

    /* SPL-token mint held by the vault */
    pub mint: Account<'info, Mint>,

    /* programs & sysvars */
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
