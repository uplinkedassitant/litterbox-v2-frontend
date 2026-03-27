# Deployment Configuration

## Environment Variables (vercel.json)

The following environment variables are configured in `vercel.json` and will be automatically set by Vercel:

```json
{
  "VITE_PROGRAM_ID": "5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w",
  "VITE_CONFIG_PDA": "7bibs5dbBwaUuWCc3yjSH6nu649WmQ7ifVicU4MZ6Ueu",
  "VITE_POOL_PDA": "7DgLSphFDzXA29ausgLpeydKzuW3b42HXrLppZb527MQ",
  "VITE_LITTER_MINT": "9EJwVq9dfZHLH1AtRcH9eaJzewq4vmxUJPboja45DoZj",
  "VITE_NETWORK": "devnet",
  "VITE_RPC_URL": "https://api.devnet.solana.com"
}
```

## Local Development

For local development, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The `.env.local` file is gitignored and won't be committed.

## Vercel Deployment

Vercel automatically uses the environment variables from `vercel.json`. No manual configuration needed!

If you need to update environment variables:
1. Edit `vercel.json` in the `env` section
2. Commit and push to trigger a new deployment

## Verify Deployment

After deployment, check the browser console for:
- ✅ `VITE_PROGRAM_ID: 5w927F3TrrRCuAQ86whve3Qe864oT1gvGFrnd7rSKY3w`
- ✅ No "WalletSendTransactionError" errors
- ✅ Deposit transactions succeed

## Troubleshooting

If you see the old Program ID (`B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr`):

1. **Local dev**: Delete `.env.local` and recreate from `.env.example`
2. **Vercel**: Check that `vercel.json` has correct values and trigger a new deploy
3. **Browser**: Hard refresh (Ctrl+Shift+R) to clear cached JavaScript
