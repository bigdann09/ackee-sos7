import type { ProgramAccount } from "@coral-xyz/anchor"
import { type Raffle, type Ticket } from "../hooks/useRaffle"
import { formatAddress } from "../utils/helper"
import { useEffect, useState, type FC } from "react"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import toast from "react-hot-toast"
import { useWallet } from "@solana/wallet-adapter-react"

interface CardProps {
    raffle: ProgramAccount<Raffle>,
    showSuccessToast: (message: string, tx: string) => void,
    buyTicket: (raffleId: string, ticketId: number, rafflePda: PublicKey) => Promise<string>,
    pickWinner: (raffleId: string, rafflePda: PublicKey) => Promise<string>,
    claimPrize: (raffleId: string, rafflePda: PublicKey, ticketPda: PublicKey) => Promise<string>,
    getTicketPDA: (raffle: PublicKey, ticketID: number) => PublicKey,
    fetchTicket: (ticketPDA: PublicKey) => Promise<Ticket>,
    fetchTicketsForRaffle: (rafflePda: PublicKey) => Promise<ProgramAccount<Ticket>[]>   
}

export const Card: FC<CardProps> = ({ 
    raffle,
    showSuccessToast,
    buyTicket,
    pickWinner,
    claimPrize,
    getTicketPDA,
    fetchTicket,
    fetchTicketsForRaffle
}) => {
    const { publicKey } = useWallet()

    const [isLoading, setIsLoading] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [winnerTicketAccount, setWinnerTicketAccount] = useState<Ticket>();
    const [hasPurchasedTicket, setHasPurchasedTicket] = useState(false);

    const {
        owner,
        raffleId,
        ticketPrice,
        maxEntries,
        entries,
        isActive,
        isClaimed,
        winnerTicket,
    } = raffle.account;

    const ticketPriceSOL = ticketPrice.toNumber() / LAMPORTS_PER_SOL;
    const rafflePotSOL = (ticketPrice.toNumber() * entries) / LAMPORTS_PER_SOL;
    const progress = (entries / maxEntries) * 100;
    const spotsLeft = maxEntries - entries;

    const canBuyTickets = isActive && entries < maxEntries && !publicKey?.equals(owner) && !hasPurchasedTicket;
    const canPickWinner = isActive && entries === maxEntries && !winnerTicket && publicKey?.equals(owner);
    const canClaimPrize = !isActive && !!winnerTicket && !isClaimed && isWinner;

    useEffect(() => {
        let isMounted = true;

        const checkUserTicket = async () => {
            if (!publicKey || !isActive) return;

            try {
                const tickets = await fetchTicketsForRaffle(raffle.publicKey);
                const userTicket = tickets.find((ticket) =>
                    ticket.account.owner.equals(publicKey)
                );

                if (isMounted) {
                    setHasPurchasedTicket(!!userTicket);
                }
            } catch (err) {
                toast.error("❌ Failed to fetch tickets: " + (err as Error).message);
            }
        };

        checkUserTicket();

        return () => {
            isMounted = false;
        };
    }, [publicKey, raffle.publicKey, isActive, fetchTicketsForRaffle]);

    useEffect(() => {
        let isMounted = true;

        const fetchWinner = async () => {
            if (!winnerTicket || (!isActive && !isClaimed && !publicKey)) return;

            try {
                const ticketPDA = await getTicketPDA(raffle.publicKey, winnerTicket);
                const ticketAccount = await fetchTicket(ticketPDA);

                if (!isMounted) return;

                setWinnerTicketAccount(ticketAccount);

                if (publicKey && ticketAccount.owner.equals(publicKey)) {
                    setIsWinner(true);
                } else {
                    setIsWinner(false);
                }
            } catch (err) {
                toast.error("❌ Failed to fetch winner ticket:" + (err as Error).message);
            }
        };

        fetchWinner();

        return () => {
            isMounted = false;
        };
    }, [winnerTicket, isActive, isClaimed, publicKey, raffle.publicKey]);

    useEffect(() => {
        if (winnerTicket && !isActive) {
            (async () => {
                const ticketPDA = await getTicketPDA(raffle.publicKey, winnerTicket);
                const winnerTicketAccount = await fetchTicket(ticketPDA)
                setWinnerTicketAccount(winnerTicketAccount)
            })()
        }
    }, [winnerTicket, isActive])

    const handleBuyTicket = async () => {
        try {
            setIsLoading(true)
            const tx = await buyTicket(raffleId, entries, raffle.publicKey);
            showSuccessToast('Raffle ticket bought successfully', tx);
        } catch (error) {
            console.error('Error buying ticket:', error);
            toast.error('Failed to buy ticket: ' + (error as Error).message);
        } finally {
            setIsLoading(false)
        }
    };

    const handlePickWinner = async () => {
        try {
            setIsLoading(true)
            const tx = await pickWinner(raffleId, raffle.publicKey);
            showSuccessToast('Raffle winner picked successfully', tx);
        } catch (error) {
            console.error('Error picking winner:', error);
            toast.error('Failed to pick winner: ' + (error as Error).message);
        } finally {
            setIsLoading(false)
        }
    };
    
    const handleClaimPrize = async () => {
        try {
            setIsLoading(true)
            if (!winnerTicket) return toast.error('Winner not chosen')
            const ticketPDA = await getTicketPDA(raffle.publicKey, winnerTicket);
            const tx = await claimPrize(raffleId, raffle.publicKey, ticketPDA);
            showSuccessToast('Prize claimed successfully', tx);
        } catch (error) {
            console.error('Error claiming prize: ', error);
            toast.error('Failed to claim prize: ' + (error as Error).message);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 shadow-md hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center">
                <div className="flex items-center text-sm gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-wallet-icon lucide-wallet stroke-amber-500"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                    <h4>Creator</h4>
                </div>
                <span className="text-xs border border-neutral-800 rounded-full p-1 px-2">{formatAddress(owner.toBase58())}</span>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-md flex justify-between items-center my-6 p-3">
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ticket-icon lucide-ticket stroke-amber-500">
                        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                        <path d="M13 5v2"/>
                        <path d="M13 17v2"/>
                        <path d="M13 11v2"/>
                    </svg>
                    <span className="text-sm">Ticket</span>
                </div>
                <div className="flex gap-1">
                    <span className="text-lg font-semibold">{ticketPriceSOL.toFixed(2)}</span>
                    <span className="text-xs self-end">SOL</span>
                </div>
            </div>

            <div className="mt-4 py-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users-icon lucide-users stroke-amber-500">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                        <span>Entries</span>
                    </div>
                    <span>{entries}/{maxEntries}</span>
                </div>
                <div className="w-full bg-neutral-950 h-[.5rem] mt-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-xs pt-2 flex justify-between">
                    <span>{progress.toFixed(1)}% filled</span>
                    <span>{spotsLeft} spots left</span>
                </div>
            </div>

            {winnerTicket && winnerTicketAccount?.owner && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-md my-6 p-3 flex items-center justify-between">
                    <div className="flex gap-x-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy-icon lucide-trophy stroke-amber-500"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>
                        <span>Winner</span>
                    </div>
                    <span className="text-xs border border-amber-500/20 rounded-full p-1 px-2">{formatAddress(winnerTicketAccount!.owner!.toBase58(), 8)}</span>
                </div>
            )}

            <div className="mt-4">
                <div className="flex gap-1 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-coins-icon lucide-coins stroke-amber-500">
                        <circle cx="8" cy="8" r="6"/>
                        <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
                        <path d="M7 6h1v4"/>
                        <path d="m16.71 13.88.7.71-2.82 2.82"/>
                    </svg>
                    <span className="text-sm">Raffle Pot</span>
                </div>
                <div className="flex gap-1">
                    <span className="text-2xl font-semibold">{rafflePotSOL.toFixed(3)}</span>
                    <span className="text-sm self-end">SOL</span>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {canBuyTickets && (
                    <button 
                        className="w-full bg-amber-500 text-white rounded-md py-2 hover:bg-amber-600 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleBuyTicket}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Buying...' : 'Buy Ticket'}
                    </button>
                )}

                {canPickWinner && (
                    <button
                        className="w-full bg-amber-500 text-white rounded-md py-2 hover:bg-amber-600 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handlePickWinner}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Picking Winner...' : 'Pick Winner'}
                    </button>
                )}

                {canClaimPrize && (
                    <button
                        className="w-full bg-amber-500 text-white rounded-md py-2 hover:bg-amber-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleClaimPrize}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Claiming...' : 'Claim Prize'}
                    </button>
                )}
            </div>
        </div>
    )
}