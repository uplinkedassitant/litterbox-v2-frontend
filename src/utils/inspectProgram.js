/**
 * Inspect deployed program accounts to discover structure
 * This helps us understand the account layout without the IDL
 */

import { PublicKey, Connection } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');
const RPC_URL = 'https://api.devnet.solana.com';

/**
 * Inspect all program-derived accounts
 */
export async function inspectProgramAccounts() {
  const connection = new Connection(RPC_URL, 'confirmed');
  
  console.log('🔍 Inspecting LitterBox Program Accounts...');
  console.log('Program ID:', PROGRAM_ID.toString());
  
  const results = {
    programData: null,
    configPDA: null,
    poolPDA: null,
    errors: [],
  };
  
  // 1. Get program data
  try {
    const programData = await connection.getAccountInfo(PROGRAM_ID);
    results.programData = programData 
      ? {
          executable: programData.executable,
          owner: programData.owner.toString(),
          dataLength: programData.data.length,
        }
      : null;
    console.log('✅ Program Data:', results.programData);
  } catch (error) {
    console.error('❌ Error fetching program data:', error);
    results.errors.push(error.message);
  }
  
  // 2. Try common PDA patterns
  const seedPatterns = [
    ['config'],
    ['pool'],
    ['virtual_pool'],
    ['Config'],
    ['Pool'],
    ['LITTERBOX'],
    ['state'],
    ['settings'],
  ];
  
  for (const seeds of seedPatterns) {
    try {
      const [pda, bump] = PublicKey.findProgramAddressSync(
        seeds.map(s => new TextEncoder().encode(s)),
        PROGRAM_ID
      );
      
      const accountInfo = await connection.getAccountInfo(pda);
      
      if (accountInfo) {
        console.log(`✅ Found PDA for seeds [${seeds.join(', ')}]:`, {
          address: pda.toString(),
          bump,
          lamports: accountInfo.lamports,
          owner: accountInfo.owner.toString(),
          dataLength: accountInfo.data.length,
          first100Bytes: Array.from(accountInfo.data.slice(0, 100)).map(b => 
            b.toString(16).padStart(2, '0')
          ).join(' '),
        });
        
        if (seeds[0].toLowerCase() === 'config') {
          results.configPDA = {
            address: pda.toString(),
            bump,
            data: accountInfo.data,
            lamports: accountInfo.lamports,
          };
        }
        
        if (seeds[0].toLowerCase() === 'pool' || seeds[0].toLowerCase() === 'virtual_pool') {
          results.poolPDA = {
            address: pda.toString(),
            bump,
            data: accountInfo.data,
            lamports: accountInfo.lamports,
          };
        }
      } else {
        console.log(`⚠️  No account found for seeds [${seeds.join(', ')}]`);
      }
    } catch (error) {
      console.error(`❌ Error checking seeds [${seeds.join(', ')}]:`, error.message);
    }
  }
  
  return results;
}

/**
 * Try to decode account data structure
 */
export function decodeAccountData(data, name = 'Account') {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data for ${name}`);
    return null;
  }
  
  console.log(`\n📊 Decoding ${name} (${data.length} bytes):`);
  
  // Show first 200 bytes as hex
  const hex = Array.from(data.slice(0, 200)).map(b => 
    b.toString(16).padStart(2, '0')
  ).join(' ');
  console.log('First 200 bytes (hex):', hex);
  
  // Try to parse as u64 fields (common pattern)
  try {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    
    console.log('\nTrying to parse as u64 fields:');
    for (let i = 0; i < Math.min(data.length, 100); i += 8) {
      if (i + 8 <= data.length) {
        const value = view.getBigUint64(i, true); // little-endian
        console.log(`  Offset ${i}: ${value.toString()} (${Number(value)})`);
      }
    }
  } catch (error) {
    console.error('Error parsing u64:', error);
  }
  
  return { hex, length: data.length };
}

export default {
  inspectProgramAccounts,
  decodeAccountData,
};
