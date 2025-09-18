import { Navigation } from './components/navigation'
import toast, { Toaster } from "react-hot-toast"
import { Balance } from "./components/account-balance"
import { Card } from "./components/card"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from "@solana/wallet-adapter-react";

import '@solana/wallet-adapter-react-ui/styles.css'
import { useRaffle } from './hooks/useRaffle'
import { useEffect } from 'react'

function App() {
  const { connected } = useWallet()
  const {
    isLoading,
    buyTicket,
    createRaffle,
    pickWinner,
    claimPrize,
    getTicketPDA,
    fetchTicket,
    raffles,
    fetchAllRaffles,
    fetchTicketsForRaffle
  } = useRaffle();

  useEffect(() => {
    if (!raffles) {
      fetchAllRaffles()
    }
  }, [fetchAllRaffles, raffles])

  const showSuccessToast = (message: string, tx: string) => {
    toast.custom((t) => (
        <div
            className={`bg-neutral-900 text-white border border-neutral-900 rounded-md p-4 shadow-md w-[320px] ${
                t.visible ? "animate-enter" : "animate-leave"
            }`}
        >
            <div className="flex flex-col space-y-2">
                <span className="font-medium text-sm">{message}</span>
                <a
                    href={`https://solscan.io/tx/${tx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 text-sm underline hover:text-amber-300 transition-colors"
                >
                    View on Solana Explorer ↗
                </a>
                <button
                    className="mt-2 self-end text-xs text-neutral-400 hover:text-neutral-300 transition"
                    onClick={() => toast.dismiss(t.id)}
                >
                    Dismiss
                </button>
            </div>
        </div>
    ));
  };

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <main className='relative w-[85vw] p-3'>
        <Navigation 
          createRaffle={createRaffle}
          showSuccessToast={showSuccessToast}
        />

        <div className="relative">
          {!connected ? (
            <div className="mt-12 flex flex-col items-center">
              <h3 className='mb-3'>Connect your wallet to get started</h3>
              <WalletMultiButton />
            </div>
          ): (
            <>
              {/* Display User's Balance */}
              <Balance />

              {isLoading && !raffles && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border border-t-transparent border-l-transparent border-amber-500"></div>
                </div>
              )}

              {/* List of raffles in contract */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 py-4">
                  {raffles && raffles.length > 0 ? (
                      raffles.map((raffle) => (
                          <Card 
                              key={raffle.publicKey.toBase58()}
                              raffle={raffle}
                              buyTicket={buyTicket}
                              claimPrize={claimPrize}
                              pickWinner={pickWinner}
                              getTicketPDA={getTicketPDA}
                              fetchTicket={fetchTicket}
                              showSuccessToast={showSuccessToast}
                              fetchTicketsForRaffle={fetchTicketsForRaffle}
                          />
                      ))
                  ) : (
                      <div className="col-span-full text-center py-8 text-neutral-400">
                          <p>No raffles found</p>
                      </div>
                  )}
              </div>
            </>
          )}
      </div>
      </main>
    </>
  )
}

export default App
