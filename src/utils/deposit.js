/**
 * Submit deposit transaction to LitterBox program
 * Transfers USDC to pool and mints Litter tokens to user
 */

import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';

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

// Token mints
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// Instruction discriminators
const DISC_DEPOSIT = 1;

/**
 * Create deposit instruction with all required accounts
 * Uses DataView for proper u64 little-endian encoding
 */
function createDepositInstruction(
  userPubkey,
  userUsdcAta,
  poolUsdcAta,
  userLitterAta,
  usdcAmount  // BigInt in smallest units
) {
  console.log('Creating deposit instruction with:', {
    userPubkey: userPubkey.toString(),
    userUsdcAta: userUsdcAta.toString(),
    poolUsdcAta: poolUsdcAta.toString(),
    userLitterAta: userLitterAta.toString(),
    usdcAmount: usdcAmount.toString()
  });

  // Create instruction data: [discriminator (1 byte), usdc_amount as u64 LE (8 bytes)]
  const data = new Uint8Array(9);
  data[0] = DISC_DEPOSIT;
  
  // Use DataView for proper u64 little-endian encoding
  const view = new DataView(data.buffer);
  view.setBigUint64(1, usdcAmount, true); // true = little-endian

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

  console.log('Account keys:', keys.map(k => ({
    pubkey: k.pubkey.toString(),
    isSigner: k.isSigner,
    isWritable: k.isWritable
  })));

  const instruction = new TransactionInstruction({
    keys,
    data,
    programId: PROGRAM_ID,
  });

  console.log('Deposit instruction created:', {
    programId: instruction.programId.toString(),
    dataLength: instruction.data.length,
    keysCount: instruction.keys.length
  });

  return instruction;
}

/**
 * Submit deposit for USDC tokens
 */
export async function submitDeposit(
  connection,
  publicKey,
  amounts,
  tokens,
  sendTransaction
) {
  if (!publicKey) {
    throw new Error('No publicKey provided');
  }

  console.log('=== DEPOSIT STARTED ===');
  console.log('Deposit with publicKey:', publicKey.toString());
  console.log('Submitting deposit...', { amounts, tokens });

  try {
    // Process each token
    for (const [mint, amount] of Object.entries(amounts)) {
      if (!amount || parseFloat(amount) <= 0) continue;

      const token = tokens.find(t => t.mint === mint);
      if (!token) continue;

      // Only support USDC for now
      if (token.symbol !== 'USDC') {
        console.log(`Skipping ${token.symbol} - only USDC supported`);
        continue;
      }

      // Convert to smallest units (micro-USDC for 6 decimals)
      const usdcAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000));

      console.log(`💰 Depositing ${amount} USDC (${usdcAmount.toString()} micro-units)`);

      // Derive all ATA addresses
      const userUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
      // Pool USDC ATA - POOL_ACCOUNT is a PDA, so allowOwnerOffCurve: true is required
      const poolUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, POOL_ACCOUNT, true);
      const userLitterAta = getAssociatedTokenAddressSync(LITTER_MINT, publicKey);

      console.log('ATA addresses:');
      console.log('  - User USDC ATA:', userUsdcAta.toString());
      console.log('  - Pool USDC ATA:', poolUsdcAta.toString());
      console.log('  - User Litter ATA:', userLitterAta.toString());

      const instructions = [];

      // Create idempotent ATA creation instructions (safe if they already exist)
      // Pool USDC ATA - needs to exist to receive deposits
      console.log('Adding Pool USDC ATA creation instruction...');
      instructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          publicKey, // payer
          poolUsdcAta, // ata address
          POOL_ACCOUNT, // owner (the pool PDA)
          USDC_MINT
        )
      );

      // User Litter ATA - needs to exist to receive minted $LITTER
      console.log('Adding User Litter ATA creation instruction...');
      instructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          publicKey, // payer
          userLitterAta, // ata address
          publicKey, // owner (the user)
          LITTER_MINT
        )
      );

      // Create deposit instruction with proper u64 encoding
      console.log('Creating deposit instruction...');
      const depositIx = createDepositInstruction(
        publicKey,
        userUsdcAta,
        poolUsdcAta,
        userLitterAta,
        usdcAmount
      );
      instructions.push(depositIx);

      console.log('Building transaction with', instructions.length, 'instructions...');

      // Build transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = publicKey;
      
      instructions.forEach((ix, idx) => {
        console.log(`Instruction ${idx}:`, {
          programId: ix.programId.toString(),
          keys: ix.keys.map(k => ({ pubkey: k.pubkey.toString(), isSigner: k.isSigner, isWritable: k.isWritable })),
          dataLength: ix.data.length
        });
        transaction.add(ix);
      });

      console.log('Transaction ready:', {
        feePayer: transaction.feePayer?.toString(),
        instructions: transaction.instructions.length,
        recentBlockhash: transaction.recentBlockhash
      });

      console.log('Sending transaction to wallet...');
      
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signature);

      console.log('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );
      console.log('Confirmation result:', confirmation);

      return {
        success: true,
        signature,
        depositDetails: {
          token: 'USDC',
          amount,
          usdcAmount: usdcAmount.toString(),
        },
      };
    }

    throw new Error('No valid deposits. Please use USDC.');
  } catch (error) {
    console.error('=== DEPOSIT FAILED ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.logs) {
      console.error('Program logs:', error.logs);
    }
    throw error;
  }
}
// Force redeploy with correct env vars - Fri Mar 27 07:40:25 PM EDT 2026
