use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub raffle: Pubkey,
    pub ticket_id: u32,
    pub owner: Pubkey,
    pub bump: u8
}