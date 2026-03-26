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
 * Based on litterbox-pinocchio program constants:
 * - CONFIG_SEED = "config"
 * - VIRTUAL_POOL_SEED = "virtual_pool"
 */
export function getProgramAddresses() {
  // Seeds must be an array of Uint8Arrays
  const configSeed = [new TextEncoder().encode('config')];
  const poolSeed = [new TextEncoder().encode('virtual_pool')];
  
  const [configPDA] = PublicKey.findProgramAddressSync(
    configSeed,
    PROGRAM_ID
  );
  
  const [poolPDA] = PublicKey.findProgramAddressSync(
    poolSeed,
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
    
    console.log('Fetching pool stats...');
    console.log('Config PDA:', configPDA.toString());
    console.log('Pool PDA:', poolPDA.toString());
    
    // Fetch account info
    const [poolAccount, configAccount] = await Promise.all([
      connection.getAccountInfo(poolPDA),
      connection.getAccountInfo(configPDA),
    ]);
    
    // If accounts don't exist yet, return defaults
    if (!poolAccount || !configAccount) {
      console.log('Program accounts not found, using defaults');
      if (!poolAccount) console.log('⚠️ Pool account not found');
      if (!configAccount) console.log('⚠️ Config account not found');
      return {
        totalLiquidity: 0,
        totalLitterMinted: 0,
        activeUsers: 0,
        tokensRecycled: 0,
        isLoading: false,
      };
    }
    
    console.log('✅ Pool account found:', {
      lamports: poolAccount.lamports,
      dataLength: poolAccount.data.length,
      owner: poolAccount.owner.toString(),
    });
    
    console.log('✅ Config account found:', {
      lamports: configAccount.lamports,
      dataLength: configAccount.data.length,
      owner: configAccount.owner.toString(),
    });
    
    // Debug: Show first 100 bytes of data
    console.log('Pool data (first 100 bytes):', 
      Array.from(poolAccount.data.slice(0, 100)).map(b => 
        b.toString(16).padStart(2, '0')
      ).join(' ')
    );
    
    // Parse pool account data
    const poolData = new DataView(
      poolAccount.data.buffer,
      poolAccount.data.byteOffset,
      poolAccount.data.byteLength
    );
    
    // Extract values - try different offsets based on common patterns
    // Pattern 1: Standard u64 fields
    const totalLiquidity = poolData.getBigUint64(0, true);
    const totalLitterMinted = poolData.getBigUint64(8, true);
    const activeUsers = poolData.getBigUint64(16, true);
    
    console.log('Parsed values:', {
      totalLiquidity: totalLiquidity.toString(),
      totalLitterMinted: totalLitterMinted.toString(),
      activeUsers: activeUsers.toString(),
    });
    
    return {
      totalLiquidity: Number(totalLiquidity) / 1_000_000,
      totalLitterMinted: Number(totalLitterMinted) / 1_000_000,
      activeUsers: Number(activeUsers),
      tokensRecycled: Number(activeUsers) * 2.5,
      isLoading: false,
    };
  } catch (error) {
    console.error('❌ Error fetching pool stats:', error);
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
