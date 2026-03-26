/**
 * Submit deposit transaction to LitterBox program
 * Handles multi-token deposits with Jupiter swap integration
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
const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');
const LITTER_MINT = new PublicKey('FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR');

// Account addresses from initialization
const CONFIG_ACCOUNT = new PublicKey('6z5WTnmMeiu1E68nxHSSnkyUgrzLWJvSvxdBJx59HG2a');
const POOL_ACCOUNT = new PublicKey('Gz6sd1RT2xFt7QxfNrR7pEpxvqPkqTUV4GKLxZ7XnTMu');

// Instruction discriminators
const DISC_DEPOSIT = 1;
// Note: DISC_DEPOSIT_MULTI (5) not yet implemented in backend
// const DISC_DEPOSIT_MULTI = 5;

/**
 * Create deposit instruction for USDC (works with current backend)
 * Note: Multi-token Jupiter swap requires backend implementation of deposit_multi
 */
async function createDepositInstruction(
  connection,
  userPubkey,
  tokenMint,
  amount,
  tokenDecimals = 6
) {
  // Get user's token account
  const userTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenMint),
    userPubkey
  );
  
  // Get user's Litter token account  
  const userLitterAccount = await getAssociatedTokenAddress(
    LITTER_MINT,
    userPubkey
  );
  
  // Get pool's token account
  const poolTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenMint),
    POOL_ACCOUNT,
    true
  );
  
  // Get pool's Litter token account
  const poolLitterAccount = await getAssociatedTokenAddress(
    LITTER_MINT,
    POOL_ACCOUNT,
    true
  );
  
  // Create deposit instruction data
  // Format: [discriminator (1 byte), usdc_amount (8 bytes), min_litter_out (8 bytes)]
  const data = new Uint8Array(17);
  data[0] = DISC_DEPOSIT;
  
  // Write usdc_amount as u64 little-endian
  const usdcAmountBN = BigInt(Math.floor(amount * Math.pow(10, tokenDecimals)));
  for (let i = 0; i < 8; i++) {
    data[i + 1] = Number((usdcAmountBN >> (8n * BigInt(i))) & 0xFFn);
  }
  
  // Write min_litter_out as u64 little-endian (set to 0)
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
  
  return {
    instruction,
    tokenMint,
    amount,
  };
}

/**
 * Submit deposit for multiple tokens
 */
export async function submitDeposit(
  connection,
  publicKey,
  amounts, // { [mint]: amount }
  tokens,   // Array of token objects
  sendTransaction // Wallet adapter's sendTransaction function
) {
  if (!publicKey) {
    throw new Error('No publicKey provided')
  }
  
  console.log('Deposit with publicKey:', publicKey.toString())
  console.log('Submitting deposit...', { amounts, tokens })
  
  // For now, only process USDC deposits (backend doesn't have deposit_multi yet)
  const usdcAmount = amounts['4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU']
  
  if (!usdcAmount || usdcAmount <= 0) {
    throw new Error('Only USDC deposits supported currently. Multi-token Jupiter swap requires backend implementation.')
  }
  
  console.log('Creating USDC deposit instruction (Jupiter multi-token not yet implemented in backend)')
  
  // Create deposit instruction for USDC
  const { instruction } = await createDepositInstruction(
    connection,
    publicKey,
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    usdcAmount,
    6
  )
  
  const depositDetails = [{
    token: 'USDC',
    amount: usdcAmount,
    mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  }]
  
  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  
  // Create transaction
  const transaction = new Transaction()
  transaction.feePayer = publicKey
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  
  // Add the multi-deposit instruction
  transaction.add(instruction)
  
  console.log('Transaction created:')
  console.log('- Instructions:', transaction.instructions.length)
  console.log('- Fee payer:', transaction.feePayer?.toString())
  console.log('- Blockhash:', transaction.recentBlockhash)
  
  console.log('Sending transaction via wallet adapter...')
  console.log('Transaction instructions:', transaction.instructions.length)
  console.log('Transaction feePayer:', transaction.feePayer?.toString())
  console.log('Transaction recentBlockhash:', transaction.recentBlockhash)
  
  // Use wallet adapter's sendTransaction (handles signing)
  let signature
  try {
    const result = await sendTransaction(transaction, connection, { skipPreflight: true })
    signature = result
    console.log('Transaction sent with signature:', signature)
  } catch (error) {
    console.error('sendTransaction error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    throw error
  }
  
  if (!signature) {
    throw new Error('No signature returned from sendTransaction')
  }
  
  console.log('Waiting for confirmation...')
  
  // Wait for confirmation using the connection directly
  const latestBlockhash = await connection.getLatestBlockhash()
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    'confirmed'
  )
  
  console.log('Confirmation result:', confirmation)
  
  if (confirmation.value.err) {
    console.error('Transaction error details:', confirmation.value.err)
    const errorMsg = typeof confirmation.value.err === 'object' 
      ? JSON.stringify(confirmation.value.err) 
      : confirmation.value.err.toString()
    throw new Error(`Transaction failed: ${errorMsg}`)
  }
  
  console.log('✅ Deposit successful!', {
    signature,
    deposits: depositDetails,
  })
  
  return {
    signature,
    deposits: depositDetails,
  }
}

export default {
  submitDeposit,
  PROGRAM_ID,
  LITTER_MINT,
}
