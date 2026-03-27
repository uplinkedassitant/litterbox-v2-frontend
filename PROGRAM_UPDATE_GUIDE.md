# 🔄 Frontend Update Guide - New Program Deployment

## New Program Details

**Old Program ID:** `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr`
**New Program ID:** `BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq`

**Network:** Solana Devnet

## PDA Addresses

**Config PDA:** `HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6`
**Pool PDA:** `3iSk4FyKkGKrUiHXJse26uRdMwzX3n7mmfUDkCLYSVGo`
**Litter Mint:** `9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj`

---

## Files to Update

### 1. Environment Variables (Optional but Recommended)

Create or update `.env` file in the frontend root:

```bash
VITE_PROGRAM_ID=BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq
VITE_CONFIG_PDA=HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6
VITE_POOL_PDA=3iSk4FyKkGKrUiHXJse26uRdMwzX3n7mmfUDkCLYSVGo
VITE_LITTER_MINT=9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj
VITE_NETWORK=devnet
```

### 2. Update Program ID References

**File: `src/utils/litterboxProgram.js`**
```javascript
// OLD:
const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

// NEW:
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq'
);
```

**File: `src/utils/deposit.js`**
```javascript
// OLD:
const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

// NEW:
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq'
);
```

**File: `src/utils/poolStats.js`**
```javascript
// OLD:
const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

// NEW:
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq'
);
```

**File: `src/utils/inspectProgram.js`**
```javascript
// OLD:
const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

// NEW:
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq'
);
```

### 3. Update Instruction Structure (CRITICAL!)

The new program has a **DIFFERENT instruction structure**. Here's what changed:

#### Initialize Instruction (Discriminator: 0)

**Old Structure:**
- Account 0: authority [signer]
- Account 1: config [writable]
- Account 2: pool [writable]
- Account 3: litter_mint []

**New Structure:** (SAME - No changes needed!)
- Account 0: authority [signer]
- Account 1: config [writable]
- Account 2: pool [writable]
- Account 3: litter_mint []
- Account 4: system_program [] ← **NEW!**

⚠️ **ACTION REQUIRED:** Add system program to initialize instruction!

#### Deposit Instruction (Discriminator: 1)

**Old Structure:**
- Account 0: user [signer]
- Account 1: config [writable]
- Account 2: pool [writable]
- Account 3: user_usdc [writable]
- Account 4: pool_usdc [writable]
- Account 5: litter_mint []
- Account 6: user_litter [writable]

**New Structure:** (SAME - No changes needed!)

The deposit instruction structure is **IDENTICAL**, so existing deposit code should work!

### 4. Update Initialize Script

If you have an initialize script, update it to include the system program:

```javascript
const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111');

const transaction = new Transaction().add({
  keys: [
    { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    { pubkey: configPDA, isSigner: false, isWritable: true },
    { pubkey: poolPDA, isSigner: false, isWritable: true },
    { pubkey: LITTER_MINT, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false }, // ← ADD THIS
  ],
  data: initData,
  programId: PROGRAM_ID,
});
```

---

## Quick Update Commands

Run these commands to update all program ID references:

```bash
cd /home/jay/.openclaw/workspace/litterbox-v2-frontend

# Create .env file
cat > .env << 'EOF'
VITE_PROGRAM_ID=BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq
VITE_CONFIG_PDA=HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6
VITE_POOL_PDA=3iSk4FyKkGKrUiHXJse26uRdMwzX3n7mmfUDkCLYSVGo
VITE_LITTER_MINT=9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj
VITE_NETWORK=devnet
EOF

# Update all program ID references
find src/ -name "*.js" -type f -exec sed -i "s/B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr/BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq/g" {} \;

echo "✅ Frontend updated to new program!"
```

---

## Testing Checklist

After updating:

1. ✅ **Check Program ID:** Verify all files use new program ID
2. ✅ **Test Connection:** Frontend should connect to new program
3. ✅ **Test Deposit:** Try depositing 1 USDC
4. ✅ **Verify Pool Stats:** Pool stats should update
5. ✅ **Test Multi-Token:** Test BONK/WIF/POPCAT deposits via Jupiter
6. ✅ **Check Balances:** User should receive Litter tokens

---

## Deployment Steps

1. **Update frontend code** (run commands above)
2. **Rebuild frontend:**
   ```bash
   npm run build
   ```
3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
4. **Test on Vercel deployment**
5. **Verify all functionality works**

---

## Rollback Plan

If something goes wrong, you can quickly rollback:

```bash
# Revert program ID changes
find src/ -name "*.js" -type f -exec sed -i "s/BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq/B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr/g" {} \;

# Rebuild and redeploy
npm run build
vercel --prod
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify program ID in Solana explorer
3. Check PDA derivations match
4. Test with small amounts first

**New Program Explorer:** https://explorer.solana.com/address/BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq?cluster=devnet

---

**Status:** Ready for deployment
**Date:** 2026-03-27 07:15 EDT
