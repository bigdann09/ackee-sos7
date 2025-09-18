import React, { useState, type FC } from "react"
import { Link } from "react-router-dom"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { toast } from "react-hot-toast"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from "@solana/wallet-adapter-react"
import { type CreateRaffleParam } from "../hooks/useRaffle"

interface NavigationProps {
    createRaffle: (params: CreateRaffleParam) => Promise<string>,
    showSuccessToast: (message: string, tx: string) => void,
}

export const Navigation: FC<NavigationProps> = ({ createRaffle, showSuccessToast }) => {
    const { connected } = useWallet()
    const [openModal, setOpenModal] = useState(false)

    return (
        <>
            {openModal && <CreateRaffleModal 
                setOpenModal={setOpenModal}
                createRaffle={createRaffle}
                showSuccessToast={showSuccessToast}
            />}
            <nav className="flex justify-between items-center h-[4rem] bg-neutral-900 rounded-md px-4">
                <Link to="/">RafflePot</Link>
                <div className="flex items-center gap-x-2">
                    <WalletMultiButton />
                    {connected && (
                        <button
                        onClick={() => setOpenModal(true)}
                        className="flex items-center gap-1 border border-neutral-700 rounded-full py-2 px-2 text-sm cursor-pointer hover:bg-neutral-950 duration-300 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <span>Create Raffle</span>
                    </button>
                    )}
                </div>
            </nav>
        </>
    )
}

interface RafflePayload {
    maxEntries: number;
    ticketPrize: number;
}

const CreateRaffleModal = ({
    setOpenModal,
    createRaffle,
    showSuccessToast
}: {
    setOpenModal: (bool: boolean) => void,
    createRaffle: (params: CreateRaffleParam) => Promise<string>,
    showSuccessToast: (message: string, tx: string) => void,
}) => {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<RafflePayload>({
        maxEntries: 0,
        ticketPrize: 0
    })

    async function createRaffleHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (data.maxEntries <= 0) {
            toast.error("Max Entries must be greater than 0");
            return;
        }

        if (data.ticketPrize <= 0) {
            toast.error("Ticket Prize must be greater than 0");
            return;
        }

        try {
            setIsLoading(true);
            const tx = await createRaffle({
                max_entries: data.maxEntries,
                ticket_prize: data.ticketPrize
            });

            showSuccessToast('Raffle created successfully', tx);
            
            // reset data
            setData({
                maxEntries: 0,
                ticketPrize: 0
            });

            // close modal
            setOpenModal(false)

        } catch(error) {
            toast.error(`Could not create raffle account ${error}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            onClick={() => setOpenModal(false)}
            className="fixed w-full h-full left-0 top-0 bg-neutral-900/10 backdrop-blur-sm z-10 flex items-center justify-center"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-900 w-[45%] md:w-[40%] lg:w-[30%] p-4 py-8 rounded-md border border-white/10">
                <form
                    onSubmit={(e) => createRaffleHandler(e)}
                    className="space-y-4">
                    <div>
                        <Label htmlFor="max_entries" className="mb-2">Max Entries</Label>
                        <Input
                            type="number"
                            id="max_entries"
                            placeholder="Max Entries"
                            value={data.maxEntries || ""}
                            onChange={(e) => setData({ ...data, maxEntries: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="ticket_prize" className="mb-2">Ticket Prize</Label>
                        <Input
                            type="number"
                            id="ticket_prize"
                            placeholder="Enter Ticket Prize"
                            value={data.ticketPrize || ""}
                            onChange={(e) => setData({ ...data, ticketPrize: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <Button
                            className="w-full bg-amber-500 hover:bg-amber-600 cursor-pointer duration-300"
                            type="submit"
                        >
                            {isLoading && <span className="inline-block w-3 h-3 rounded-full animate-spin border-2 border-transparent border-t-white"></span>}
                            <span>Create Raffle</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}