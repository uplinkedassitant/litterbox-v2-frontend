import React from 'react'
import { Coins } from 'lucide-react'

/**
 * Token Selector Component
 * Allows users to select multiple tokens for deposit
 * 
 * @param {Array} tokens - Array of token objects with balances
 * @param {Array} selectedTokens - Array of selected token mints
 * @param {Function} onToggleToken - Function to toggle token selection
 * @param {Boolean} isLoading - Loading state
 */
function TokenSelector({ tokens, selectedTokens, onToggleToken, isLoading }) {
  // Filter to only show tokens with balance > 0
  const tokensWithBalance = tokens.filter(token => token.balanceUi > 0)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Coins className="w-6 h-6 text-primary-600" />
          Select Tokens to Deposit
        </h3>
        <div className="text-center py-8 text-gray-500">
          Loading your tokens...
        </div>
      </div>
    )
  }

  if (tokensWithBalance.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Coins className="w-6 h-6 text-primary-600" />
          Select Tokens to Deposit
        </h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💸</div>
          <p className="text-gray-600 mb-2">No tokens with balance found</p>
          <p className="text-sm text-gray-500">
            Deposit USDC, SOL, or other supported tokens to your wallet first
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <Coins className="w-6 h-6 text-primary-600" />
        Select Tokens to Deposit
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tokensWithBalance.map((token) => {
          const isSelected = selectedTokens.some(t => t.mint === token.mint)
          
          return (
            <button
              key={token.mint}
              onClick={() => onToggleToken(token)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox indicator */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'border-primary-600 bg-primary-600' 
                    : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                {/* Token icon */}
                <span className="text-2xl">{token.icon}</span>
                
                {/* Token info */}
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.name}</div>
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-right">
                <div className="font-bold text-gray-800">
                  {token.balanceUi ? token.balanceUi.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'}
                </div>
                <div className="text-xs text-gray-500">{token.symbol}</div>
              </div>
            </button>
          )
        })}
      </div>
      
      {/* Selection summary */}
      {selectedTokens.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedTokens.length} token{selectedTokens.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => selectedTokens.forEach(t => onToggleToken(t))}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenSelector
