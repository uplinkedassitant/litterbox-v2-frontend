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

/**
 * Create deposit instruction for a single token
 */
async function createDepositInstruction(
  connection,
  userPubkey,
  tokenMint,
  amount,
  tokenDecimals = 6
) {
  // Get user's token account for the deposit token
  const userTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenMint),
    userPubkey
  );
  
  // Get user's Litter token account
  const userLitterAccount = await getAssociatedTokenAddress(
    LITTER_MINT,
    userPubkey
  );
  
  // Get pool's token account for the deposit token
  const poolTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenMint),
    POOL_ACCOUNT,
    true // Allow owner to be a PDA
  );
  
  // Get pool's Litter token account
  const poolLitterAccount = await getAssociatedTokenAddress(
    LITTER_MINT,
    POOL_ACCOUNT,
    true
  );
  
  // Create deposit instruction data
  // Format: [discriminator (1 byte), amount (8 bytes)]
  // Use Uint8Array instead of Buffer for browser compatibility
  const data = new Uint8Array(9);
  data[0] = DISC_DEPOSIT;
  // Write u64 little-endian
  const amountBN = BigInt(Math.floor(amount * Math.pow(10, tokenDecimals)));
  for (let i = 0; i < 8; i++) {
    data[i + 1] = Number((amountBN >> (8n * BigInt(i))) & 0xFFn);
  }
  
  // Create the instruction
  const keys = [
    { pubkey: userPubkey, isSigner: true, isWritable: true },
    { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true },
    { pubkey: POOL_ACCOUNT, isSigner: false, isWritable: true },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userLitterAccount, isSigner: false, isWritable: true },
    { pubkey: poolLitterAccount, isSigner: false, isWritable: true },
    { pubkey: LITTER_MINT, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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
  
  const instructions = []
  const depositDetails = []
  
  // Create deposit instruction for each token
  for (const [mint, amount] of Object.entries(amounts)) {
    if (!amount || amount <= 0) continue
    
    const token = tokens.find(t => t.mint === mint)
    if (!token) continue
    
    try {
      const { instruction } = await createDepositInstruction(
        connection,
        publicKey,
        mint,
        amount,
        token.decimals || 6
      )
      
      instructions.push(instruction)
      depositDetails.push({
        token: token.symbol,
        amount,
        mint,
      })
    } catch (error) {
      console.error(`Error creating deposit instruction for ${token.symbol}:`, error)
      throw new Error(`Failed to create deposit for ${token.symbol}: ${error.message}`)
    }
  }
  
  if (instructions.length === 0) {
    throw new Error('No valid deposits to submit')
  }
  
  console.log('Creating transaction with', instructions.length, 'instructions')
  
  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  
  // Create transaction with instructions
  const transaction = new Transaction()
  transaction.feePayer = publicKey
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  
  // Add all instructions
  instructions.forEach(ix => transaction.add(ix))
  
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
  
  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${confirmation.value.err}`)
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
