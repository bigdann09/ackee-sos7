//-------------------------------------------------------------------------------
///
/// TASK: Implement the toggle lock functionality for the on-chain vault
///
/// Requirements:
/// - Toggle the locked state of the vault (locked becomes unlocked, unlocked becomes locked)
/// - Only the vault authority should be able to toggle the lock
/// - Emit a toggle lock event after successful state change
///
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::events::ToggleLockEvent;

#[derive(Accounts)]
pub struct ToggleLock<'info> {
    #[account(signer)]
    pub vault_authority: Signer<'info>,
    #[account(mut, has_one = vault_authority)]
    pub vault: Account<'info, Vault>
}

pub fn _toggle_lock(ctx: Context<ToggleLock>) -> Result<()> {
    let vault: &mut Account<Vault> = &mut ctx.accounts.vault;
    vault.locked = !vault.locked;

    emit!(ToggleLockEvent {
        vault: vault.key(),
        locked: vault.locked,
        vault_authority: vault.vault_authority
    });

    Ok(())
}