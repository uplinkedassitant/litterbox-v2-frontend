/**
 * Minimal deposit - assumes ATAs already exist
 * Use this to test if the core deposit works
 */

import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w');
const CONFIG_ACCOUNT = new PublicKey('7bibs5dbBwaUuWCc3yjSH6nu649WmQ7ifVicU4MZ6Ueu');
const POOL_ACCOUNT = new PublicKey('7DgLSphFDzXA29ausgLpeydKzuW3b42HXrLppZb527MQ');
const LITTER_MINT = new PublicKey('9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

export async function submitDepositMinimal(connection, publicKey, amount, sendTransaction) {
  console.log('=== MINIMAL DEPOSIT ===');
  
  const usdcAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
  
  // Derive ATAs (assuming they already exist)
  const userUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
  const poolUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, POOL_ACCOUNT, true);
  const userLitterAta = getAssociatedTokenAddressSync(LITTER_MINT, publicKey);
  
  console.log('User:', publicKey.toString());
  console.log('Amount:', usdcAmount.toString());
  console.log('User USDC ATA:', userUsdcAta.toString());
  console.log('Pool USDC ATA:', poolUsdcAta.toString());
  console.log('User Litter ATA:', userLitterAta.toString());
  
  // Create deposit instruction ONLY (no ATA creation)
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
  
  // Build transaction with ONLY the deposit instruction
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const transaction = new Transaction();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = publicKey;
  transaction.add(depositInstruction);
  
  console.log('Sending minimal transaction...');
  const signature = await sendTransaction(transaction, connection);
  console.log('Signature:', signature);
  
  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );
  
  console.log('Confirmed:', confirmation);
  
  return { success: true, signature };
}
