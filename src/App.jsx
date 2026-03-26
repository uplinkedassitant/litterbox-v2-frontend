import { useState, useEffect } from 'react'

// Simple placeholder App - we'll add wallet integration step by step
function App() {
  const [poolData] = useState({
    totalLiquidity: 1234.56,
    totalLitterMinted: 5678.90,
    activeUsers: 42,
    tokensRecycled: 105,
  })

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
          <div className="px-4 py-2 bg-gray-100 rounded">
            Wallet: Not Connected
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">${poolData.totalLiquidity.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Liquidity</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{poolData.totalLitterMinted.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Litter Minted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{poolData.activeUsers}</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-2xl font-bold text-gray-800">{poolData.tokensRecycled}</div>
            <div className="text-sm text-gray-500">Tokens Recycled</div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Wallet Integration Coming Soon
          </h2>
          <p className="text-gray-600">
            The basic UI is working! Wallet connection will be added next.
          </p>
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

export default App
