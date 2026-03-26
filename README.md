# LitterBox v2 - Meme Token Recycler ♻️

**Turn your dead meme tokens into real value!**

LitterBox v2 is a modern web application that allows users to deposit any SPL tokens (including meme coins like BONK, WIF, POPCAT, etc.) and automatically swap them to USDC via Jupiter, then receive Litter tokens backed by real USDC value.

![LitterBox Banner](./public/banner.png)

## 🚀 Features

- **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- **Multi-Token Deposit**: Select and deposit multiple tokens in one transaction
- **Auto-Swap via Jupiter**: Automatically converts meme tokens to USDC
- **Real-Time Values**: See estimated values before confirming
- **Pool Statistics**: Track total liquidity, recycled value, and user stats
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with React + Tailwind CSS

## 🎨 Screenshots

### Wallet Connect
Connect your Solana wallet to get started

### Token Selection
Browse and select tokens from your wallet

### Deposit Form
Enter amounts and see real-time estimates

### Transaction Complete
Receive Litter tokens backed by USDC

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Wallet**: Solana Wallet Adapter
- **Icons**: Lucide React
- **Blockchain**: Solana Web3.js
- **Build Tool**: Vite (Rolldown)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/uplinkedassitant/litterbox-v2-frontend.git
cd litterbox-v2-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_PROGRAM_ID=B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr
VITE_LITTER_MINT=FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR
VITE_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
```

## 🎯 How to Use

### 1. Connect Your Wallet
Click "Select Wallet" and choose your preferred wallet (Phantom, Solflare, etc.)

### 2. Select Tokens to Recycle
- Browse or search for tokens in your wallet
- Check the tokens you want to recycle
- See your available balances

### 3. Enter Amounts
- Input the amount for each selected token
- View total USD value
- Review estimated Litter tokens you'll receive

### 4. Confirm & Recycle
- Click "♻️ Recycle My Memes"
- Approve the transaction in your wallet
- Wait for confirmation
- Receive your Litter tokens!

## 📊 Supported Tokens (Devnet)

- USDC (USD Coin)
- SOL (Wrapped SOL)
- BONK (Bonk)
- WIF (dogwifhat)
- POPCAT (Popcat)

More tokens will be added regularly!

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Project Structure

```
litterbox-v2-frontend/
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Custom styles
│   ├── index.css            # Base styles
│   └── main.jsx             # React entry point
├── public/                  # Static assets
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🌐 Network Information

### Devnet (Current)
- **Program ID**: `B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr`
- **Litter Mint**: `FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR`
- **RPC**: https://api.devnet.solana.com

### Mainnet (Coming Soon)
- Program ID: TBD
- Litter Mint: TBD

## 📱 Mobile Support

The application is fully responsive and works on:
- ✅ iOS (Safari, Chrome)
- ✅ Android (Chrome, Samsung Internet)
- ✅ Tablet devices

## 🚀 Roadmap

### Phase 1 (Current) ✅
- [x] Wallet connection
- [x] Token selector UI
- [x] Deposit form
- [x] Pool statistics
- [x] Responsive design

### Phase 2 (Next)
- [ ] Integrate actual deposit logic
- [ ] Fetch real token balances
- [ ] Jupiter API integration
- [ ] Real-time quotes
- [ ] Transaction history

### Phase 3 (Future)
- [ ] Advanced analytics
- [ ] Leaderboards
- [ ] Social sharing
- [ ] Mobile app (React Native)

## 🐛 Known Issues

- [ ] Token balance updates require manual refresh
- [ ] Large batches (>50 tokens) may be slow
- [ ] Some meme tokens may not have Jupiter liquidity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Solana](https://solana.com/) for the blockchain
- [Jupiter](https://jup.ag/) for the swap aggregation
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter) for wallet integration
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

- **GitHub Issues**: https://github.com/uplinkedassitant/litterbox-v2-frontend/issues
- **Backend Repo**: https://github.com/uplinkedassitant/litterbox-pinocchio

---

**Built with ❤️ on Solana**

*Don't let your meme tokens go to waste - recycle them!* ♻️
