import { useMemo, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Wallet as WalletIcon, TrendingUp, Coins, CheckCircle, RefreshCw } from 'lucide-react'
import { clusterApiUrl } from '@solana/web3.js'
import { fetchPoolStats } from './utils/poolStats'
import { fetchUserBalances, SUPPORTED_TOKENS } from './utils/userBalances'
import TokenSelector from './components/TokenSelector'
import DepositForm from './components/DepositForm'
import { submitDeposit } from './utils/deposit'
import '@solana/wallet-adapter-react-ui/styles.css'
import './App.css'

// RPC URL for Solana Devnet
const RPC_URL = clusterApiUrl('devnet')

// Pool Stats Component
function PoolStats({ poolData, isLoading, error }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    const value = num > 10000 ? num / 1_000_000 : num;
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const stats = [
    { label: 'Total Liquidity', value: `$${formatNumber(poolData.totalLiquidity || 0)}`, icon: TrendingUp },
    { label: 'Litter Minted', value: `${formatNumber(poolData.totalLitterMinted || 0)} LITTER`, icon: Coins },
    { label: 'Active Users', value: (poolData.activeUsers || 0).toString(), icon: CheckCircle },
    { label: 'Tokens Recycled', value: `${formatNumber(poolData.tokensRecycled || 0)}`, icon: RefreshCw },
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

// Wallet Content Component
function ConnectedContent({ publicKey, userBalances, isLoading, poolData, onDeposit, isSubmitting, setIsSubmitting }) {
  const [selectedTokens, setSelectedTokens] = useState([])

  const handleToggleToken = (token) => {
    setSelectedTokens(prev => {
      const isSelected = prev.some(t => t.mint === token.mint)
      if (isSelected) {
        return prev.filter(t => t.mint !== token.mint)
      } else {
        return [...prev, token]
      }
    })
  }

  const handleDeposit = async (amounts) => {
    setIsSubmitting(true)
    try {
      await onDeposit(amounts)
    } catch (error) {
      console.error('Deposit failed:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Wallet Connected!</h3>
        <p className="text-green-700 mb-4">
          Connected to: <strong>{publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</strong>
        </p>
      </div>

      <TokenSelector
        tokens={userBalances}
        selectedTokens={selectedTokens}
        onToggleToken={handleToggleToken}
        isLoading={isLoading}
      />

      {selectedTokens.length > 0 && (
        <DepositForm
          selectedTokens={selectedTokens}
          poolData={poolData}
          onDeposit={handleDeposit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

// Main App Content
function AppContent() {
  const { connected, publicKey, wallet, sendTransaction } = useWallet()
  const { connection } = useConnection()
  
  console.log('AppContent - connected:', connected)
  console.log('AppContent - publicKey:', publicKey?.toString())
  console.log('AppContent - wallet:', wallet)
  console.log('AppContent - sendTransaction:', typeof sendTransaction)
  const [poolData, setPoolData] = useState({
    totalLiquidity: 0,
    totalLitterMinted: 0,
    activeUsers: 0,
    tokensRecycled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userBalances, setUserBalances] = useState([])
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch pool stats
  useEffect(() => {
    const loadPoolStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const stats = await fetchPoolStats(connection)
        setPoolData(stats)
        if (stats.error) setError(stats.error)
      } catch (err) {
        console.error('Error loading pool stats:', err)
        setError('Failed to load pool statistics')
      } finally {
        setIsLoading(false)
      }
    }
    loadPoolStats()
  }, [connection])

  // Fetch user balances
  useEffect(() => {
    if (!connected || !publicKey) {
      setUserBalances([])
      return
    }
    const loadBalances = async () => {
      setIsLoadingBalances(true)
      try {
        const balances = await fetchUserBalances(connection, publicKey.toString())
        setUserBalances(balances)
      } catch (err) {
        console.error('Error loading balances:', err)
        setUserBalances([])
      } finally {
        setIsLoadingBalances(false)
      }
    }
    loadBalances()
  }, [connected, publicKey, connection])

  // Handle deposit
  const handleDeposit = async (amounts) => {
    console.log('Submitting deposit:', amounts)
    console.log('Using publicKey:', publicKey?.toString())
    console.log('Connection RPC:', connection?.rpcEndpoint)
    console.log('sendTransaction function:', typeof sendTransaction)
    
    // Check wallet state
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected')
    }
    
    if (!sendTransaction) {
      throw new Error('Wallet does not support sendTransaction')
    }
    
    console.log('Proceeding with deposit for:', publicKey.toString())
    
    // Import the deposit logic
    const { submitDeposit } = await import('./utils/deposit')
    
    try {
      const result = await submitDeposit(connection, publicKey, amounts, userBalances, sendTransaction)
      console.log('✅ Deposit successful!', result)
      
      // Wait a moment for the network to update, then refresh pool stats
      console.log('Waiting 2 seconds for network to update...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Refreshing pool stats...')
      const stats = await fetchPoolStats(connection)
      console.log('New pool stats:', stats)
      setPoolData(stats)
      
      // Also refresh user balances
      console.log('Refreshing user balances...')
      const balances = await fetchUserBalances(connection, publicKey.toString())
      setUserBalances(balances)
      
      return result
    } catch (error) {
      console.error('Deposit failed:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <PoolStats poolData={poolData} isLoading={isLoading} error={error} />

        {!connected ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Wallet to Start</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Solana wallet to view your tokens and start recycling meme tokens
            </p>
            <WalletMultiButton />
          </div>
        ) : (
          <ConnectedContent 
            publicKey={publicKey} 
            userBalances={userBalances}
            isLoading={isLoadingBalances}
            poolData={poolData}
            onDeposit={handleDeposit}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </main>

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
