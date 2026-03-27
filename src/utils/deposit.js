/**
 * Submit deposit transaction to LitterBox program
 * Transfers USDC to pool and mints Litter tokens to user
 */

import { PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// Program configuration
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || '5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w'
);

// Account addresses from initialization
const CONFIG_ACCOUNT = new PublicKey(
  import.meta.env.VITE_CONFIG_PDA || '7bibs5dbBwaUuWCc3yjSH6nu649WmQ7ifVicU4MZ6Ueu'
);
const POOL_ACCOUNT = new PublicKey(
  import.meta.env.VITE_POOL_PDA || '7DgLSphFDzXA29ausgLpeydKzuW3b42HXrLppZb527MQ'
);
const LITTER_MINT = new PublicKey(
  import.meta.env.VITE_LITTER_MINT || '9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj'
);

// Instruction discriminators
const DISC_DEPOSIT = 1;

/**
 * Create deposit instruction
 * 
 * Account layout:
 * 0. [signer, writable] user
 * 1. [writable] user_usdc_ata
 * 2. [writable] pool_usdc_ata
 * 3. [writable] config_pda
 * 4. [writable] pool_pda
 * 5. [writable] user_litter_ata
 * 6. [] litter_mint
 * 7. [] token_program
 */
async function createDepositInstruction(
  connection,
  userPubkey,
  usdcAmount,  // Amount in smallest units (e.g., micro-USDC)
  minLitterOut = 0n  // Minimum Litter tokens to receive
) {
  // Get token account addresses
  const userUsdcAta = await getAssociatedTokenAddress(
    new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'), // USDC mint
    userPubkey
  );
  
  const poolUsdcAta = await getAssociatedTokenAddress(
    new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'), // USDC mint
    POOL_ACCOUNT
  );
  
  const userLitterAta = await getAssociatedTokenAddress(
    LITTER_MINT,
    userPubkey
  );

  // Create instruction data: [discriminator (1 byte), usdc_amount (8 bytes)]
  const data = new Uint8Array(9);
  data[0] = DISC_DEPOSIT;
  
  // Write usdc_amount as u64 little-endian
  for (let i = 0; i < 8; i++) {
    data[i + 1] = Number((usdcAmount >> (8n * BigInt(i))) & 0xFFn);
  }

  // Create account keys
  const keys = [
    { pubkey: userPubkey, isSigner: true, isWritable: true },           // 0. user
    { pubkey: userUsdcAta, isSigner: false, isWritable: true },         // 1. user_usdc_ata
    { pubkey: poolUsdcAta, isSigner: false, isWritable: true },         // 2. pool_usdc_ata
    { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true },      // 3. config_pda
    { pubkey: POOL_ACCOUNT, isSigner: false, isWritable: true },        // 4. pool_pda
    { pubkey: userLitterAta, isSigner: false, isWritable: true },       // 5. user_litter_ata
    { pubkey: LITTER_MINT, isSigner: false, isWritable: false },        // 6. litter_mint
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },   // 7. token_program
  ];

  const instruction = new TransactionInstruction({
    keys,
    data,
    programId: PROGRAM_ID,
  });

  return { instruction };
}

/**
 * Submit deposit for USDC tokens
 */
export async function submitDeposit(
  connection,
  publicKey,
  amounts,  // { [mint]: amount }
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

    // Only support USDC for now
    if (token.symbol !== 'USDC') {
      console.log(`Skipping ${token.symbol} - only USDC supported`);
      continue;
    }

    // Convert to smallest units (micro-USDC for 6 decimals)
    const usdcAmount = BigInt(Math.floor(amount * 1_000_000));

    try {
      // Create deposit instruction with all required accounts
      const { instruction } = await createDepositInstruction(
        connection,
        publicKey,
        usdcAmount,
        0n  // No minimum Litter out
      );

      instructions.push(instruction);
      depositDetails.push({
        token: token.symbol,
        amount,
        usdcAmount: usdcAmount.toString(),
        mint,
      });
    } catch (error) {
      console.error(`Error creating deposit instruction for ${token.symbol}:`, error);
      throw error;
    }
  }

  if (instructions.length === 0) {
    throw new Error('No valid deposits. Please use USDC.');
  }

  console.log('Deposit details:', depositDetails);

  // Create and send transaction
  const transaction = new Transaction();
  transaction.add(...instructions);

  console.log('Transaction created:');
  console.log('- Instructions:', instructions.length);
  console.log('- Fee payer:', publicKey.toString());

  try {
    console.log('Sending transaction via wallet adapter...');
    const signature = await sendTransaction(transaction, connection);
    console.log('Transaction sent with signature:', signature);

    console.log('Waiting for confirmation...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    console.log('Confirmation result:', confirmation);

    return {
      success: true,
      signature,
      depositDetails,
    };
  } catch (error) {
    console.error('Transaction error details:', error);
    throw error;
  }
}
