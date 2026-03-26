/**
 * Fetch real pool statistics from LitterBox program
 * 
 * Program: B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr
 * Network: Solana Devnet
 */

import { PublicKey, Connection } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

/**
 * Get program-derived addresses (PDAs)
 */
export function getProgramAddresses() {
  const [configPDA] = PublicKey.findProgramAddressSync(
    Buffer.from('config'),
    PROGRAM_ID
  );
  
  const [poolPDA] = PublicKey.findProgramAddressSync(
    Buffer.from('pool'),
    PROGRAM_ID
  );
  
  return { configPDA, poolPDA };
}

/**
 * Fetch pool statistics from the program
 * @param {Connection} connection - Solana connection
 * @returns {Promise<Object>} Pool statistics
 */
export async function fetchPoolStats(connection) {
  try {
    const { configPDA, poolPDA } = getProgramAddresses();
    
    // Fetch account info
    const [poolAccount, configAccount] = await Promise.all([
      connection.getAccountInfo(poolPDA),
      connection.getAccountInfo(configPDA),
    ]);
    
    // If accounts don't exist yet, return defaults
    if (!poolAccount || !configAccount) {
      console.log('Program accounts not found, using defaults');
      return {
        totalLiquidity: 0,
        totalLitterMinted: 0,
        activeUsers: 0,
        tokensRecycled: 0,
        isLoading: false,
      };
    }
    
    // Parse pool account data
    // Note: Adjust offsets based on your actual program structure
    const poolData = new DataView(poolAccount.data.buffer);
    const configData = new DataView(configAccount.data.buffer);
    
    // Extract values (assuming standard layout)
    // Adjust these offsets based on your program's actual account structure
    const totalLiquidity = poolData.getBigUint64(0, true); // Offset 0, little-endian
    const totalLitterMinted = poolData.getBigUint64(8, true); // Offset 8
    const activeUsers = poolData.getBigUint64(16, true); // Offset 16
    
    return {
      totalLiquidity: Number(totalLiquidity) / 1_000_000, // Convert from micro-units
      totalLitterMinted: Number(totalLitterMinted) / 1_000_000,
      activeUsers: Number(activeUsers),
      tokensRecycled: Number(activeUsers) * 2.5, // Placeholder calculation
      isLoading: false,
    };
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    return {
      totalLiquidity: 0,
      totalLitterMinted: 0,
      activeUsers: 0,
      tokensRecycled: 0,
      isLoading: false,
      error: error.message,
    };
  }
}

export default {
  getProgramAddresses,
  fetchPoolStats,
};
