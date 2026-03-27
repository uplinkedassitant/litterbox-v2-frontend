/**
 * Jupiter V6 Swap Integration
 * 
 * Handles swapping any SPL token to USDC via Jupiter Aggregator
 * Documentation: https://docs.jup.ag/
 */

const JUP_API = 'https://quote-api.jup.ag/v6';
const USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Devnet USDC

/**
 * Get swap quote from Jupiter
 * @param {string} inputMint - Token to swap from (e.g., BONK mint)
 * @param {number} amount - Amount in smallest units (with decimals)
 * @param {string} slippageBps - Slippage in basis points (e.g., 50 = 0.5%)
 */
export async function getSwapQuote(inputMint, amount, slippageBps = 50) {
  const url = `${JUP_API}/quote?inputMint=${inputMint}&outputMint=${USDC_MINT}&amount=${amount}&slippageBps=${slippageBps}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.statusText}`);
    }
    const quote = await response.json();
    return quote;
  } catch (error) {
    console.error('Failed to get Jupiter quote:', error);
    throw error;
  }
}

/**
 * Get swap transaction from Jupiter
 * @param {string} userPublicKey - User's wallet address
 * @param {object} quote - Quote from getSwapQuote
 * @param {number} slippageBps - Slippage tolerance
 */
export async function getSwapTransaction(userPublicKey, quote, slippageBps = 50) {
  const response = await fetch(`${JUP_API}/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      slippageBps,
      wrapAndSolIfNeeded: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Jupiter swap API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Execute token swap via Jupiter
 * @param {object} connection - Solana connection
 * @param {object} wallet - Wallet adapter
 * @param {string} inputMint - Token to swap from
 * @param {number} amount - Amount to swap
 * @param {number} slippageBps - Slippage tolerance
 */
export async function swapTokenToUSDC(
  connection,
  wallet,
  inputMint,
  amount,
  slippageBps = 50
) {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  console.log('🔄 Getting Jupiter quote for swap...', {
    inputMint,
    amount,
    slippageBps,
  });

  // Step 1: Get quote
  const quote = await getSwapQuote(inputMint, amount, slippageBps);
  
  console.log('💰 Quote received:', {
    inAmount: quote.inAmount,
    outAmount: quote.outAmount,
    priceImpactPct: quote.priceImpactPct,
  });

  // Step 2: Get swap transaction
  const { swapTransaction } = await getSwapTransaction(
    wallet.publicKey.toString(),
    quote,
    slippageBps
  );

  // Step 3: Deserialize transaction
  const transaction = Transaction.from(
    Buffer.from(swapTransaction, 'base64')
  );

  // Step 4: Get latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;

  // Step 5: Send transaction
  console.log('📤 Sending swap transaction...');
  const signature = await wallet.sendTransaction(transaction, connection);
  
  console.log('⏳ Waiting for swap confirmation...');
  const confirmation = await connection.confirmTransaction(signature, 'confirmed');
  
  if (confirmation.value.err) {
    throw new Error(`Swap failed: ${confirmation.value.err}`);
  }

  console.log('✅ Swap successful!', { signature });

  return {
    signature,
    inAmount: quote.inAmount,
    outAmount: quote.outAmount,
    priceImpactPct: quote.priceImpactPct,
  };
}

/**
 * Get token price in USDC
 * @param {string} mint - Token mint address
 * @param {number} amount - Amount of tokens
 */
export async function getTokenUSDCValue(mint, amount) {
  try {
    const quote = await getSwapQuote(mint, amount, 0);
    return {
      usdcValue: parseFloat(quote.outAmount) / 1e6, // Convert from USDC decimals
      price: parseFloat(quote.outAmount) / parseFloat(quote.inAmount),
    };
  } catch (error) {
    console.error('Failed to get token price:', error);
    return { usdcValue: 0, price: 0 };
  }
}

export default {
  getSwapQuote,
  getSwapTransaction,
  swapTokenToUSDC,
  getTokenUSDCValue,
  USDC_MINT,
};
