import { BN, Program, type ProgramAccount } from "@coral-xyz/anchor";
import { useAnchor } from "./useAnchor"
import { useCallback, useMemo, useState } from "react";
import RaffleIDL from '../lib/contract/raffle.json'
import type {Raffle as RaffleType} from '../lib/contract/raffle'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { generateRaffleID } from "../lib/utils";

export interface CreateRaffleParam {
    max_entries: number,
    ticket_prize: number
}

export interface Raffle {
    owner: PublicKey;
    raffleId: string;
    ticketPrice: BN;
    maxEntries: number;
    entries: number;
    isActive: boolean;
    isClaimed: boolean;
    winnerTicket: number | null;
    createdAt: BN;
    bump: number;
};


export interface Ticket {
    raffle: PublicKey,
    ticketId: number,
    owner: PublicKey,
    bump: number
}

export const useRaffle = () => {
    const provider = useAnchor();
    const program = useMemo(() => new Program(RaffleIDL as RaffleType, provider) as Program<RaffleType>, [provider]);
    const programId = useMemo(() => new PublicKey(RaffleIDL.address), []);

    const [isLoading, setIsLoading] = useState(false);
    const [raffles, setRaffles] = useState<ProgramAccount<Raffle>[] | undefined>()

    const fetchAllRaffles = useCallback(async () => {
        try {
            setIsLoading(true);

            const fetchedRaffles = await program.account.raffle.all();
            const sortedRaffles = fetchedRaffles.sort((a, b) => 
                b.account.createdAt.toNumber() - a.account.createdAt.toNumber()
            );

            setRaffles(sortedRaffles);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch raffles';
            console.error('❌ Error fetching raffles:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program])

    const fetchRaffle = useCallback(async (rafflePDA: PublicKey) => {
        return await program.account.raffle.fetch(rafflePDA);
    }, []);

    const fetchTicket = useCallback(async (ticketPDA: PublicKey) => {
        return await program.account.ticket.fetch(ticketPDA);
    }, []);

    const fetchTicketsForRaffle = useCallback(async (rafflePda: PublicKey) => {
    try {
      setIsLoading(true);

      const tickets = await program.account.ticket.all([
        {
          memcmp: {
            offset: 8,
            bytes: rafflePda.toBase58(),
          },
        },
      ]);

      return tickets as ProgramAccount<Ticket>[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      console.error('❌ Error fetching tickets:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [program]);

    const createRaffle = useCallback(async (params: CreateRaffleParam) => {
        try {
            setIsLoading(true);

            const raffleID = generateRaffleID();
            const ticketPrize = params.ticket_prize * LAMPORTS_PER_SOL
            const tx = await program.methods.createRaffle(
                raffleID,
                new BN(ticketPrize),
                params.max_entries
            )
            .accounts({ owner: provider.wallet.publicKey })
            .rpc();

            await fetchAllRaffles()
            return tx;
        } catch(err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create raffle';
            console.error('❌ Error creating raffle:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program])

    const buyTicket = useCallback(async (raffleId: string, ticketId: number, rafflePda: PublicKey) => {
        try {
            setIsLoading(true);
            
            ticketId = ticketId + 1;
            // Execute buy ticket transaction
            const tx = await program.methods
                .buyTicket(raffleId, ticketId)
                .accountsPartial({
                    buyer: provider.wallet.publicKey,
                    raffle: rafflePda,
                })
                .rpc();
            
            await fetchAllRaffles()
            console.log('🎫 Ticket purchased. Transaction:', tx);
            return tx;
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to buy ticket';
            console.error('❌ Error buying ticket:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program]);

    const pickWinner = useCallback(async (raffleId: string, rafflePda: PublicKey) => {
        try {
            setIsLoading(true);
            
            const tx = await program.methods
                .pickWinner(raffleId)
                .accounts({
                    owner: provider.wallet.publicKey,
                    raffle: rafflePda,
                })
                .rpc();
            
            await fetchAllRaffles()
            console.log('🏆 Winner picked. Transaction:', tx);
            return tx;
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create raffle';
            console.error('❌ Error creating raffle:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program]);

    const claimPrize = useCallback(async (raffleId: string, rafflePda: PublicKey, ticketPda: PublicKey) => {
        try {
            setIsLoading(true);
            
            const tx = await program.methods
                .claimPrize(raffleId)
                .accountsPartial({
                    winner: provider.wallet.publicKey,
                    ticket: ticketPda,
                    raffle: rafflePda,
                })
                .rpc();
            
            await fetchAllRaffles()
            console.log('🏆 Winner picked. Transaction:', tx);
            return tx;
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to pick winner';
            console.error('❌ Error picking winner:', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program]);

    const getRafflePDA = useCallback((owner: PublicKey, raffleID: string) => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("raffle"),
                owner.toBuffer(),
                Buffer.from(raffleID)
            ],
            programId
        )[0]
    }, [programId])

    const getTicketPDA = useCallback((raffle: PublicKey, ticketID: number) => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("ticket"),
                raffle.toBuffer(),
                new BN(ticketID).toArrayLike(Buffer, "le", 4)
            ],
            programId
        )[0]
    }, [programId])

    return {
        raffles,
        isLoading,
        
        getRafflePDA,
        getTicketPDA,

        fetchRaffle,
        fetchTicket,

        buyTicket,
        claimPrize,
        pickWinner,
        createRaffle,
        fetchAllRaffles,
        fetchTicketsForRaffle,
    }
}