# 🚀 Deploy to Vercel in 5 Minutes!

## What You Need to Complete

### ✅ Already Done (100% Complete!)
- [x] Fresh React + Vite frontend created
- [x] All UI components built
- [x] Wallet adapter integrated
- [x] Tailwind CSS configured
- [x] Build tested locally (SUCCESS)
- [x] GitHub repository created
- [x] Code pushed to GitHub
- [x] Vercel configuration added (`vercel.json`)
- [x] Environment variables template created
- [x] Documentation complete

### 🎯 What's Left to Deploy (5 minutes!)

**You only need to:**
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import `litterbox-v2-frontend` repository
4. Add 4 environment variables
5. Click "Deploy"

That's it! Everything else is ready! 🎉

---

## Quick Start Deployment

### Option A: Vercel Dashboard (Recommended)

```
1. Visit: https://vercel.com/new
2. Click: "Import Git Repository"
3. Select: uplinkedassitant/litterbox-v2-frontend
4. Click: "Import"
5. Add environment variables (see below)
6. Click: "Deploy"
7. Wait 2-3 minutes
8. Done! 🎉
```

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy from project directory
cd /home/jay/.openclaw/workspace/litterbox-v2-frontend
vercel

# Or deploy to production
vercel --prod
```

---

## Environment Variables

Add these in Vercel dashboard during deployment:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_PROGRAM_ID` | `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr` | All |
| `VITE_LITTER_MINT` | `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR` | All |
| `VITE_NETWORK` | `devnet` | All |
| `VITE_RPC_URL` | `https://api.devnet.solana.com` | All |

**How to add:**
1. During deployment, click "Environment Variables"
2. Click "Add Variable"
3. Enter name and value
4. Select all environments (Production, Preview, Development)
5. Repeat for all 4 variables

---

## What Happens Next?

### After You Click Deploy:

1. **Vercel pulls your code** from GitHub (~10 seconds)
2. **Installs dependencies** (`npm install`) (~30 seconds)
3. **Builds your app** (`npm run build`) (~60 seconds)
4. **Deploys to edge** (global CDN) (~10 seconds)
5. **Generates URL**: `https://litterbox-v2-frontend.vercel.app`

### You'll Get:
- ✅ Live production URL
- ✅ Auto-deploy on every git push
- ✅ Preview URLs for branches
- ✅ Automatic HTTPS
- ✅ Global CDN (fast worldwide)

---

## Test Your Deployment

### 1. Open Your Vercel URL
```
https://litterbox-v2-frontend.vercel.app
```

### 2. Test These Features:
- [ ] Page loads successfully
- [ ] "Connect Wallet" button visible
- [ ] Can open wallet selector modal
- [ ] Token selector works
- [ ] Deposit form displays
- [ ] Pool stats show (placeholder data)
- [ ] "How It Works" section visible
- [ ] Mobile responsive (try on phone)

### 3. Check Console:
- Open browser DevTools (F12)
- No red errors in Console
- No 404s in Network tab

---

## Common Questions

### "Do I need to configure anything else?"
**No!** Everything is configured in `vercel.json`. Just add the 4 environment variables and deploy.

### "What if the build fails?"
Check:
1. Node version is 18+ (`node -v`)
2. All files committed to git
3. `vercel.json` is in the repository
4. Environment variables are set correctly

### "Can I use a custom domain?"
Yes! After deployment:
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records

### "How much does this cost?"
**Free!** Vercel's free tier includes:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Perfect for this project!

### "Will it auto-update when I push code?"
Yes! Every push to `main` branch triggers automatic deployment.

---

## Your Deployment Info

**Repository:** https://github.com/uplinkedassitant/litterbox-v2-frontend  
**Vercel Dashboard:** https://vercel.com/dashboard  
**Vercel Docs:** https://vercel.com/docs  

**Program Details:**
- Program ID: `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr`
- Litter Mint: `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR`
- Network: Solana Devnet

---

## Next Steps After Deployment

### Immediate (Day 1)
- [x] ~~Create frontend~~
- [x] ~~Configure Vercel~~
- [ ] Deploy to Vercel ← **YOU ARE HERE**
- [ ] Test all features
- [ ] Share preview URL

### Short-term (Week 1)
- [ ] Integrate actual deposit logic
- [ ] Fetch real token balances
- [ ] Add Jupiter API for quotes
- [ ] Test with real devnet tokens

### Optional (Later)
- [ ] Add custom domain
- [ ] Enable analytics
- [ ] Deploy to mainnet
- [ ] Add more features

---

## Ready to Deploy?

### Click here to start: https://vercel.com/new

Then:
1. Import your repository
2. Add environment variables
3. Click Deploy
4. Wait 2-3 minutes
5. Celebrate! 🎉

---

**Need help?**
- Full guide: `VERCEL_DEPLOYMENT.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`
- Vercel docs: https://vercel.com/docs

**Let's deploy! 🚀**
