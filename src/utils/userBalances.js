/**
 * Fetch user's SPL token balances
 * Works with connected wallet to show real token balances
 */

import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Supported tokens
// Note: Using official Devnet USDC from Circle
export const SUPPORTED_TOKENS = [
  { symbol: 'USDC', mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', name: 'USD Coin', icon: '💵' },
  { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', name: 'Wrapped SOL', icon: '◎' },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'Bonk', icon: '🐕' },
  { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', name: 'dogwifhat', icon: '🎩' },
  { symbol: 'POPCAT', mint: '7GCihgDB8fe6KNjn2MYtkzZcRj3y3t9GHdA8N7yWa2BA', name: 'Popcat', icon: '🐱' },
];

/**
 * Fetch user's token balances for supported tokens
 * @param {object} connection - Solana connection
 * @param {string} walletAddress - User's wallet public key
 * @returns {Promise<Array>} Array of token balances
 */
export async function fetchUserBalances(connection, walletAddress) {
  if (!walletAddress) {
    return [];
  }

  try {
    const walletPubkey = new PublicKey(walletAddress);
    
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    // Initialize balances with all supported tokens
    const balances = SUPPORTED_TOKENS.map(token => ({
      ...token,
      balance: 0,
      balanceUi: 0,
    }));

    // Process each token account
    tokenAccounts.value.forEach((account) => {
      try {
        const parsedInfo = account.account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const tokenAmount = parsedInfo.tokenAmount;
        
        // Find matching token in our supported list
        const tokenIndex = balances.findIndex(
          (b) => b.mint === mintAddress
        );
        
        if (tokenIndex !== -1) {
          balances[tokenIndex].balance = tokenAmount.amount; // Raw amount
          balances[tokenIndex].balanceUi = tokenAmount.uiAmount; // UI amount
        }
      } catch (err) {
        // Skip invalid token accounts
        console.warn('Error processing token account:', err);
      }
    });

    // Filter to only show tokens with balance > 0 or are in supported list
    const result = balances.filter(b => b.balanceUi > 0 || b.symbol === 'USDC');
    
    console.log('All balances:', balances);
    console.log('Filtered result:', result);
    console.log('USDC balance:', balances.find(b => b.symbol === 'USDC'));
    return result;
  } catch (error) {
    console.error('Error fetching user balances:', error);
    return [];
  }
}

/**
 * Format balance for display
 */
export function formatBalance(balance, decimals = 6) {
  if (!balance || balance === 0) return '0';
  
  // For large numbers, use compact format
  if (balance > 1000000) {
    return (balance / 1000000).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
  
  return balance.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
}

export default {
  SUPPORTED_TOKENS,
  fetchUserBalances,
  formatBalance,
};
