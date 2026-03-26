# 🔧 Environment Variables Setup for Vercel

## ⚠️ Critical: Set These in Vercel!

Your app is failing because the RPC URL environment variable is not set in Vercel.

---

## 🎯 Quick Fix (Do This Now!)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on: `litterbox-v2-frontend` project
3. Go to: **Settings** tab
4. Click: **Environment Variables**

### Step 2: Add These Variables

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_RPC_URL` | `https://api.devnet.solana.com` | ✅ Production ✅ Preview ✅ Development |
| `VITE_PROGRAM_ID` | `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr` | ✅ Production ✅ Preview ✅ Development |
| `VITE_LITTER_MINT` | `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR` | ✅ Production ✅ Preview ✅ Development |
| `VITE_NETWORK` | `devnet` | ✅ Production ✅ Preview ✅ Development |

### Step 3: Redeploy
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Wait for build to complete

---

## 📝 Local Development (.env.local)

Create a `.env.local` file in your project root:

```env
# Solana Configuration
VITE_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr
VITE_LITTER_MINT=FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR
VITE_NETWORK=devnet
```

**Note:** `.env.local` is gitignored and only works for local development. You MUST set these in Vercel dashboard for production.

---

## 🔍 Why This Happens

- Vercel doesn't automatically know your environment variables
- Each Vercel project needs variables set separately
- Environment variables are NOT stored in git (security!)
- You must set them in Vercel dashboard

---

## ✅ Verification

After setting variables in Vercel:

1. **Check Vercel Deployment Logs**
   - Should see: `VITE_RPC_URL` in build output
   - Should NOT see: "Endpoint URL must start with http"

2. **Test Your Site**
   - App loads without errors
   - Wallet connect button works
   - No console errors about RPC URL

---

## 🐛 Troubleshooting

### Error: "Endpoint URL must start with http:"
**Cause:** `VITE_RPC_URL` not set or invalid  
**Fix:** Set `VITE_RPC_URL=https://api.devnet.solana.com` in Vercel

### Error: "WalletContext without providing one"
**Cause:** Provider wrapping issue  
**Fix:** Already fixed in latest code - just redeploy

### App Still Shows Blank Page
**Fix:** 
1. Clear browser cache
2. Check Vercel deployment succeeded
3. Check browser console for errors

---

## 📚 Resources

- **Vercel Env Vars Guide:** https://vercel.com/docs/environment-variables
- **Your Project Settings:** https://vercel.com/dashboard
- **Solana Devnet RPC:** https://api.devnet.solana.com

---

**Status:** ⚠️ **ACTION REQUIRED** - Set environment variables in Vercel!  
**Next:** After setting vars, redeploy and test wallet connection.
