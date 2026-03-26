import React, { useState, useEffect } from 'react'
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Calculate Litter tokens for deposit using bonding curve
 * Formula: litterAmount = usdcAmount * (totalLitterMinted / totalLiquidity)
 */
function calculateLitterForDeposit(amount, poolData) {
  const { totalLiquidity = 0, totalLitterMinted = 0 } = poolData || {}
  
  // If no liquidity yet, use 1:1 ratio
  if (totalLiquidity === 0 || totalLitterMinted === 0) {
    return amount
  }
  
  // Bonding curve formula
  return amount * (totalLitterMinted / totalLiquidity)
}

/**
 * Deposit Form Component
 * Allows users to enter deposit amounts and see real-time calculations
 * 
 * @param {Array} selectedTokens - Array of selected token objects
 * @param {Object} poolData - Pool statistics from program
 * @param {Function} onDeposit - Function to handle deposit submission
 * @param {Boolean} isSubmitting - Submission state
 */
function DepositForm({ selectedTokens, poolData, onDeposit, isSubmitting }) {
  const [amounts, setAmounts] = useState({})
  const [error, setError] = useState(null)
  
  // Calculate totals
  const totalValue = Object.entries(amounts).reduce((total, [mint, amount]) => {
    return total + (parseFloat(amount) || 0)
  }, 0)
  
  // Calculate estimated Litter tokens
  const estimatedLitter = selectedTokens.reduce((total, token) => {
    const amount = parseFloat(amounts[token.mint]) || 0
    return total + calculateLitterForDeposit(amount, poolData)
  }, 0)
  
  const handleAmountChange = (mint, value) => {
    // Only allow positive numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmounts(prev => ({ ...prev, [mint]: value }))
      setError(null)
    }
  }
  
  const handleMaxAmount = (mint, maxBalance) => {
    setAmounts(prev => ({ ...prev, [mint]: maxBalance.toString() }))
    setError(null)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (totalValue === 0) {
      setError('Please enter a deposit amount')
      return
    }
    
    // Validate amounts don't exceed balance
    for (const token of selectedTokens) {
      const amount = parseFloat(amounts[token.mint]) || 0
      if (amount > token.balanceUi) {
        setError(`${token.symbol}: Amount exceeds balance`)
        return
      }
    }
    
    await onDeposit(amounts)
    setAmounts({})
  }
  
  if (selectedTokens.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
        <div className="text-6xl mb-4">👆</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Select Tokens First</h3>
        <p className="text-gray-600">
          Choose which tokens you want to deposit from the selector above
        </p>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <ArrowRight className="w-6 h-6 text-primary-600" />
        Enter Deposit Amounts
      </h3>
      
      {/* Amount inputs for each selected token */}
      <div className="space-y-4 mb-6">
        {selectedTokens.map((token) => {
          const amount = amounts[token.mint] || ''
          const numericAmount = parseFloat(amount) || 0
          const maxBalance = token.balanceUi || 0
          const isMaxed = numericAmount >= maxBalance && maxBalance > 0
          
          return (
            <div key={token.mint} className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-2xl">{token.icon}</span>
                  {token.symbol} Amount
                </label>
                {maxBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMaxAmount(token.mint, maxBalance)}
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                      isMaxed
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    MAX
                  </button>
                )}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(token.mint, e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 pr-20 border-2 rounded-lg text-lg font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${
                    isMaxed
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {token.symbol}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>Available: {maxBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                {numericAmount > 0 && (
                  <span>≈ ${(numericAmount).toFixed(2)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Calculation Summary */}
      {totalValue > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-6 border border-primary-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total Deposit Value:</span>
            <span className="text-xl font-bold text-gray-800">${totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Bonding Curve Rate:</span>
            <span className="font-medium text-gray-700">
              1 USDC = {(poolData.totalLitterMinted / poolData.totalLiquidity || 1).toFixed(4)} LITTER
            </span>
          </div>
          <div className="border-t border-primary-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold">You'll Receive:</span>
              <span className="text-2xl font-bold text-primary-600">
                {estimatedLitter.toLocaleString(undefined, { maximumFractionDigits: 4 })} LITTER
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || totalValue === 0}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-800 text-white py-4 rounded-lg font-semibold text-lg hover:from-primary-700 hover:to-primary-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowRight className="w-5 h-5" />
            ♻️ Deposit & Recycle Memes
          </>
        )}
      </button>
      
      <p className="text-xs text-center text-gray-500 mt-3">
        By depositing, you agree to swap meme tokens to USDC via Jupiter and receive Litter tokens
        based on the current bonding curve rate.
      </p>
    </form>
  )
}

export default DepositForm
