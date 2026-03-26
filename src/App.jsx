import { useMemo, useState } from 'react'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Wallet as WalletIcon, TrendingUp, Coins, CheckCircle, RefreshCw } from 'lucide-react'
import '@solana/wallet-adapter-react-ui/styles.css'
import './App.css'

// Configuration - Use environment variable or default to Devnet
const getRpcUrl = () => {
  const envUrl = import.meta.env.VITE_RPC_URL
  // Ensure we have a valid URL
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl
  }
  // Default to Devnet
  return 'https://api.devnet.solana.com'
}

const RPC_URL = getRpcUrl()

// Mock data for now
const MOCK_POOL_DATA = {
  totalLiquidity: 1234.56,
  totalLitterMinted: 5678.90,
  activeUsers: 42,
  tokensRecycled: 105,
}

// Pool Stats Component
function PoolStats() {
  const stats = [
    { label: 'Total Liquidity', value: `$${MOCK_POOL_DATA.totalLiquidity.toLocaleString()}`, icon: TrendingUp },
    { label: 'Litter Minted', value: MOCK_POOL_DATA.totalLitterMinted.toLocaleString(), icon: Coins },
    { label: 'Active Users', value: MOCK_POOL_DATA.activeUsers.toString(), icon: CheckCircle },
    { label: 'Tokens Recycled', value: MOCK_POOL_DATA.tokensRecycled.toString(), icon: RefreshCw },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
              <stat.icon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Wallet Content - shown when wallet is connected
function ConnectedContent({ wallet }) {
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-2xl font-bold text-green-800 mb-2">Wallet Connected!</h3>
      <p className="text-green-700 mb-4">
        Connected to: <strong>{wallet.publicKey.toString().slice(0, 4)}...{wallet.publicKey.toString().slice(-4)}</strong>
      </p>
      <p className="text-green-600 text-sm">
        Token balances and deposit form coming in next phase!
      </p>
    </div>
  )
}

// Main App Content (uses wallet hooks)
function AppContent() {
  const { connected, wallet, disconnect } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">♻️</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">LitterBox v2</h1>
              <p className="text-sm text-gray-500">Meme Token Recycler</p>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Pool Stats - Always visible */}
        <PoolStats />

        {/* Wallet Connection State */}
        {!connected ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Connect Your Wallet to Start
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Solana wallet to view your tokens and start recycling meme tokens
            </p>
            <WalletMultiButton />
          </div>
        ) : (
          <ConnectedContent wallet={wallet} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>♻️ LitterBox v2 - Built on Solana</p>
          <p className="mt-2">Don't let your meme tokens go to waste - recycle them!</p>
        </div>
      </footer>
    </div>
  )
}

// Root App with Providers
function App() {
  const endpoint = useMemo(() => RPC_URL, [])
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider config={{ endpoint }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
