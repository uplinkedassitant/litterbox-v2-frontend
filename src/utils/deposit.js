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
  createTransferInstruction,
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
  wallet,
  tokenMint,
  amount,
  tokenDecimals = 6
) {
  const userPubkey = wallet.publicKey;
  
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
  const data = Buffer.alloc(9);
  data.writeUInt8(DISC_DEPOSIT, 0);
  data.writeBigUInt64LE(BigInt(Math.floor(amount * Math.pow(10, tokenDecimals))), 1);
  
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
  wallet,
  amounts, // { [mint]: amount }
  tokens   // Array of token objects
) {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  console.log('Starting deposit...', { amounts, tokens });
  
  const instructions = [];
  const depositDetails = [];
  
  // Create deposit instruction for each token
  for (const [mint, amount] of Object.entries(amounts)) {
    if (!amount || amount <= 0) continue;
    
    const token = tokens.find(t => t.mint === mint);
    if (!token) continue;
    
    try {
      const { instruction } = await createDepositInstruction(
        connection,
        wallet,
        mint,
        amount,
        token.decimals || 6
      );
      
      instructions.push(instruction);
      depositDetails.push({
        token: token.symbol,
        amount,
        mint,
      });
    } catch (error) {
      console.error(`Error creating deposit instruction for ${token.symbol}:`, error);
      throw new Error(`Failed to create deposit for ${token.symbol}: ${error.message}`);
    }
  }
  
  if (instructions.length === 0) {
    throw new Error('No valid deposits to submit');
  }
  
  console.log('Creating transaction with', instructions.length, 'instructions');
  
  // Get latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  
  // Create transaction
  const transaction = new Transaction();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  
  // Add all instructions
  instructions.forEach(ix => transaction.add(ix));
  
  console.log('Sending transaction...');
  
  // Sign and send
  const signature = await wallet.sendTransaction(transaction, connection);
  
  console.log('Transaction sent:', signature);
  console.log('Waiting for confirmation...');
  
  // Wait for confirmation
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${confirmation.value.err}`);
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
