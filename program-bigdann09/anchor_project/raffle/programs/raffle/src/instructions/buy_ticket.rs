use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction::transfer},
};

use crate::{
    state::{Raffle, Ticket},
    error::RaffleError,
};

#[derive(Accounts)]
#[instruction(raffle_id: String, ticket_id: u32)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        init,
        payer = buyer,
        space = 8 + Ticket::INIT_SPACE,
        seeds = [b"ticket", raffle.key().as_ref(), &ticket_id.to_le_bytes()],
        bump,
    )]
    pub ticket: Account<'info, Ticket>,
    #[account(
        mut,
        seeds = [b"raffle", raffle.owner.as_ref(), raffle_id.as_ref()],
        bump = raffle.bump
    )]
    pub raffle: Account<'info, Raffle>,
    pub system_program: Program<'info, System>
}

pub fn buy_ticket_handler(
    ctx: Context<BuyTicket>,
    _raffle_id: String,
    _ticket_id: u32,
) -> Result<()> {
    let raffle: &mut Account<Raffle> = &mut ctx.accounts.raffle;

    require!(raffle.is_active, RaffleError::RaffleNotActive);
    require!(raffle.entries < raffle.max_entries, RaffleError::RaffleSoldOut);

    require!(
        ctx.accounts.buyer.lamports() >= raffle.ticket_price,
        RaffleError::InsufficientFunds
    );

    msg!("Transferring {} lamports from buyer to raffle", raffle.ticket_price);
    invoke(
        &transfer(
            &ctx.accounts.buyer.key(),
            &raffle.key(),
            raffle.ticket_price,
        ),
        &[
            ctx.accounts.buyer.to_account_info(),
            raffle.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    let ticket_id = raffle.entries + 1;
    ctx.accounts.ticket.set_inner(Ticket {
        raffle: raffle.key(),
        ticket_id,
        owner: ctx.accounts.buyer.key(),
        bump: ctx.bumps.ticket,
    });
    msg!("Ticket {} purchased successfully", ticket_id);

    // Update raffle state
    raffle.entries += 1;

    Ok(())
}