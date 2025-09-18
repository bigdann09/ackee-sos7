# Project Description

**Deployed Frontend URL:** [https://ackee-raffle-program.vercel.app/](https://ackee-raffle-program.vercel.app/)

**Solana Program ID:** 649vJ9q8JBKY7pvc5Uspwf6diESX4qKKjVQ1DTCubNQX

## Project Overview

### Description
A raffle system built on solana using anchor, designed to allow users to create, participate in, and manage raffles. The dApp enables users to create raffles, purchase tickets, pick winners, and claim prizes in a transparent, decentralized manner.  

### Key Features
- **Create Raffle**: Set up a raffle with a specified ticket price and maximum number of entries.
- **Buy Ticket**: Participate in active raffles by purchasing tickets using SOL.
- **Pick Winner**: Once a raffle reaches its maximum entries, the creator can select a winner.
- **Claim Prize**: The winner can claim the accumulated prize pool.
  
### How to Use the dApp
1. **Connect Wallet** - Connect the wallet of your choice to the dapp
2. **Create Raffle:** - Click on the "Create Raffle" button on the navigation to create a new raffle, if they're none on the dapp.
3. **Buy Ticket:** - Browse the list of active raffle that was not created by you and participate by buying tickets.
4. **Pick Winner:** - Return to the raffle card you created  and check if the raffle has reached its maximum entries (e.g., 100/100 entries). If so, a "Pick Winner" button will appear on the card.
5. **Claim Prize:** - Check the raffle card for a raffle you participated in where a winner has been selected (indicated by a winner’s address on the card). If you are the winner (your wallet address matches the winner’s address), a "Claim Prize" button will appear on the card to claim your rewards.
6. **View Raffle List and stats** - View all listed raffles on the dapps with their stats and state of each raffle.

## Program Architecture
The Counter dApp uses a simple architecture with two account type and four (4) core instructions. The program leverages PDAs to create unique Raffle accounts (seeded by owner and raffle ID) and Ticket accounts (seeded by raffle PDA and ticket ID), ensuring secure, isolated data for each raffle and participant.

### PDA Usage
**Raffle PDA:** - Creates a unique and deterministic raffle accounts for each user.
**Ticket PDA:** - Records of entries of tickets bought in a raffle holding the ticket buyer and the associated raffle account.

**PDAs Used:**
- **Raffle PDA**: Derived from seeds `["raffle", user_wallet_pubkey, raffle_id]` - ensures each user has a unique raffle account that only they can modify
- **Ticket PDA**: Derived from seeds `["ticket", raffle_pubkey, ticket_id]` - associate tickets to their raffles and uniqueness.

### Program Instructions
**Instructions Implemented:**
- **Create Raffle**: Creates a new raffle account for the user with unique raffle ids
- **Buy Ticket**: Participate in raffle by buying tickets by purchasing using SOL.
- **Pick Winner**: Raffle owner randomnly picks a single winner from the user entries.
- **Claim Prize**: Raffle winner claims the prize pool.

### Account Structure
```rust
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
```

```rust
#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub raffle: Pubkey,
    pub ticket_id: u32,
    pub owner: Pubkey,
    pub bump: u8
}
```

## Testing

### Test Coverage
[TODO: Describe your testing approach and what scenarios you covered]

**Happy Path Tests:**
- **Create Raffle**: Successfully creates a new raffle account with valid ticket price and max entries, verifying correct initialization of entries (0), maxEntries, ticketPrice, isActive (true), and owner.
- **Buy Ticket**: Successfully allows a user with sufficient funds to buy a ticket when raffle entries are below max entries, updating the raffle’s entry count and creating a ticket account with correct ticketId, raffle, and owner.
- **Pick Winner**: Successfully picks a winner when the raffle is full (entries equal max entries) and the correct owner calls the instruction, ensuring the winnerTicket matches a valid ticketId.
- **Claim Prize**: Successfully transfers the raffle pot to the winner’s wallet when the correct winner claims the prize, verifying the balance increase and correct account state updates.

**Unhappy Path Tests:**
- **Create Raffle with Zero Max Entries**: Fails when attempting to create a raffle with max entries set to zero, ensuring invalid raffle configurations are rejected.
- **Create Raffle with Zero Ticket Price**: Fails when attempting to create a raffle with a ticket price of zero, preventing invalid economic setups.
- **Buy Ticket with Insufficient Funds**: Fails when a user with insufficient SOL tries to buy a ticket, ensuring economic constraints are enforced.
- **Pick Winner with Insufficient Entries**: Fails when attempting to pick a winner before the raffle reaches max entries, ensuring winners are only selected for completed raffles. 
- **Pick Winner by Unauthorized User**: Fails when a non-owner tries to pick a winner, enforcing owner-only access for winner selection.
- **Claim Prize on Active Raffle or No Winner**: Fails when attempting to claim a prize for an active raffle or one without a selected winner, preventing premature or invalid claims.
- **Claim Prize by Invalid Winner**: Fails when a non-winner tries to claim the prize, ensuring only the legitimate winner can access the raffle pot.



### Running Tests
```bash
yarn install # install dependencies
solana-test-validator -r # Start local validator
solana airdrop 5 -k deploy-wallet.json
anchor test --skip-local-validator --skip-build # Run tests
```

### Additional Notes for Evaluators
Initially, I integrated Switchboard VRF for provably fair winner selection in the raffle dApp. However, I encountered persistent errors during testing and client integration. To ensure timely delivery and functionality, I pivoted to a pseudo-random number generator for the pickWinner instruction.
