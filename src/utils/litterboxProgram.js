/**
 * LitterBox v2 Program Integration
 * Connects frontend to the actual Solana program
 */

import { PublicKey, Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getMint } from '@solana/spl-token';

// Program configuration
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || '5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w'
);

export const LITTER_MINT = new PublicKey(
  import.meta.env.VITE_LITTER_MINT || 'FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR'
);

// These will be used when we implement actual transactions
// const DISC_DEPOSIT = 1;

/**
 * Get program-derived addresses (PDAs)
 */
export function getProgramAddresses() {
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
  
  const [poolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool')],
    PROGRAM_ID
  );
  
  return { configPDA, poolPDA };
}

/**
 * Fetch pool statistics from program
 */
export async function fetchPoolStats(connection) {
  try {
    const { configPDA, poolPDA } = getProgramAddresses();
    
    // Fetch pool account data
    const poolInfo = await connection.getAccountInfo(poolPDA);
    const configInfo = await connection.getAccountInfo(configPDA);
    
    if (!poolInfo || !configInfo) {
      return {
        totalLiquidity: 0,
        totalLitterMinted: 0,
        activeUsers: 0,
        tokensRecycled: 0,
        isLoading: false,
        error: null
      };
    }
    
    // Parse pool data (adjust based on your actual account structure)
    const poolData = new DataView(poolInfo.data.buffer);
    const configData = new DataView(configInfo.data.buffer);
    
    // Extract values (adjust offsets based on your program)
    const totalLiquidity = poolData.getBigUint64(0, true); // Offset 0, little-endian
    const totalLitterMinted = poolData.getBigUint64(8, true); // Offset 8
    const activeUsers = poolData.getBigUint64(16, true); // Offset 16
    
    return {
      totalLiquidity: Number(totalLiquidity) / 1_000_000, // Convert from lamports/micro-units
      totalLitterMinted: Number(totalLitterMinted) / 1_000_000,
      activeUsers: Number(activeUsers),
      tokensRecycled: Number(activeUsers) * 2.5, // Placeholder for now
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    return {
      totalLiquidity: 0,
      totalLitterMinted: 0,
      activeUsers: 0,
      tokensRecycled: 0,
      isLoading: false,
      error: error.message
    };
  }
}

/**
 * Fetch user's token balances
 */
export async function fetchTokenBalances(connection, walletAddress) {
  if (!walletAddress) return [];
  
  try {
    const walletPubkey = new PublicKey(walletAddress);
    
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(walletPubkey, {
      programId: TOKEN_PROGRAM_ID,
    });
    
    const balances = [];
    
    for (const { pubkey, account } of tokenAccounts.value) {
      try {
        const tokenInfo = await getAccount(connection, pubkey);
        const mintInfo = await getMint(connection, tokenInfo.mint);
        
        balances.push({
          mint: tokenInfo.mint.toString(),
          symbol: getTokenSymbol(tokenInfo.mint.toString()),
          balance: Number(tokenInfo.amount) / Math.pow(10, mintInfo.decimals),
          decimals: mintInfo.decimals,
          tokenAddress: pubkey.toString(),
        });
      } catch (err) {
        console.error('Error fetching token info:', err);
      }
    }
    
    return balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
}

/**
 * Get token symbol from mint address
 */
function getTokenSymbol(mintAddress) {
  const symbols = {
    'FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR': 'LITTER',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'So11111111111111111111111111111111111111112': 'SOL',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
  };
  return symbols[mintAddress] || 'UNKNOWN';
}

/**
 * Create deposit instruction (placeholder - to be implemented)
 * This will be implemented when we add actual transaction submission
 */
export async function createDepositInstruction(connection, wallet, tokenAmount, tokenMint) {
  console.log('Deposit instruction placeholder - to be implemented');
  console.log('Amount:', tokenAmount, 'Token:', tokenMint);
  // TODO: Implement actual deposit transaction
  throw new Error('Deposit transaction not yet implemented');
}

/**
 * Calculate Litter tokens for deposit (bonding curve)
 */
export function calculateLitterForDeposit(usdcAmount, poolState) {
  const { totalLiquidity = 0, totalLitterMinted = 0 } = poolState || {};
  
  if (totalLiquidity === 0 || totalLitterMinted === 0) {
    return usdcAmount; // 1:1 for first deposit
  }
  
  return usdcAmount * (totalLitterMinted / totalLiquidity);
}

export default {
  PROGRAM_ID,
  LITTER_MINT,
  getProgramAddresses,
  fetchPoolStats,
  fetchTokenBalances,
  createDepositInstruction,
  calculateLitterForDeposit,
};
