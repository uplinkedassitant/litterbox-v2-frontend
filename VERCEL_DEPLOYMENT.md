# 🚀 LitterBox v2 - Vercel Deployment Guide

## ✅ What You Need to Deploy

### 1. Vercel Account
- Go to https://vercel.com
- Sign up with GitHub (recommended) or email
- Free tier is perfect for this project!

### 2. GitHub Repository
- ✅ Already done: https://github.com/uplinkedassitant/litterbox-v2-frontend

### 3. Environment Variables
Set these in Vercel dashboard (see below)

---

## 📋 Pre-Deployment Checklist

### Files Ready ✅
- [x] `vercel.json` - Vercel configuration
- [x] `.env.example` - Environment template
- [x] `.env.local` - Local development (gitignored)
- [x] `.gitignore` - Properly configured
- [x] `package.json` - All dependencies
- [x] `vite.config.js` - Build configuration
- [x] `tailwind.config.js` - Styling config

### Code Ready ✅
- [x] React 18 + Vite
- [x] Tailwind CSS
- [x] Solana Wallet Adapter
- [x] All components functional
- [x] Build tested locally

---

## 🎯 Deployment Steps

### Option 1: Vercel Dashboard (Easiest)

#### Step 1: Import Project
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `uplinkedassitant/litterbox-v2-frontend`
4. Click "Import"

#### Step 2: Configure Build
- **Framework:** Vite (auto-detected)
- **Root Directory:** `./` (leave blank)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Step 3: Add Environment Variables
Click "Environment Variables" and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_PROGRAM_ID` | `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr` | All |
| `VITE_LITTER_MINT` | `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR` | All |
| `VITE_NETWORK` | `devnet` | All |
| `VITE_RPC_URL` | `https://api.devnet.solana.com` | All |

#### Step 4: Deploy!
- Click "Deploy"
- Wait ~2-3 minutes
- Your app is live! 🎉

---

### Option 2: Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd /home/jay/.openclaw/workspace/litterbox-v2-frontend

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Configuration Details

### vercel.json
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel:
- Use Vite framework
- Build with `npm run build`
- Output to `dist` folder
- Handle SPA routing (all routes serve index.html)

---

## 🌐 After Deployment

### Your URLs
- **Production:** https://litterbox-v2-frontend.vercel.app
- **Preview:** https://litterbox-v2-frontend-git-branch.vercel.app

### Custom Domain (Optional)
1. Go to project settings
2. Click "Domains"
3. Add your domain (e.g., `litterbox.io`)
4. Follow DNS instructions

### Environment Variables Management
1. Go to project dashboard
2. Click "Settings" → "Environment Variables"
3. Edit/Add variables
4. Redeploy to apply changes

---

## 🧪 Testing Before Deploy

### Local Test
```bash
cd litterbox-v2-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Test production build
npm run build
npm run preview
```

### Check Build Output
```bash
npm run build

# Should see:
# ✓ dist/index.html
# ✓ dist/assets/index.css
# ✓ dist/assets/index.js
# ✓ built in X.XXs
```

---

## 🐛 Common Issues & Solutions

### Issue: Build Fails
**Solution:** Check Node version (should be 18+)
```bash
node -v  # Should be v18 or higher
npm -v   # Should be v9 or higher
```

### Issue: Wallet Adapter Not Working
**Solution:** Ensure all environment variables are set correctly
- Check Vercel dashboard → Settings → Environment Variables
- Verify variables are assigned to all environments (Production, Preview, Development)

### Issue: 404 on Refresh
**Solution:** This is handled by `vercel.json` rewrites
- Make sure `vercel.json` is committed to git
- Redeploy if needed

### Issue: Styles Not Loading
**Solution:** Check build output directory
- Vercel should deploy from `dist` folder
- Verify `outputDirectory` in `vercel.json`

---

## 📊 Post-Deployment Checklist

### Functionality Tests
- [ ] Connect wallet (Phantom/Solflare)
- [ ] View pool statistics
- [ ] Select tokens
- [ ] Test deposit form (UI only)
- [ ] Check responsive design on mobile
- [ ] Test "How It Works" section

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] Images optimize properly
- [ ] CSS loads correctly

### SEO (Optional)
- [ ] Add meta tags to `index.html`
- [ ] Add Open Graph tags
- [ ] Create `public/manifest.json`

---

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` → Auto-deploy to production
- Every branch → Auto-deploy to preview URL
- Pull requests → Preview deployments

### Deployment Flow
```
git push origin main
    ↓
GitHub webhook triggers Vercel
    ↓
Vercel pulls latest code
    ↓
Vercel builds (npm run build)
    ↓
Vercel deploys to edge
    ↓
New URL generated (or production updated)
```

---

## 🎨 Vercel Features to Explore

### Analytics (Optional)
- Vercel Analytics (free)
- Track page views, performance
- Enable in project settings

### Speed Insights (Optional)
- Core Web Vitals
- Performance monitoring
- Real user metrics

### Edge Functions (Future)
- API routes
- Serverless functions
- Edge middleware

---

## 📱 Mobile Testing

After deployment, test on:
- iOS Safari
- Android Chrome
- Mobile wallet apps (Phantom mobile)

Use browser dev tools:
```bash
# Chrome DevTools
Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows)
Toggle device toolbar: Cmd+Shift+M
```

---

## 🔐 Security Notes

### What's Safe
- ✅ Program IDs (public by nature)
- ✅ RPC URLs (public endpoints)
- ✅ Network names

### What to Keep Private
- 🔒 Never commit `.env.local` with real secrets
- 🔒 Don't expose private keys
- 🔒 Don't commit API keys that have limits

### Best Practices
- Use Vercel's environment variables
- Keep `.env.local` in `.gitignore`
- Use read-only RPC endpoints
- Never commit wallet private keys

---

## 📈 Next Steps After Deployment

1. **Test thoroughly** on devnet
2. **Share preview URL** for feedback
3. **Integrate backend logic** (deposit, balances)
4. **Add Jupiter API** for real quotes
5. **Set up custom domain** (optional)
6. **Enable analytics** (optional)
7. **Create production checklist** for mainnet

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live URL: `https://litterbox-v2-frontend.vercel.app`
- ✅ Auto-deploy on every git push
- ✅ Global CDN (edge deployment)
- ✅ Automatic HTTPS
- ✅ Preview deployments for branches
- ✅ Fast, optimized builds

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Solana Wallet Adapter:** https://github.com/solana-labs/wallet-adapter

---

**Ready to deploy? Let's do this! 🚀**

```bash
# Quick deploy command
cd /home/jay/.openclaw/workspace/litterbox-v2-frontend
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
# Then go to https://vercel.com/new
```
