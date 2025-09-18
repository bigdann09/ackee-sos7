import { useEffect, useState } from 'react'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const Balance = () => {
    const [walletBalance, setWalletBalance] = useState<null | number>(null)
    const { connection } = useConnection();
    const wallet = useWallet()

    useEffect(() => {
        if (wallet.publicKey) {
            (async () => {
                const balance = await connection.getBalance(wallet.publicKey!)
                setWalletBalance(balance / LAMPORTS_PER_SOL)
            })()
        }
    }, [wallet])

    return (
        <div className="my-4 py-4 flex gap-2 gap-x items-end w-[20rem] rounded-md bg-neutral-900 border border-neutral-800 mx-auto justify-center">
            <p className="flex gap-1 items-center">
                <span className="inline-block rounded-full w-2 h-2 bg-amber-500/60"></span>
                <span>Wallet Balance: </span>
            </p>
            <p className="text-lg font-semibold">{walletBalance?.toLocaleString()} SOL</p>
        </div>
    )
}