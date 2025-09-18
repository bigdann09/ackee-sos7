import { useMemo, type ReactNode } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

export const SolanaProvider = ({children}: {children: ReactNode}) => {
    // const network = WalletAdapterNetwork.Devnet
    const rpcEndpoint = "https://devnet.helius-rpc.com/?api-key=846277f1-fb00-4129-9cdd-5af6572dffe5"
    const wallets = useMemo(() => [], [])
    const endpoint = useMemo(() => rpcEndpoint, [rpcEndpoint])

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
