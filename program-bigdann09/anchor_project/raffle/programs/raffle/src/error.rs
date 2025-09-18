use anchor_lang::prelude::*;

#[error_code]
pub enum RaffleError {
    #[msg("Invalid ticket price. Must be greater than zero.")]
    InvalidTicketPrice,
    #[msg("Invalid maximum entries. Must be greater than zero.")]
    InvalidMaxEntries,
    #[msg("Raffle is not active.")]
    RaffleNotActive,
    #[msg("Raffle has already been claimed.")]
    RaffleAlreadyClaimed,
    #[msg("No entries in the raffle.")]
    NoEntries,
    #[msg("Unauthorized action.")]
    Unauthorized,
    #[msg("Winner has already been selected.")]
    WinnerAlreadySelected,
    #[msg("Raffle is sold out.")]
    RaffleSoldOut,
    #[msg("Insufficient funds to buy ticket.")]
    InsufficientFunds,
    #[msg("Entries not full")]
    EntriesNotFull,
    #[msg("Raffle winner already chosen")]
    WinnerChosen,
    #[msg("Raffle winner not chosen")]
    WinnerNotChosen,
    #[msg("Invalid winner")]
    InvalidWinner,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Random number generation failed")]
    RandomNumberGenerationFailed
}
