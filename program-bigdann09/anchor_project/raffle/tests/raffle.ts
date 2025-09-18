import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Raffle } from '../target/types/raffle'
import { assert } from "chai";

describe("raffle", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const wallet = provider.wallet;
  const connection = provider.connection;
  const program = anchor.workspace.raffle as Program<Raffle>;

  const bob = anchor.web3.Keypair.generate();
  const john = anchor.web3.Keypair.generate();
  const alice = anchor.web3.Keypair.generate();

  describe("Create Raffle", async () => {
    it('Should fail if max entries is zero(0)', async () => {
      try {
        const raffleId = generateRaffleID()
        await program.methods.createRaffle(raffleId, new anchor.BN(1000000000), 0)
          .accounts({
            owner: wallet.publicKey
          })
          .signers([wallet.payer])
          .rpc();
          assert.fail("Reason: max entries is zero")
      } catch(error) {
        assert.ok(error)
      }
    });

    it('Should fail if ticket prize is zero(0)', async () => {
      try {
        const raffleId = generateRaffleID()
        await program.methods.createRaffle(raffleId, new anchor.BN(0), 2)
          .accounts({
            owner: wallet.publicKey
          })
          .signers([wallet.payer])
          .rpc();
          assert.fail("Reason: max entries is zero")
      } catch(error) {
        assert.ok(error)
      }
    });

    it('Should create raffle if ticket prize and max entries are valid', async () => {
      const raffleId = "dddjdjd"
      await program.methods.createRaffle(raffleId, new anchor.BN(10_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      const account = await program.account.raffle.fetch(getRafflePDA(wallet.publicKey, raffleId))
      assert.equal(account.entries, 0)
      assert.equal(account.maxEntries, 2)
      assert.equal(account.isActive, true)
      assert.equal(account.ticketPrice.toNumber(), 10_000_000)
      assert.equal(account.owner.toBase58(), wallet.publicKey.toBase58())
    });
  });

  describe("Buy Ticket", async () => {
    it("Should fail if alice has insufficient funds", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      try {
        await buyTicket(
          raffleId,
          getRafflePDA(wallet.publicKey, raffleId),
          alice
        )
        assert.fail("Reason: Alice has insufficient funds");
      } catch (error) {
        assert.ok(error)
      }
    });

    it("Should fail if raffle entries exceeds max entries", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      try {
        await buyTicket(
          raffleId,
          getRafflePDA(wallet.publicKey, raffleId),
          alice
        )

        await buyTicket(
          raffleId,
          getRafflePDA(wallet.publicKey, raffleId),
          bob
        )

        await buyTicket(
          raffleId,
          getRafflePDA(wallet.publicKey, raffleId),
          john
        )
        assert.fail("Reason: Entries exceeded max entries");
      } catch (error) {
        assert.ok(error)
      }
    });

    it("Should pass if alice has sufficient funds and raffle entries is below max entries", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      )

      const raffleAccount = await program.account.raffle.fetch(rafflePDA);
      assert.equal(raffleAccount.entries, 1)

      const ticketPDA = getTicketPDA(rafflePDA, raffleAccount.entries);
      const ticketAccount = await program.account.ticket.fetch(ticketPDA)
      assert.equal(ticketAccount.ticketId, 1)
      assert.equal(ticketAccount.raffle.toBase58(), rafflePDA.toBase58())
      assert.equal(ticketAccount.owner.toBase58(), alice.publicKey.toBase58())
    });
  });

  describe("Pick Winner", async () => {
    it("Should fail if entries is less than max entries", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      );

      try {
        await program.methods.pickWinner(raffleId)
          .accounts({
            owner: wallet.publicKey,
            raffle: rafflePDA
          })
          .signers([wallet.payer])
          .rpc();

        assert.fail("Reason: entries is below max entries");
      } catch (error) {
        assert.ok(error)
      }
    });

    it("Should fail if incorrect raffle wallet tries to pick winner", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      );

      // airdrop bob
      await airdrop(bob.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        bob
      );
      
      try {
        await program.methods.pickWinner(raffleId)
          .accounts({
            owner: alice.publicKey,
            raffle: rafflePDA
          })
          .signers([wallet.payer])
          .rpc();
          
        assert.fail("Reason: unauthorized action");
      } catch (error) {
        assert.ok(error)
      }
    });

    it("Should pass if all conditions are met", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      );

      // airdrop bob
      await airdrop(bob.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        bob
      );
      
      await program.methods.pickWinner(raffleId)
        .accounts({
          owner: wallet.publicKey,
          raffle: rafflePDA
        })
        .signers([wallet.payer])
        .rpc();

      // raffle account
      const raffleAccount = await program.account.raffle.fetch(rafflePDA);
        
      const ticketPDA = getTicketPDA(rafflePDA, raffleAccount.winnerTicket);
      const ticketAccount = await program.account.ticket.fetch(ticketPDA)
      assert.equal(raffleAccount.winnerTicket, ticketAccount.ticketId);
    });
  });

  describe("Claim Prize", async () => {
    it("Should fail if raffle is active and no winner has been picked", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      );

      // airdrop bob
      await airdrop(bob.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        bob
      );

      // raffle account
      const raffleAccount = await program.account.raffle.fetch(rafflePDA);
      
      // ticket PDA
      const ticketPDA = getTicketPDA(rafflePDA, raffleAccount.entries);

      try {
        await program.methods.claimPrize(raffleId)
          .accountsPartial({
            winner: alice.publicKey,
            ticket: ticketPDA,
            raffle: rafflePDA
          })
          .signers([alice])
          .rpc()
          assert.fail("Reason: Raffle account is still active and winner was not picked");
      } catch(error) {
        assert.ok(error);
      }
    });

    it("Should fail if invalid winner tries to claim", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(100_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      );

      // airdrop bob
      await airdrop(bob.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        bob
      );

      await program.methods.pickWinner(raffleId)
        .accounts({
          owner: wallet.publicKey,
          raffle: rafflePDA
        })
        .signers([wallet.payer])
        .rpc();

      const raffleAccount = await program.account.raffle.fetch(rafflePDA);
      const ticketPDA = getTicketPDA(rafflePDA, raffleAccount.entries);

      try {
        const invalidUser = raffleAccount.winnerTicket == 1 ? bob : alice
        await program.methods.claimPrize(raffleId)
          .accountsPartial({
            winner: invalidUser.publicKey,
            ticket: ticketPDA,
            raffle: rafflePDA
          })
          .signers([invalidUser])
          .rpc()
          assert.fail("Reason: Invalid raffle winner");
      } catch(error) {
        assert.ok(error);
      }
    });

    it("Should pass if all conditions are met", async () => {
      const raffleId = generateRaffleID()
      await program.methods.createRaffle(raffleId, new anchor.BN(2_000_000_000), 2)
        .accounts({
          owner: wallet.publicKey
        })
        .signers([wallet.payer])
        .rpc();

      // raffle pda
      const rafflePDA = getRafflePDA(wallet.publicKey, raffleId)

      // airdrop alice
      await airdrop(alice.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        alice
      );

      // airdrop bob
      await airdrop(bob.publicKey)
      await buyTicket(
        raffleId,
        rafflePDA,
        bob
      );

      await program.methods.pickWinner(raffleId)
        .accounts({
          owner: wallet.publicKey,
          raffle: rafflePDA
        })
        .signers([wallet.payer])
        .rpc();

      const raffleAccount = await program.account.raffle.fetch(rafflePDA);
      const ticketPDA = getTicketPDA(rafflePDA, raffleAccount.winnerTicket);
      const ticketAccount = await program.account.ticket.fetch(ticketPDA);

      const signer = ticketAccount.owner.toBase58() == alice.publicKey.toBase58() ? alice : bob;

      const winnerBalanceBefore = await connection.getBalance(ticketAccount.owner);
      
      await program.methods.claimPrize(raffleId)
          .accountsPartial({
            winner: ticketAccount.owner,
            ticket: ticketPDA,
            raffle: rafflePDA
          })
          .signers([signer])
          .rpc()

      const winnerBalanceAfter = await connection.getBalance(ticketAccount.owner);
      assert.isTrue(winnerBalanceAfter > winnerBalanceBefore)
    });
  });

  function getRafflePDA(owner: anchor.web3.PublicKey, raffleID: string) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        owner.toBuffer(),
        Buffer.from(raffleID)
      ],
      program.programId
    )[0]
  }

  function getTicketPDA(raffle: anchor.web3.PublicKey, ticketID: number) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("ticket"),
        raffle.toBuffer(),
        new anchor.BN(ticketID).toArrayLike(Buffer, "le", 4)
      ],
      program.programId
    )[0]
  }

  async function buyTicket(raffleID: string, raffle: anchor.web3.PublicKey, buyer: anchor.web3.Keypair) {
    const raffleAccount = await program.account.raffle.fetch(raffle);
    const ticketID = raffleAccount.entries + 1;
    await program.methods.buyTicket(raffleID, ticketID)
      .accountsPartial({
        buyer: buyer.publicKey,
        raffle,
      })
      .signers([buyer])
      .rpc();
  }

  async function airdrop(to: anchor.web3.PublicKey, lamports: number = 1000e9) {
    await connection.confirmTransaction(
      await connection.requestAirdrop(to, lamports)
    );
  }

  function generateRaffleID(length: number = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }

    return result;
}
});
