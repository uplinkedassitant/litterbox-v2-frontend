# 🚀 LitterBox v2 - Quick Deploy Checklist

## ✅ Pre-Deployment (DONE!)

- [x] React + Vite project created
- [x] All dependencies installed
- [x] Tailwind CSS configured
- [x] Components built and tested
- [x] Build successful (623KB JS, 18KB CSS)
- [x] GitHub repository created
- [x] Code pushed to GitHub
- [x] `vercel.json` configuration added
- [x] Environment variables template created
- [x] `.gitignore` properly configured

---

## 🎯 Deploy to Vercel (5 minutes)

### Step 1: Go to Vercel
- URL: https://vercel.com/new
- Sign in with GitHub

### Step 2: Import Repository
- Click "Import Git Repository"
- Select: `uplinkedassitant/litterbox-v2-frontend`
- Click "Import"

### Step 3: Configure (Auto-detected!)
- **Framework:** Vite ✅
- **Build Command:** `npm run build` ✅
- **Output Directory:** `dist` ✅
- **Install Command:** `npm install` ✅

### Step 4: Add Environment Variables
Click "Environment Variables" → "Add" for each:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_PROGRAM_ID` | `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr` | ✅ Production ✅ Preview ✅ Development |
| `VITE_LITTER_MINT` | `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR` | ✅ Production ✅ Preview ✅ Development |
| `VITE_NETWORK` | `devnet` | ✅ Production ✅ Preview ✅ Development |
| `VITE_RPC_URL` | `https://api.devnet.solana.com` | ✅ Production ✅ Preview ✅ Development |

### Step 5: Deploy!
- Click **"Deploy"** button
- Wait 2-3 minutes
- 🎉 Your app is LIVE!

---

## 🧪 Test Your Deployment

### 1. Open Your Vercel URL
- Example: `https://litterbox-v2-frontend.vercel.app`

### 2. Test Wallet Connection
- [ ] Click "Select Wallet"
- [ ] Choose Phantom (or Solflare)
- [ ] Connect wallet
- [ ] Verify wallet address shows

### 3. Test UI Components
- [ ] Token selector opens
- [ ] Search works
- [ ] Can select multiple tokens
- [ ] Deposit form displays
- [ ] Pool stats show (placeholder data)
- [ ] "How It Works" section visible

### 4. Test Responsive Design
- [ ] Mobile view (try Chrome DevTools)
- [ ] Tablet view
- [ ] Desktop view

### 5. Check Console
- [ ] No errors in browser console
- [ ] No 404s in network tab

---

## 📱 Post-Deployment Tasks

### Immediate (Do Today)
- [ ] Deploy to Vercel
- [ ] Test all functionality
- [ ] Share preview URL for feedback

### Short-term (This Week)
- [ ] Integrate actual deposit logic
- [ ] Add real token balance fetching
- [ ] Connect to program accounts
- [ ] Test with real devnet tokens

### Optional (Later)
- [ ] Add custom domain
- [ ] Enable Vercel Analytics
- [ ] Add Jupiter API integration
- [ ] Deploy to production (mainnet)

---

## 🔧 If Something Goes Wrong

### Build Fails
```bash
# Test build locally
npm run build

# Check Node version
node -v  # Should be 18+

# Check dependencies
npm install
```

### Wallet Not Connecting
- Check environment variables in Vercel dashboard
- Verify RPC URL is accessible
- Check browser console for errors

### Styles Not Loading
- Verify `vercel.json` has correct `outputDirectory`
- Check that `tailwind.config.js` is committed
- Redeploy

---

## 📊 Your Deployment Info

**Repository:** https://github.com/uplinkedassitant/litterbox-v2-frontend  
**Vercel Project:** https://vercel.com/dashboard  
**Program ID:** `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr`  
**Token:** `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR`  
**Network:** Solana Devnet  

---

## 🎉 Success Checklist

After deployment, you should have:
- ✅ Live URL (e.g., `litterbox-v2-frontend.vercel.app`)
- ✅ Wallet connection working
- ✅ Token selector functional
- ✅ All UI components rendering
- ✅ Responsive design working
- ✅ No console errors
- ✅ Auto-deploy on git push

---

**Ready to deploy? Let's go! 🚀**

1. Go to https://vercel.com/new
2. Import your repository
3. Add environment variables
4. Click Deploy
5. Celebrate! 🎉
