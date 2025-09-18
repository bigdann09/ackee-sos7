use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Raffle {
    pub owner: Pubkey,
    #[max_len(30)]
    pub raffle_id: String,
    pub ticket_price: u64,
    pub max_entries: u32,
    pub entries: u32,
    pub is_active: bool,
    pub is_claimed: bool,
    pub winner_ticket: Option<u32>,
    pub created_at: i64,
    pub bump: u8,
}