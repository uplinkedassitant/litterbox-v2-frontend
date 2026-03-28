/**
 * Test deposit simulation to diagnose wallet error
 * Run this in browser console or as a Node script
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const PROGRAM_ID = new PublicKey('5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w');
const CONFIG_PDA = new PublicKey('7bibs5dbBwaUuWCc3yjSH6nu649WmQ7ifVicU4MZ6Ueu');
const POOL_PDA = new PublicKey('7DgLSphFDzXA29ausgLpeydKzuW3b42HXrLppZb527MQ');
const LITTER_MINT = new PublicKey('9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj');
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function testSimulation() {
  const userPubkey = new PublicKey('41EUfWmadQjJnjjqrCFaBxC8BznuN2BUJnj9MhVYJ1o4');
  const usdcAmount = BigInt(3000000); // 3 USDC

  console.log('🔍 Testing deposit simulation...');
  console.log('User:', userPubkey.toString());
  console.log('Amount:', usdcAmount.toString());

  // Derive ATAs
  const userUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, userPubkey);
  const poolUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, POOL_PDA, true);
  const userLitterAta = getAssociatedTokenAddressSync(LITTER_MINT, userPubkey);

  console.log('User USDC ATA:', userUsdcAta.toString());
  console.log('Pool USDC ATA:', poolUsdcAta.toString());
  console.log('User Litter ATA:', userLitterAta.toString());

  // Create deposit instruction
  const data = new Uint8Array(9);
  data[0] = 1; // discriminator
  const view = new DataView(data.buffer);
  view.setBigUint64(1, usdcAmount, true);

  const keys = [
    { pubkey: userPubkey, isSigner: true, isWritable: true },
    { pubkey: userUsdcAta, isSigner: false, isWritable: true },
    { pubkey: poolUsdcAta, isSigner: false, isWritable: true },
    { pubkey: CONFIG_PDA, isSigner: false, isWritable: true },
    { pubkey: POOL_PDA, isSigner: false, isWritable: true },
    { pubkey: userLitterAta, isSigner: false, isWritable: true },
    { pubkey: LITTER_MINT, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    data,
    programId: PROGRAM_ID,
  });

  // Build transaction
  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = userPubkey;
  transaction.add(instruction);

  console.log('Simulating transaction...');
  const simResult = await connection.simulateTransaction(transaction, {
    commitment: 'confirmed',
    verifySignatures: false,
  });

  console.log('Simulation result:', simResult);
  
  if (simResult.value.err) {
    console.error('❌ Simulation FAILED:');
    console.error('Error:', simResult.value.err);
    if (simResult.value.logs) {
      console.error('Logs:', simResult.value.logs);
    }
    return false;
  } else {
    console.log('✅ Simulation SUCCESSFUL!');
    if (simResult.value.logs) {
      console.log('Logs:', simResult.value.logs);
    }
    return true;
  }
}

testSimulation().catch(console.error);
