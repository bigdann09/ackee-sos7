pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("649vJ9q8JBKY7pvc5Uspwf6diESX4qKKjVQ1DTCubNQX");

#[program]
pub mod raffle {
    use super::*;

    pub fn create_raffle(
        ctx: Context<CreateRaffle>,
        raffle_id: String,
        ticket_price: u64,
        max_entries: u32,
    ) -> Result<()> {
        create_raffle_handler(
            ctx,
            raffle_id,
            ticket_price,
            max_entries
        )
    }

    pub fn buy_ticket(
        ctx: Context<BuyTicket>,
        raffle_id: String,
        ticket_id: u32
    ) -> Result<()> {
        buy_ticket_handler(
            ctx,
            raffle_id,
            ticket_id
        )
    }

    pub fn pick_winner(
        ctx: Context<PickWinner>,
        raffle_id: String
    ) -> Result<()> {
        pick_winner_handler(
            ctx,
            raffle_id
        )
    }

    pub fn claim_prize(
        ctx: Context<ClaimPrize>,
        raffle_id: String
    ) -> Result<()> {
        claim_prize_handler(
            ctx,
            raffle_id
        )
    }
}
