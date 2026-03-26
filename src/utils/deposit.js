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
const DISC_DEPOSIT_MULTI = 5; // Multi-token with Jupiter swap

/**
 * Create multi-token deposit instruction with Jupiter auto-swap
 * Uses discriminator 5 (deposit_multi) to enable Jupiter swap
 */
async function createDepositMultiInstruction(
  connection,
  userPubkey,
  amounts, // { [mint]: amount }
  tokens   // Array of token objects
) {
  // Get user's token accounts for all tokens
  const userTokenAccounts = [];
  const poolTokenAccounts = [];
  
  for (const [mint, amount] of Object.entries(amounts)) {
    const token = tokens.find(t => t.mint === mint);
    if (!token) continue;
    
    // Get user's token account
    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(mint),
      userPubkey
    );
    userTokenAccounts.push(userTokenAccount);
    
    // Get pool's token account
    const poolTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(mint),
      POOL_ACCOUNT,
      true
    );
    poolTokenAccounts.push(poolTokenAccount);
  }
  
  // Get user's and pool's Litter token accounts
  const userLitterAccount = await getAssociatedTokenAddress(
    LITTER_MINT,
    userPubkey
  );
  
  const poolLitterAccount = await getAssociatedTokenAddress(
    LITTER_MINT,
    POOL_ACCOUNT,
    true
  );
  
  // Create deposit_multi instruction data
  // Format: [discriminator (1 byte), token_count (1 byte), min_litter_out (8 bytes)]
  // Total: 10 bytes
  const data = new Uint8Array(10);
  data[0] = DISC_DEPOSIT_MULTI; // Discriminator 5
  data[1] = Object.keys(amounts).length; // token_count
  // min_litter_out = 0 (bytes 2-9)
  // No slippage protection for now
  
  console.log('Creating deposit_multi instruction:');
  console.log('- Discriminator:', DISC_DEPOSIT_MULTI);
  console.log('- Token count:', Object.keys(amounts).length);
  console.log('- Tokens:', Object.keys(amounts).join(', '));
  
  // Create the instruction accounts
  // Backend expects:
  // 0. user [signer, writable]
  // 1. config [writable]
  // 2. virtual_pool [writable]
  // 3. token_accounts[] [writable] - one per token
  // 4. usdc_vault [writable]
  // 5. litter_vault [writable]
  const keys = [
    { pubkey: userPubkey, isSigner: true, isWritable: true },
    { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true },
    { pubkey: POOL_ACCOUNT, isSigner: false, isWritable: true },
    ...userTokenAccounts.map(pubkey => ({ pubkey, isSigner: false, isWritable: true })),
    { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true }, // USDC vault (using config as placeholder)
    { pubkey: LITTER_MINT, isSigner: false, isWritable: true }, // Litter vault (using mint as placeholder)
  ];
  
  const instruction = new TransactionInstruction({
    keys,
    data,
    programId: PROGRAM_ID,
  });
  
  return {
    instruction,
    tokenCount: Object.keys(amounts).length,
    amounts,
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
  
  // Validate we have tokens to deposit
  if (Object.keys(amounts).length === 0) {
    throw new Error('No tokens to deposit')
  }
  
  const depositDetails = Object.entries(amounts).map(([mint, amount]) => {
    const token = tokens.find(t => t.mint === mint)
    return {
      token: token?.symbol || 'Unknown',
      amount,
      mint,
    }
  })
  
  console.log('Deposit details:', depositDetails)
  console.log('Creating deposit_multi transaction')
  
  // Create single multi-token deposit instruction
  const { instruction, tokenCount } = await createDepositMultiInstruction(
    connection,
    publicKey,
    amounts,
    tokens
  )
  
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
