/**
 * Submit deposit transaction to LitterBox program
 * Supports any SPL token (converts to USDC value for virtual tracking)
 */

import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
} from '@solana/spl-token';

// Program configuration
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq'
);

// Account addresses from initialization
const CONFIG_ACCOUNT = new PublicKey(
  import.meta.env.VITE_CONFIG_PDA || 'HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6'
);
const POOL_ACCOUNT = new PublicKey(
  import.meta.env.VITE_POOL_PDA || '3mZR1YUCnwG8Xvc3suibjGW1csyefYxxQhJ5FNLvJfKA'
);
const LITTER_MINT = new PublicKey(
  import.meta.env.VITE_LITTER_MINT || '9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj'
);

// Token prices in USDC (for virtual deposit tracking)
const TOKEN_PRICES = {
  'USDC': 1.0,
  'SOL': 150.0,
  'BONK': 0.00001,
  'WIF': 2.5,
  'POPCAT': 0.5,
};

// Instruction discriminators
const DISC_DEPOSIT = 1;

/**
 * Create deposit instruction for a token
 * Backend tracks virtual USDC value
 */
async function createDepositInstruction(
  connection,
  userPubkey,
  tokenMint,
  usdcValue, // USDC-equivalent value
  tokenDecimals = 6
) {
  // Create deposit instruction data
  // Format: [discriminator (1 byte), usdc_amount (8 bytes), min_litter_out (8 bytes)]
  const data = new Uint8Array(17);
  data[0] = DISC_DEPOSIT;
  
  // Write usdc_amount as u64 little-endian
  const usdcAmountBN = BigInt(Math.floor(usdcValue * Math.pow(10, tokenDecimals)));
  for (let i = 0; i < 8; i++) {
    data[i + 1] = Number((usdcAmountBN >> (8n * BigInt(i))) & 0xFFn);
  }
  
  // Write min_litter_out as u64 little-endian (0 = no minimum)
  const minLitterOut = 0n;
  for (let i = 0; i < 8; i++) {
    data[i + 9] = Number((minLitterOut >> (8n * BigInt(i))) & 0xFFn);
  }
  
  // Backend expects 3 accounts: user, config, pool
  const keys = [
    { pubkey: userPubkey, isSigner: true, isWritable: true },
    { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true },
    { pubkey: POOL_ACCOUNT, isSigner: false, isWritable: true },
  ];
  
  const instruction = new TransactionInstruction({
    keys,
    data,
    programId: PROGRAM_ID,
  });
  
  return { instruction };
}

/**
 * Submit deposit for any SPL token
 * Converts token amount to USDC value using hardcoded prices
 */
export async function submitDeposit(
  connection,
  publicKey,
  amounts, // { [mint]: amount }
  tokens,   // Array of token objects
  sendTransaction
) {
  if (!publicKey) {
    throw new Error('No publicKey provided');
  }
  
  console.log('Deposit with publicKey:', publicKey.toString());
  console.log('Submitting deposit...', { amounts, tokens });
  
  const instructions = [];
  const depositDetails = [];
  
  // Process each token
  for (const [mint, amount] of Object.entries(amounts)) {
    if (!amount || amount <= 0) continue;
    
    const token = tokens.find(t => t.mint === mint);
    if (!token) continue;
    
    // Skip SOL (native) - needs WSOL wrap first
    if (token.symbol === 'SOL') {
      console.log(`Skipping ${token.symbol} - native SOL needs WSOL wrapping`);
      continue;
    }
    
    // Calculate USDC value using token prices
    const usdcValue = amount * (TOKEN_PRICES[token.symbol] || 0);
    
    if (usdcValue > 0) {
      // Create deposit instruction with USDC value
      const { instruction } = await createDepositInstruction(
        connection,
        publicKey,
        mint,
        usdcValue,
        6 // USDC decimals
      );
      
      instructions.push(instruction);
      depositDetails.push({
        token: token.symbol,
        amount,
        usdcValue,
        mint,
      });
    }
  }
  
  if (instructions.length === 0) {
    throw new Error('No valid deposits. USDC works, or wrap SOL to WSOL first.');
  }
  
  const totalUsdcValue = depositDetails.reduce((sum, d) => sum + d.usdcValue, 0);
  console.log(`Processing ${instructions.length} token(s) with total USDC value: $${totalUsdcValue.toFixed(2)}`);
  console.log('Deposit details:', depositDetails);
  
  // Create transaction with all instructions
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const transaction = new Transaction();
  transaction.feePayer = publicKey;
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  
  instructions.forEach(ix => transaction.add(ix));
  
  console.log('Transaction created:');
  console.log('- Instructions:', transaction.instructions.length);
  console.log('- Fee payer:', transaction.feePayer?.toString());
  console.log('- Blockhash:', transaction.recentBlockhash);
  
  console.log('Sending transaction via wallet adapter...');
  
  // Use wallet adapter's sendTransaction
  let signature;
  try {
    signature = await sendTransaction(transaction, connection, { skipPreflight: true });
    console.log('Transaction sent with signature:', signature);
  } catch (error) {
    console.error('sendTransaction error:', error);
    throw error;
  }
  
  if (!signature) {
    throw new Error('No signature returned from sendTransaction');
  }
  
  console.log('Waiting for confirmation...');
  
  // Wait for confirmation
  const latestBlockhash = await connection.getLatestBlockhash();
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    'confirmed'
  );
  
  console.log('Confirmation result:', confirmation);
  
  if (confirmation.value.err) {
    console.error('Transaction error details:', confirmation.value.err);
    const errorMsg = typeof confirmation.value.err === 'object' 
      ? JSON.stringify(confirmation.value.err) 
      : confirmation.value.err.toString();
    throw new Error(`Transaction failed: ${errorMsg}`);
  }
  
  console.log('✅ Deposit successful!', {
    signature,
    deposits: depositDetails,
  });
  
  return {
    signature,
    deposits: depositDetails,
  };
}

export default {
  submitDeposit,
  PROGRAM_ID,
  LITTER_MINT,
};
