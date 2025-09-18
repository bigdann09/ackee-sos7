use anchor_lang::prelude::*;

use crate::{
    error::RaffleError,
    state::Raffle,
};

#[derive(Accounts)]
#[instruction(raffle_id: String)]
pub struct CreateRaffle<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + Raffle::INIT_SPACE,
        seeds = [b"raffle", owner.key().as_ref(), raffle_id.as_ref()],
        bump,
    )]
    pub raffle: Account<'info, Raffle>,
    pub system_program: Program<'info, System>
}

pub fn create_raffle_handler(
    ctx: Context<CreateRaffle>,
    raffle_id: String,
    ticket_price: u64,
    max_entries: u32,
) -> Result<()> {
    require!(ticket_price > 0, RaffleError::InvalidTicketPrice);
    require!(max_entries > 0, RaffleError::InvalidMaxEntries);

    ctx.accounts.raffle.set_inner(Raffle {
        owner: ctx.accounts.owner.key(),
        raffle_id,
        ticket_price,
        max_entries,
        entries: 0,
        is_active: true,
        is_claimed: false,
        winner_ticket: None,
        created_at: Clock::get()?.unix_timestamp,
        bump: ctx.bumps.raffle,
    });

    Ok(())
}
