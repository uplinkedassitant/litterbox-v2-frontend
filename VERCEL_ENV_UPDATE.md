# 🔄 Vercel Environment Variables Update

## ✅ What Was Updated

The `vercel.json` file has been updated with the new program configuration:

### Old Values:
```json
{
  "VITE_PROGRAM_ID": "B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr",
  "VITE_LITTER_MINT": "FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR"
}
```

### New Values:
```json
{
  "VITE_PROGRAM_ID": "BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq",
  "VITE_CONFIG_PDA": "HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6",
  "VITE_POOL_PDA": "3iSk4FyKkGKrUiHXJse26uRdMwzX3n7mmfUDkCLYSVGo",
  "VITE_LITTER_MINT": "9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj"
}
```

---

## 📋 Complete Environment Variables List

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_PROGRAM_ID` | `BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq` | New program ID |
| `VITE_CONFIG_PDA` | `HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6` | Config PDA address |
| `VITE_POOL_PDA` | `3iSk4FyKkGKrUiHXJse26uRdMwzX3n7mmfUDkCLYSVGo` | Pool PDA address |
| `VITE_LITTER_MINT` | `9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj` | Litter token mint |
| `VITE_NETWORK` | `devnet` | Solana network |
| `VITE_RPC_URL` | `https://api.devnet.solana.com` | RPC endpoint |

---

## 🚀 How to Update Vercel Environment Variables

### Option 1: Using Vercel CLI (Recommended)

```bash
cd /home/jay/.openclaw/workspace/litterbox-v2-frontend

# Login to Vercel (if not already)
vercel login

# Update environment variables
vercel env add VITE_PROGRAM_ID BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq
vercel env add VITE_CONFIG_PDA HogdhWq5BvA184quA9JVcw7wWPHVuwFqCHb3we1pFSz6
vercel env add VITE_POOL_PDA 3iSk4FyKkGKrUiHXJse26uRdMwzX3n7mmfUDkCLYSVGo
vercel env add VITE_LITTER_MINT 9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj
vercel env add VITE_NETWORK devnet
vercel env add VITE_RPC_URL https://api.devnet.solana.com

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Edit the following variables:
   - `VITE_PROGRAM_ID`
   - `VITE_CONFIG_PDA`
   - `VITE_POOL_PDA`
   - `VITE_LITTER_MINT`
   - `VITE_NETWORK`
   - `VITE_RPC_URL`
5. Click **Save**
6. Redeploy the project

### Option 3: Using vercel.json (Already Done!)

The `vercel.json` file has been updated with all environment variables. When you deploy, Vercel will automatically use these values.

```bash
# Just deploy
vercel --prod
```

---

## 🔍 Verification Steps

After updating, verify the environment variables:

### 1. Check vercel.json
```bash
cat vercel.json
```

### 2. Check deployed environment variables
```bash
vercel env ls
```

### 3. Test in browser
1. Open your Vercel deployment
2. Open browser console (F12)
3. Check that the correct program ID is being used:
```javascript
// In browser console
console.log(import.meta.env.VITE_PROGRAM_ID)
// Should output: BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq
```

---

## ⚠️ Important Notes

### Environment Variable Precedence
Vercel environment variables take precedence over `.env` files:
1. **Vercel Env Vars** (highest priority)
2. `.env.production`
3. `.env.local`
4. `.env` (lowest priority)

### When to Update Vercel vs Local
- **Update Vercel Env Vars** when deploying to production
- **Update `.env`** for local development
- **Update `vercel.json`** for permanent configuration

### Security Note
All these variables are public (prefixed with `VITE_`), which is fine because:
- Program IDs are public by nature
- PDA addresses are public
- No private keys or secrets are stored

---

## 🎯 Deployment Checklist

- [x] Update `vercel.json` with new values ✅
- [ ] Run `vercel env ls` to verify
- [ ] Deploy with `vercel --prod`
- [ ] Test deployment in browser
- [ ] Verify program ID in console
- [ ] Test deposit functionality
- [ ] Verify transactions on Solana explorer

---

## 🔄 Rollback (If Needed)

If you need to rollback to the old program:

```bash
# Update vercel.json back to old values
cat > vercel.json << 'EOF'
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_PROGRAM_ID": "B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr",
    "VITE_LITTER_MINT": "FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR",
    "VITE_NETWORK": "devnet",
    "VITE_RPC_URL": "https://api.devnet.solana.com"
  }
}
EOF

# Redeploy
vercel --prod
```

---

## 📊 New Program Information

**Program:** `BaLn7BEZCwsLaTqZcdogBy7B8NELJBHQn6Xt5ZnC2erq`
**Network:** Solana Devnet
**Status:** ✅ Initialized and ready
**Features:**
- PDA creation via invoke_signed
- Real USDC transfers
- Real Litter token minting
- Multi-token support via Jupiter

---

**Last Updated:** 2026-03-27 07:40 EDT
**Status:** ✅ vercel.json updated, ready for deployment
