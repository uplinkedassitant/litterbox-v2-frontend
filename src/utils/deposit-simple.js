/**
 * Simplified deposit function with minimal complexity
 * Use this for testing to isolate the issue
 */

import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w');
const CONFIG_ACCOUNT = new PublicKey('7bibs5dbBwaUuWCc3yjSH6nu649WmQ7ifVicU4MZ6Ueu');
const POOL_ACCOUNT = new PublicKey('7DgLSphFDzXA29ausgLpeydKzuW3b42HXrLppZb527MQ');
const LITTER_MINT = new PublicKey('9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

export async function submitDepositSimple(connection, publicKey, amount, sendTransaction) {
  console.log('=== SIMPLE DEPOSIT START ===');
  console.log('Amount:', amount, 'USDC');

  const usdcAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
  console.log('Micro-units:', usdcAmount.toString());

  // Derive ATAs
  const userUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
  const poolUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, POOL_ACCOUNT, true);
  const userLitterAta = getAssociatedTokenAddressSync(LITTER_MINT, publicKey);

  console.log('User USDC ATA:', userUsdcAta.toString());
  console.log('Pool USDC ATA:', poolUsdcAta.toString());
  console.log('User Litter ATA:', userLitterAta.toString());

  // Create instructions
  const instructions = [];

  // 1. Create pool USDC ATA if needed
  instructions.push(
    createAssociatedTokenAccountIdempotentInstruction(
      publicKey,
      poolUsdcAta,
      POOL_ACCOUNT,
      USDC_MINT
    )
  );

  // 2. Create user Litter ATA if needed
  instructions.push(
    createAssociatedTokenAccountIdempotentInstruction(
      publicKey,
      userLitterAta,
      publicKey,
      LITTER_MINT
    )
  );

  // 3. Create deposit instruction
  const data = new Uint8Array(9);
  data[0] = 1; // discriminator
  const view = new DataView(data.buffer);
  view.setBigUint64(1, usdcAmount, true);

  const depositInstruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: publicKey, isSigner: true, isWritable: true },
      { pubkey: userUsdcAta, isSigner: false, isWritable: true },
      { pubkey: poolUsdcAta, isSigner: false, isWritable: true },
      { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: POOL_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: userLitterAta, isSigner: false, isWritable: true },
      { pubkey: LITTER_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });

  instructions.push(depositInstruction);

  console.log('Instructions created:', instructions.length);

  // Build transaction
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const transaction = new Transaction();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = publicKey;

  instructions.forEach(ix => transaction.add(ix));

  console.log('Transaction built, sending...');

  // Send transaction
  const signature = await sendTransaction(transaction, connection);
  console.log('Signature:', signature);

  // Confirm
  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );

  console.log('Confirmed:', confirmation);

  return { success: true, signature };
}
