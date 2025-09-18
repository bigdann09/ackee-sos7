use anchor_lang::prelude::*;

use crate::{
    state::{Raffle, Ticket},
    error::RaffleError
};

#[derive(Accounts)]
#[instruction(raffle_id: String)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub winner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"raffle", raffle.owner.as_ref(), raffle_id.as_ref()],
        bump = raffle.bump
    )]
    pub raffle: Account<'info, Raffle>,
    #[account(
        mut,
        seeds = [b"ticket", raffle.key().as_ref(), &ticket.ticket_id.to_le_bytes()],
        bump = ticket.bump
    )]
    pub ticket: Account<'info, Ticket>,
    pub system_program: Program<'info, System>
}

pub fn claim_prize_handler(ctx: Context<ClaimPrize>, _raffle_id: String) -> Result<()> {
    let raffle: &mut Account<Raffle> = &mut ctx.accounts.raffle;
    let ticket: &mut Account<Ticket> = &mut ctx.accounts.ticket;
    
    require!(!raffle.is_active, RaffleError::RaffleNotActive);
    require!(raffle.winner_ticket.is_some(), RaffleError::WinnerNotChosen);

    if let Some(winner_ticket_id) = raffle.winner_ticket {
        require!(
            winner_ticket_id == ticket.ticket_id && 
            ticket.owner == ctx.accounts.winner.key(),
            RaffleError::InvalidWinner
        );
    }

    let prize_amount = raffle.ticket_price.checked_mul(raffle.entries as u64)
        .ok_or(RaffleError::MathOverflow)?;
    
    raffle.sub_lamports(prize_amount)?;
    ctx.accounts.winner.add_lamports(prize_amount)?;

    raffle.is_claimed = true;

    Ok(())
}