import { useState, useMemo, useEffect } from 'react'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Connection, Transaction, SystemProgram } from '@solana/web3.js'
import { List, RefreshCw, TrendingUp, Info, ArrowRight, CheckCircle, AlertCircle, Coins, Wallet } from 'lucide-react'
import { clsx } from 'clsx'
import '@solana/wallet-adapter-react-ui/styles.css'
import './App.css'

// Configuration
const CONFIG = {
  PROGRAM_ID: new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr'),
  LITTER_MINT: new PublicKey('FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR'),
  NETWORK: 'devnet',
  RPC_URL: 'https://api.devnet.solana.com',
}

// Supported tokens (Devnet)
const SUPPORTED_TOKENS = [
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USD Coin', icon: '💵' },
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', name: 'Wrapped SOL', icon: '◎' },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wX7RGwCYSXWkL6oQJh8VtMhM8', name: 'Bonk', icon: '🐕' },
  { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', name: 'dogwifhat', icon: '🎩' },
  { symbol: 'POPCAT', mint: '7GCihgDB8fe6KNjn2MYtkzZcRj3y3t9GHdA8N7yWa2BA', name: 'Popcat', icon: '🐱' },
]

// Token Selector Component
function TokenSelector({ selectedTokens, onSelectToken, userBalances }) {
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
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredTokens.map((token) => {
          const balance = userBalances[token.symbol] || 0
          const isSelected = selectedTokens.some(t => t.mint === token.mint)
          
          return (
            <label
              key={token.mint}
              className={clsx(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border-2",
                isSelected 
                  ? "border-primary-500 bg-primary-50" 
                  : "border-gray-100 hover:border-primary-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectToken([...selectedTokens, token])
                    } else {
                      onSelectToken(selectedTokens.filter(t => t.mint !== token.mint))
                    }
                  }}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="text-2xl">{token.icon}</div>
                <div>
                  <div className="font-semibold text-gray-800">{token.symbol}</div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400">Available</div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// Deposit Form Component
function DepositForm({ selectedTokens, onDeposit, isProcessing, transactionStatus }) {
  const [amounts, setAmounts] = useState({})
  
  const totalValue = Object.entries(amounts).reduce((sum, [mint, value]) => {
    return sum + (parseFloat(value) || 0)
  }, 0)

  const estimatedLitter = totalValue > 0 ? totalValue * 0.95 : 0 // Example rate

  const handleAmountChange = (mint, value) => {
    setAmounts(prev => ({ ...prev, [mint]: value }))
  }

  const handleSubmit = () => {
    onDeposit(amounts)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <RefreshCw className={clsx("w-6 h-6", isProcessing && "animate-spin")} />
        {isProcessing ? 'Processing...' : 'Enter Amounts'}
      </h3>
      
      {selectedTokens.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Coins className="w-12 h-12 mx-auto mb-2" />
          <p>Select tokens to begin</p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedTokens.map(token => (
            <div key={token.mint} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {token.symbol} Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amounts[token.mint] || ''}
                  onChange={(e) => handleAmountChange(token.mint, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="text-right min-w-[100px]">
                <div className="text-sm text-gray-500">≈ ${(parseFloat(amounts[token.mint]) || 0).toFixed(2)}</div>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Estimated Total:</span>
              <span className="text-2xl font-bold text-gray-800">${totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-500">You'll receive:</span>
              <span className="font-semibold text-primary-600">≈ {estimatedLitter.toFixed(2)} LITTER</span>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isProcessing || totalValue === 0}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  ♻️ Recycle My Memes
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {transactionStatus && (
        <div className={clsx(
          "mt-4 p-4 rounded-lg flex items-center gap-3",
          transactionStatus.type === 'success' && "bg-success/10 text-success",
          transactionStatus.type === 'error' && "bg-error/10 text-error",
          transactionStatus.type === 'processing' && "bg-primary/10 text-primary"
        )}>
          {transactionStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {transactionStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {transactionStatus.type === 'processing' && <RefreshCw className="w-5 h-5 animate-spin" />}
          <span className="font-medium">{transactionStatus.message}</span>
        </div>
      )}
    </div>
  )
}

// Pool Stats Component
function PoolStats() {
  const stats = {
    totalLiquidity: 125000,
    totalRecycled: 45230,
    activeUsers: 127,
    tokensRecycled: 1543,
  }

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 text-white">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Pool Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-primary-200 text-xs mb-1">Total Liquidity</div>
          <div className="text-2xl font-bold">${stats.totalLiquidity.toLocaleString()}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-primary-200 text-xs mb-1">Total Recycled</div>
          <div className="text-2xl font-bold">${stats.totalRecycled.toLocaleString()}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-primary-200 text-xs mb-1">Active Users</div>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-primary-200 text-xs mb-1">Tokens Recycled</div>
          <div className="text-2xl font-bold">{stats.tokensRecycled.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

// How It Works Component
function HowItWorks() {
  const steps = [
    { num: 1, title: 'Connect Wallet', desc: 'Link your Solana wallet', icon: Wallet },
    { num: 2, title: 'Select Tokens', desc: 'Choose meme tokens to recycle', icon: List },
    { num: 3, title: 'Auto-Swap', desc: 'Jupiter swaps to USDC', icon: RefreshCw },
    { num: 4, title: 'Get Litter', desc: 'Receive backed tokens', icon: CheckCircle },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <Info className="w-6 h-6 text-primary-600" />
        How It Works
      </h3>
      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.num} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
              {step.num}
            </div>
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <step.icon className="w-4 h-4" />
                {step.title}
              </div>
              <div className="text-sm text-gray-500">{step.desc}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Main Content Component
function MainContent() {
  const { connected, publicKey, disconnect } = useWallet()
  const { connection } = useConnection()
  const [selectedTokens, setSelectedTokens] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [userBalances, setUserBalances] = useState({})

  // Fetch user balances when connected
  useEffect(() => {
    if (!connected || !publicKey) {
      setUserBalances({})
      return
    }

    // Simulate fetching balances (replace with actual token account queries)
    const fetchBalances = async () => {
      try {
        // Placeholder - in production, fetch actual balances
        setUserBalances({
          'USDC': 1000,
          'SOL': 5.5,
          'BONK': 50000,
          'WIF': 100,
          'POPCAT': 2500,
        })
      } catch (error) {
        console.error('Error fetching balances:', error)
      }
    }

    fetchBalances()
  }, [connected, publicKey])

  const handleDeposit = async (amounts) => {
    if (!connected) return
    
    setIsProcessing(true)
    setTransactionStatus({ type: 'processing', message: 'Processing transaction...' })
    
    try {
      // TODO: Implement actual deposit logic
      // 1. Get quote from Jupiter
      // 2. Build transaction with multi-token deposit
      // 3. Send and confirm
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setTransactionStatus({ 
        type: 'success', 
        message: 'Successfully recycled your meme tokens! 🎉' 
      })
      setSelectedTokens([])
    } catch (error) {
      console.error('Deposit error:', error)
      setTransactionStatus({ 
        type: 'error', 
        message: 'Transaction failed. Please try again.' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">♻️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">LitterBox</h1>
          <p className="text-xl text-gray-600 mb-2">Meme Token Recycler</p>
          <p className="text-gray-500 mb-8">Turn your dead meme tokens into real value!</p>
          <WalletMultiButton className="!bg-primary-600 !hover:bg-primary-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">♻️</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LitterBox</h1>
              <p className="text-sm text-gray-500">Meme Token Recycler</p>
            </div>
          </div>
          <WalletMultiButton className="!bg-primary-600 !hover:bg-primary-700" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TokenSelector 
              selectedTokens={selectedTokens}
              onSelectToken={setSelectedTokens}
              userBalances={userBalances}
            />
            
            {selectedTokens.length > 0 && (
              <DepositForm 
                selectedTokens={selectedTokens}
                onDeposit={handleDeposit}
                isProcessing={isProcessing}
                transactionStatus={transactionStatus}
              />
            )}
          </div>
          
          <div className="space-y-6">
            <PoolStats />
            <HowItWorks />
          </div>
        </div>
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

// App Component
function App() {
  return (
    <ConnectionProvider endpoint={CONFIG.RPC_URL}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <MainContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
