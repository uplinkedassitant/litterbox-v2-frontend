import { useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { List, RefreshCw, TrendingUp, ArrowRight, CheckCircle, AlertCircle, Coins, Wallet as WalletIcon } from 'lucide-react'
import { fetchPoolStats, fetchTokenBalances, calculateLitterForDeposit } from './utils/litterboxProgram'
import './App.css'

// Configuration
const CONFIG = {
  RPC_URL: import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com',
}

// Supported tokens
const SUPPORTED_TOKENS = [
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin', icon: '💵' },
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', name: 'Wrapped SOL', icon: '◎' },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'Bonk', icon: '🐕' },
  { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', name: 'dogwifhat', icon: '🎩' },
  { symbol: 'POPCAT', mint: '7GCihgDB8fe6KNjn2MYtkzZcRj3y3t9GHdA8N7yWa2BA', name: 'Popcat', icon: '🐱' },
]

// Pool Stats Component
function PoolStats({ poolData, isLoading }) {
  const stats = [
    { label: 'Total Liquidity', value: `$${poolData.totalLiquidity?.toLocaleString() || '0'}`, icon: TrendingUp, change: '+12.5%' },
    { label: 'Litter Minted', value: `${poolData.totalLitterMinted?.toLocaleString() || '0'}`, icon: Coins, change: '+8.2%' },
    { label: 'Active Users', value: poolData.activeUsers?.toString() || '0', icon: CheckCircle, change: '+5' },
    { label: 'Tokens Recycled', value: poolData.tokensRecycled?.toString() || '0', icon: RefreshCw, change: '+15%' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
              <stat.icon className="w-6 h-6 text-primary-600" />
            </div>
            {stat.change && (
              <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {isLoading ? 'Loading...' : stat.value}
          </div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Token Selector Component
function TokenSelector({ selectedTokens, onSelectToken, userBalances, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredTokens = SUPPORTED_TOKENS.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <List className="w-6 h-6 text-primary-600" />
          Select Tokens to Recycle
        </h3>
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTokens.map((token) => {
          const isSelected = selectedTokens.some(t => t.mint === token.mint)
          const balance = userBalances.find(b => b.mint === token.mint)
          
          return (
            <button
              key={token.mint}
              onClick={() => onSelectToken(token)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{token.icon}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{token.symbol}</div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                {isLoading ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : balance ? (
                  <div className="text-sm font-semibold text-gray-800">
                    {balance.balance.toLocaleString()} {token.symbol}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">0 {token.symbol}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Deposit Form Component
function DepositForm({ selectedTokens, onDeposit, poolData }) {
  const [amounts, setAmounts] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const totalValue = Object.entries(amounts).reduce((total, [mint, amount]) => {
    return total + (parseFloat(amount) || 0)
  }, 0)

  const estimatedLitter = calculateLitterForDeposit(totalValue, poolData)

  const handleAmountChange = (mint, value) => {
    setAmounts(prev => ({ ...prev, [mint]: value }))
    setError(null)
  }

  const handleSubmit = async () => {
    if (totalValue === 0) {
      setError('Please enter deposit amounts')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await onDeposit(amounts)
      setAmounts({})
    } catch (err) {
      setError(err.message || 'Deposit failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-4">Deposit Amounts</h3>
      
      {selectedTokens.map((token) => (
        <div key={token.mint} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {token.symbol} Amount
          </label>
          <input
            type="number"
            value={amounts[token.mint] || ''}
            onChange={(e) => handleAmountChange(token.mint, e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      ))}

      {totalValue > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Value:</span>
            <span className="text-xl font-bold">${totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Estimated Litter:</span>
            <span className="text-xl font-bold">{estimatedLitter.toFixed(2)} LITTER</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isProcessing || totalValue === 0}
        className="w-full mt-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowRight className="w-5 h-5" />
            ♻️ Recycle My Memes
          </>
        )}
      </button>
    </div>
  )
}

// Main Content Component (uses wallet hooks)
function MainContent({ poolData, setPoolData, isLoading, setIsLoading }) {
  const { connected, wallet } = useWallet()
  const { connection } = useConnection()
  const [userBalances, setUserBalances] = useState([])
  const [selectedTokens, setSelectedTokens] = useState([])

  // Fetch pool stats on mount
  useEffect(() => {
    const loadPoolStats = async () => {
      setIsLoading(true)
      try {
        const stats = await fetchPoolStats(connection)
        setPoolData(stats)
      } catch (err) {
        console.error('Error loading pool stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadPoolStats()
  }, [connection, setPoolData, setIsLoading])

  // Fetch user balances when wallet connects
  useEffect(() => {
    if (!connected || !wallet) {
      setUserBalances([])
      return
    }

    const loadBalances = async () => {
      try {
        const balances = await fetchTokenBalances(connection, wallet.publicKey.toString())
        setUserBalances(balances)
      } catch (err) {
        console.error('Error loading balances:', err)
      }
    }
    loadBalances()
  }, [connected, wallet, connection])

  const handleSelectToken = (token) => {
    setSelectedTokens(prev =>
      prev.some(t => t.mint === token.mint)
        ? prev.filter(t => t.mint !== token.mint)
        : [...prev, token]
    )
  }

  const handleDeposit = async (amounts) => {
    console.log('Depositing:', amounts)
    alert('Deposit functionality coming soon!')
  }

  return (
    <>
      <PoolStats poolData={poolData} isLoading={isLoading} />
      
      {!connected ? (
        <div className="text-center py-12">
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
        <div className="space-y-6">
          <TokenSelector
            selectedTokens={selectedTokens}
            onSelectToken={handleSelectToken}
            userBalances={userBalances}
            isLoading={isLoading}
          />
          
          {selectedTokens.length > 0 && (
            <DepositForm
              selectedTokens={selectedTokens}
              onDeposit={handleDeposit}
              poolData={poolData}
            />
          )}
        </div>
      )}
    </>
  )
}

// App Component (provides context)
function App() {
  const [poolData, setPoolData] = useState({
    totalLiquidity: 0,
    totalLitterMinted: 0,
    activeUsers: 0,
    tokensRecycled: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

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
        <MainContent 
          poolData={poolData} 
          setPoolData={setPoolData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* How It Works */}
        <HowItWorks />
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

// How It Works Component
const HowItWorks = () => {
  const steps = [
    { num: 1, title: 'Connect Wallet', desc: 'Link your Solana wallet', icon: WalletIcon },
    { num: 2, title: 'Select Tokens', desc: 'Choose meme tokens to recycle', icon: List },
    { num: 3, title: 'Auto-Swap', desc: 'Jupiter swaps to USDC', icon: RefreshCw },
    { num: 4, title: 'Get Litter', desc: 'Receive backed tokens', icon: CheckCircle },
  ]

  return (
    <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <step.icon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Root component with providers
function AppWithProviders() {
  const endpoint = CONFIG.RPC_URL

  const wallets = [] // Wallets will be auto-detected by WalletModalProvider

  return (
    <ConnectionProvider config={{ endpoint }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default AppWithProvider
