use anchor_lang::{
    prelude::*,
    solana_program::hash::hash
};

use crate::{
    state::Raffle,
    error::RaffleError
};

#[derive(Accounts)]
#[instruction(raffle_id: String)]
pub struct PickWinner<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        seeds = [b"raffle", owner.key().as_ref(), raffle_id.as_ref()],
        bump = raffle.bump
    )]
    pub raffle: Account<'info, Raffle>
}

pub fn pick_winner_handler(
    ctx: Context<PickWinner>,
    raffle_id: String,
) -> Result<()> {
    let raffle: &mut Account<Raffle> = &mut ctx.accounts.raffle;
    let clock: Clock = Clock::get()?;

    require!(raffle.is_active, RaffleError::RaffleNotActive);
    require!(raffle.entries == raffle.max_entries, RaffleError::EntriesNotFull);
    
    require!(raffle.winner_ticket.is_none(), RaffleError::WinnerChosen);

    let hash_bytes = hash(&[
        &clock.unix_timestamp.to_be_bytes(),
        &clock.slot.to_be_bytes(),
        raffle_id.as_bytes()
    ].concat()).to_bytes();
    
    // Fix 2: Use only the first 8 bytes and avoid overflow-prone operations
    let random_seed = u64::from_le_bytes(
        <[u8; 8]>::try_from(&hash_bytes[..8]).unwrap()
    );

    let winner_ticket = ((random_seed % raffle.max_entries as u64) + 1) as u32;
    
    raffle.is_active = false;
    raffle.winner_ticket = Some(winner_ticket);
    msg!("winner id: {}", winner_ticket);

    Ok(())
}