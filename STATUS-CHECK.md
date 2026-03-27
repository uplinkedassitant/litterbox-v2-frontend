# Deployment Status Check

## Current Deployment

**Latest commit**: `dd273bf` - docs: Add DEPLOY.md with environment variable documentation

**Vercel Status**: Check at https://litterbox-v2-frontend.vercel.app

## How to Verify Correct Program ID

1. **Open browser console** (F12)
2. **Go to** https://litterbox-v2-frontend.vercel.app
3. **Look for** this log line:
   ```
   Deposit instruction created: {programId: '5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w', ...}
   ```

✅ **Correct**: `programId: '5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w'`
❌ **Wrong**: `programId: 'B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr'`

## If Still Showing Old Program ID

### Option 1: Wait for Vercel
Vercel deployments take 2-5 minutes. Wait and hard refresh (Ctrl+Shift+R).

### Option 2: Check Vercel Dashboard
1. Go to https://vercel.com/uplinkedassitant/litterbox-v2-frontend
2. Check "Deployments" tab
3. Look for latest deployment status
4. If failed, check logs

### Option 3: Manual Environment Variable Check
If Vercel isn't picking up vercel.json env vars:

1. Go to Vercel Dashboard
2. Select project: `litterbox-v2-frontend`
3. Settings → Environment Variables
4. Manually add:
   - `VITE_PROGRAM_ID` = `5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w`
   - `VITE_CONFIG_PDA` = `7bibs5dbBwaUuWCc3yjSH6nu649WmQ7ifVicU4MZ6Ueu`
   - `VITE_POOL_PDA` = `7DgLSphFDzXA29ausgLpeydKzuW3b42HXrLppZb527MQ`
   - `VITE_LITTER_MINT` = `9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj`
   - `VITE_NETWORK` = `devnet`
   - `VITE_RPC_URL` = `https://api.devnet.solana.com`
5. Redeploy

## Expected Behavior After Fix

When you click "Deposit 3 USDC":
1. Console shows: `=== DEPOSIT STARTED ===`
2. Console shows: `Deposit instruction created: {programId: '5w927F3...', ...}`
3. Wallet popup appears asking to approve transaction
4. After approval: Transaction succeeds! 🎉

## Files Changed

- ✅ `vercel.json` - Contains correct env vars
- ✅ `.env` - Local template with correct values
- ✅ `.env.local` - Local override (gitignored)
- ✅ `src/utils/deposit.js` - Uses env vars for Program ID
