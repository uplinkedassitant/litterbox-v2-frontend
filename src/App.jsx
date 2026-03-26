import { useMemo, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Wallet as WalletIcon, TrendingUp, Coins, CheckCircle, RefreshCw } from 'lucide-react'
import { clusterApiUrl } from '@solana/web3.js'
import { fetchPoolStats } from './utils/poolStats'
import '@solana/wallet-adapter-react-ui/styles.css'
import './App.css'

// Configuration - Use official Solana clusterApiUrl for Devnet
const RPC_URL = clusterApiUrl('devnet')

// Pool Stats Component
function PoolStats({ poolData, isLoading, error }) {
  const stats = [
    { label: 'Total Liquidity', value: `$${(poolData.totalLiquidity || 0).toLocaleString()}`, icon: TrendingUp },
    { label: 'Litter Minted', value: (poolData.totalLitterMinted || 0).toLocaleString(), icon: Coins },
    { label: 'Active Users', value: (poolData.activeUsers || 0).toString(), icon: CheckCircle },
    { label: 'Tokens Recycled', value: (poolData.tokensRecycled || 0).toString(), icon: RefreshCw },
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
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {isLoading ? 'Loading...' : stat.value}
          </div>
          <div className="text-sm text-gray-500">{stat.label}</div>
          {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
        </div>
      ))}
    </div>
  )
}

// Wallet Content - shown when wallet is connected
function ConnectedContent({ publicKey }) {
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-2xl font-bold text-green-800 mb-2">Wallet Connected!</h3>
      <p className="text-green-700 mb-4">
        Connected to: <strong>{publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</strong>
      </p>
      <p className="text-green-600 text-sm">
        Token balances and deposit form coming in next phase!
      </p>
    </div>
  )
}

// Main App Content (uses wallet hooks)
function AppContent() {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [poolData, setPoolData] = useState({
    totalLiquidity: 0,
    totalLitterMinted: 0,
    activeUsers: 0,
    tokensRecycled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch pool stats on mount
  useEffect(() => {
    const loadPoolStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const stats = await fetchPoolStats(connection)
        setPoolData(stats)
        if (stats.error) {
          setError(stats.error)
        }
      } catch (err) {
        console.error('Error loading pool stats:', err)
        setError('Failed to load pool statistics')
      } finally {
        setIsLoading(false)
      }
    }

    loadPoolStats()
  }, [connection])

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
        <PoolStats poolData={poolData} isLoading={isLoading} error={error} />

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
          <ConnectedContent publicKey={publicKey} />
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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
