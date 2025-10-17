# FHE Polymarket - Encrypted Prediction Market

A fully decentralized prediction market platform powered by Fully Homomorphic Encryption (FHE), enabling users to create markets, place bets, and manage balances with complete privacy. All sensitive data including user balances, bet amounts, and prediction choices are encrypted on-chain using Zama's FHEVM technology.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Advantages](#advantages)
- [Architecture](#architecture)
- [Smart Contract Features](#smart-contract-features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Testing](#testing)
- [Frontend Features](#frontend-features)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

FHE Polymarket is a privacy-preserving prediction market platform built on Ethereum using Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM). Unlike traditional prediction markets where all transactions are public, FHE Polymarket encrypts sensitive user data on-chain, allowing computations on encrypted data without revealing the underlying information.

The platform enables users to:
- Create prediction markets with customizable options (1-4 outcomes)
- Register and receive encrypted point balances
- Place confidential bets on predictions with fully encrypted choices
- Decrypt their own encrypted balances while keeping them private from others

## Key Features

### Privacy-First Design
- **Encrypted Balances**: User point balances are stored as encrypted values (euint32) on-chain
- **Confidential Betting**: Bet amounts and prediction choices are encrypted before being sent to the blockchain
- **Selective Decryption**: Only the balance owner can decrypt their own encrypted balance using FHE client-side decryption
- **Zero Knowledge**: Other users and validators cannot see your balance, bet amounts, or prediction choices

### User-Friendly Operations
- **Simple Registration**: One-click registration that grants 100 encrypted starting points
- **Flexible Market Creation**: Anyone can create prediction markets with 1-4 custom options
- **Fair Betting System**: Each user gets up to 10 bets (10 points per bet)
- **Real-time Updates**: Instant state synchronization after transactions
- **Wallet Integration**: Seamless connection via RainbowKit with MetaMask, WalletConnect, and more

### On-Chain Transparency with Privacy
- **Public Market Data**: Prediction titles, options, and total bet counts are publicly visible
- **Private User Data**: Individual balances, choices, and bet amounts remain encrypted
- **Verifiable Fairness**: Smart contract logic is open-source and auditable
- **Immutable Records**: All encrypted data is permanently stored on-chain

## Technology Stack

### Smart Contract Layer
- **Solidity**: `^0.8.24` - Smart contract programming language
- **FHEVM**: Zama's Fully Homomorphic Encryption library for Solidity
- **Hardhat**: `^2.26.0` - Ethereum development environment
- **Hardhat Deploy**: `^0.11.45` - Deterministic deployment system
- **TypeChain**: `^8.3.2` - TypeScript bindings for smart contracts
- **OpenZeppelin Contracts**: Industry-standard security libraries

### Frontend Layer
- **React**: `^19.1.1` - Modern UI framework
- **TypeScript**: `~5.8.3` - Type-safe JavaScript
- **Vite**: `^7.1.6` - Fast frontend build tool
- **Viem**: `^2.37.6` - Lightweight Ethereum library for reading contract state
- **Ethers.js**: `^6.15.0` - Ethereum interaction library for writing transactions
- **Wagmi**: `^2.17.0` - React hooks for Ethereum
- **RainbowKit**: `^2.2.8` - Beautiful wallet connection UI
- **TanStack Query**: `^5.89.0` - Async state management

### Encryption Layer
- **Zama FHE Relayer SDK**: `^0.2.0` - Client-side FHE operations and decryption
- **encrypted-types**: `^0.0.4` - Type definitions for encrypted values
- **Zama Oracle Solidity**: `^0.1.0` - Decryption oracle integration

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting with Solidity plugin
- **Solhint**: Solidity linting
- **Mocha & Chai**: Testing frameworks
- **Hardhat Gas Reporter**: Gas optimization analysis
- **Solidity Coverage**: Test coverage reporting

## Problem Statement

Traditional prediction markets face several critical challenges:

### Privacy Concerns
1. **Public Betting History**: All bets and amounts are visible on-chain, allowing front-running and strategic exploitation
2. **Wallet Tracking**: Anyone can track user balances and betting patterns
3. **Market Manipulation**: Large bets can be front-run or copied by bots
4. **Privacy Leakage**: User preferences and strategies are exposed

### Trust Issues
5. **Centralized Control**: Most platforms require trusted intermediaries to manage funds
6. **Data Custody**: User data is stored off-chain with custodians
7. **Censorship Risk**: Centralized operators can block users or markets

### Technical Limitations
8. **Scalability vs Privacy**: Existing privacy solutions (ZK-SNARKs) are complex and gas-intensive
9. **Limited Functionality**: Privacy often requires off-chain computation
10. **User Experience**: Complex cryptographic operations create friction

## Solution

FHE Polymarket solves these problems through Fully Homomorphic Encryption:

### Privacy Through Encryption
- **On-Chain Encryption**: All sensitive data is encrypted directly on the blockchain using FHEVM
- **Computation on Encrypted Data**: Smart contracts can perform operations (addition, subtraction) on encrypted values without decryption
- **Selective Decryption**: Users can decrypt their own data client-side without revealing it to others

### Decentralization
- **No Intermediaries**: Smart contracts handle all logic and fund management
- **Trustless Operations**: All rules are enforced by code, not operators
- **Censorship Resistant**: Anyone can create markets and place bets

### Developer-Friendly Implementation
- **Simple Integration**: FHEVM provides Solidity-native encryption types (euint32)
- **Familiar Tools**: Built with standard Ethereum development stack
- **Type Safety**: TypeScript and TypeChain for compile-time safety

## Advantages

### For Users
1. **Complete Privacy**: Your balances, bets, and choices remain confidential
2. **Fair Markets**: No front-running or bet copying since choices are encrypted
3. **Self-Custody**: Only you can decrypt your encrypted balance
4. **Easy Onboarding**: Simple wallet connection and one-click registration
5. **Free Starting Points**: 100 points granted upon registration

### For Market Creators
6. **Permissionless Creation**: Anyone can create prediction markets
7. **Flexible Options**: Support for 1-4 outcome markets
8. **Public Participation Data**: See total bet counts without compromising individual privacy
9. **Immutable Rules**: Smart contract guarantees fairness

### For Developers
10. **Clean Architecture**: Well-organized monorepo structure
11. **Type Safety**: Full TypeScript coverage across frontend and contracts
12. **Modern Stack**: Latest versions of React, Vite, and Hardhat
13. **Reusable Components**: Modular design for easy customization
14. **Comprehensive Tests**: Contract and integration tests included

### Technical Advantages
15. **On-Chain Privacy**: No trusted setup or off-chain computation required
16. **Gas Efficient**: Optimized FHE operations minimize transaction costs
17. **Composable**: Can integrate with other DeFi protocols
18. **Future-Proof**: Built on cutting-edge FHE research from Zama

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │ RainbowKit │  │   Wagmi    │  │  Zama Relayer SDK   │   │
│  │  (Wallet)  │  │  (Hooks)   │  │   (FHE Decryption)  │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
│         │               │                    │               │
│         └───────────────┼────────────────────┘               │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ viem (read) / ethers (write)
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                    Sepolia Testnet                           │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │      EncryptedPredictionMarket Smart Contract          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │  User State  │  │  Predictions │  │  Betting    │  │ │
│  │  │  (encrypted) │  │   (public)   │  │ (encrypted) │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │              Zama FHEVM Library                        │ │
│  │    (FHE operations: encrypt, decrypt, add, sub)        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Registration Flow
1. User clicks "Register" button
2. Frontend sends transaction via ethers.js
3. Smart contract creates encrypted balance (100 points)
4. Contract grants permission for user to decrypt their own balance
5. Frontend decrypts balance using Zama Relayer SDK
6. Decrypted balance displayed to user

#### Bet Placement Flow
1. User selects prediction option (e.g., option 2)
2. Frontend encrypts choice using `instance.createEncryptedInput()`
3. Encrypted data + proof sent to smart contract
4. Contract verifies proof and stores encrypted choice
5. Contract subtracts 10 from encrypted balance (FHE subtraction)
6. User balance updated without revealing amount
7. Frontend re-decrypts balance to show new value

#### Balance Decryption Flow
1. Frontend requests encrypted balance handle from contract
2. User generates keypair via `instance.generateKeypair()`
3. User signs EIP-712 message authorizing decryption
4. Frontend calls Zama Relayer with signature
5. Relayer decrypts value and returns plaintext
6. Balance displayed in UI (only visible to user)

## Smart Contract Features

### Contract: EncryptedPredictionMarket

Location: `contracts/EncryptedPredictionMarket.sol`

#### Constants
- `STARTING_POINTS`: 100 - Initial encrypted balance for new users
- `BET_COST`: 10 - Points deducted per bet
- `MAX_BETS`: 10 - Maximum number of bets per user

#### Core Functions

**Registration**
```solidity
function register() external
```
- Registers user and grants 100 encrypted starting points
- Sets remaining bets to 10
- Can only be called once per address
- Emits: `Registered(address indexed user)`

**Market Creation**
```solidity
function createPrediction(string calldata title, string[] calldata options)
    external onlyRegistered returns (uint256)
```
- Creates new prediction market with 1-4 options
- Returns prediction ID
- Only registered users can create
- Emits: `PredictionCreated(uint256 indexed predictionId, address indexed creator, string title)`

**Bet Placement**
```solidity
function placeBet(uint256 predictionId, externalEuint32 encryptedChoice, bytes calldata inputProof)
    external onlyRegistered validPrediction(predictionId)
```
- Accepts encrypted prediction choice
- Deducts 10 encrypted points from user balance
- Verifies encryption proof
- Prevents duplicate bets
- Emits: `BetPlaced(uint256 indexed predictionId, address indexed user)`

#### View Functions

**User State**
- `isRegistered(address user)`: Check registration status
- `getEncryptedBalance(address user)`: Get encrypted balance handle
- `getRemainingBets(address user)`: Get remaining bet count

**Prediction Data**
- `getPredictionCount()`: Total number of predictions
- `getPrediction(uint256 predictionId)`: Get prediction details
- `hasUserBet(uint256 predictionId, address user)`: Check if user has bet

**Encrypted Data**
- `getUserEncryptedChoice(uint256 predictionId, address user)`: Get encrypted choice
- `getUserEncryptedBetAmount(uint256 predictionId, address user)`: Get encrypted bet amount

#### Storage Structure

**Predictions Array**
```solidity
struct Prediction {
    string title;
    string[] options;
    address creator;
    uint256 createdAt;
    uint256 totalBets;
}
```

**Encrypted Mappings**
- `_balances`: address => euint32 (encrypted balance)
- `_userChoices`: predictionId => address => euint32 (encrypted choice)
- `_userBetAmounts`: predictionId => address => euint32 (encrypted bet amount)

**Public Mappings**
- `_registered`: address => bool
- `_remainingBets`: address => uint8
- `_userHasBet`: predictionId => address => bool

## Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For cloning the repository

### Clone Repository

```bash
git clone https://github.com/your-username/fhe-polymarket.git
cd fhe-polymarket
```

### Install Dependencies

#### Backend (Smart Contracts)
```bash
npm install
```

#### Frontend
```bash
cd ui
npm install
cd ..
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Deployment account private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Infura API key for Sepolia network
INFURA_API_KEY=your_infura_api_key

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Security Warning**: Never commit the `.env` file to version control. It's already in `.gitignore`.

## Usage

### Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeChain types
- Create ABI files in `artifacts/`

### Run Tests

```bash
# Run all tests on local network
npm test

# Run with coverage report
npm run coverage

# Run with gas reporting
REPORT_GAS=true npm test
```

### Deploy Contracts

#### Local Network Deployment

1. Start local Hardhat node (FHEVM-enabled):
```bash
npx hardhat node
```

2. In another terminal, deploy:
```bash
npm run deploy:localhost
```

#### Sepolia Testnet Deployment

1. Ensure `.env` has `PRIVATE_KEY` and `INFURA_API_KEY`
2. Fund your deployment address with Sepolia ETH (use faucets)
3. Deploy:
```bash
npm run deploy:sepolia
```

4. Verify on Etherscan:
```bash
npm run verify:sepolia
```

The deployment address will be saved in `deployments/sepolia/EncryptedPredictionMarket.json`

### Start Frontend

1. Navigate to UI directory:
```bash
cd ui
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

### Build Frontend for Production

```bash
cd ui
npm run build
```

Built files will be in `ui/dist/`

## Project Structure

```
fhe-polymarket/
├── contracts/                          # Smart contract source files
│   └── EncryptedPredictionMarket.sol  # Main prediction market contract
├── deploy/                            # Hardhat deployment scripts
│   └── deploy.ts                      # Deployment configuration
├── deployments/                       # Deployed contract artifacts
│   └── sepolia/                       # Sepolia testnet deployments
│       └── EncryptedPredictionMarket.json  # Contract address + ABI
├── tasks/                             # Custom Hardhat tasks
├── test/                              # Smart contract tests
├── ui/                                # React frontend application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── components/                # React components
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   └── PredictionApp.tsx     # Main application component
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useEthersSigner.ts    # Ethers.js wallet signer
│   │   │   └── useZamaInstance.ts    # Zama FHE instance hook
│   │   ├── config/                    # Configuration files
│   │   │   └── contracts.ts          # Contract address + ABI
│   │   ├── styles/                    # CSS stylesheets
│   │   ├── App.tsx                    # Root application component
│   │   └── main.tsx                   # Application entry point
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.ts                 # Vite configuration
├── hardhat.config.ts                  # Hardhat configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Project dependencies
├── .env                               # Environment variables (not committed)
├── .gitignore                         # Git ignore rules
├── AGENTS.md                          # Development guidelines
└── README.md                          # This file
```

## Deployment

### Contract Deployment Process

The deployment script (`deploy/deploy.ts`) performs the following:

1. **Network Detection**: Identifies target network (localhost/sepolia)
2. **Contract Deployment**: Deploys `EncryptedPredictionMarket` with create2 for deterministic addresses
3. **Artifact Saving**: Stores address and ABI in `deployments/{network}/`
4. **Verification**: Automatically verifies on Etherscan (if API key provided)

### Deployed Contracts

**Sepolia Testnet**
- Contract Address: `0x35e815FFD96b7580cf2853062D80DE6Ad84b2a8e`
- Explorer: https://sepolia.etherscan.io/address/0x35e815FFD96b7580cf2853062D80DE6Ad84b2a8e
- Network: Sepolia (Chain ID: 11155111)

### Frontend Deployment

The frontend is configured for Netlify deployment:

1. Build the frontend:
```bash
cd ui && npm run build
```

2. Deploy the `ui/dist` folder to:
   - **Netlify**: Drag and drop or connect GitHub repo
   - **Vercel**: Import project and set build directory to `ui/dist`
   - **IPFS**: Upload via Pinata or Fleek
   - **Custom Server**: Serve the static files with nginx/Apache

## Testing

### Smart Contract Tests

Location: `test/`

**Test Coverage Includes:**
- User registration and duplicate prevention
- Encrypted balance initialization
- Prediction market creation with validation
- Encrypted bet placement
- Balance deduction after bets
- Access control (registered vs unregistered)
- Edge cases (invalid predictions, duplicate bets)

**Running Tests:**
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/EncryptedPredictionMarket.test.ts

# Run with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage
```

### Frontend Testing

**Manual Testing Checklist:**
1. Connect wallet (MetaMask/WalletConnect)
2. Register new account
3. Verify 100 encrypted points received
4. Create prediction market with 2-4 options
5. Place encrypted bet on prediction
6. Verify balance decreases by 10
7. Verify cannot bet twice on same prediction
8. Refresh state to confirm persistence

## Frontend Features

### Components

#### Header Component
- **Wallet Connection**: RainbowKit integration with 10+ wallet options
- **Network Display**: Shows current network (Sepolia/Localhost)
- **Account Info**: Displays connected address

#### PredictionApp Component
- **Account Section**: Registration status, remaining bets, decrypted balance
- **Create Prediction Section**: Form for new market creation
- **Active Predictions Section**: List of all markets with betting interface

### Custom Hooks

#### useZamaInstance
- Initializes Zama FHE instance for encryption/decryption
- Manages loading and error states
- Provides FHE instance to all components

#### useEthersSigner
- Converts Wagmi wallet client to ethers.js signer
- Enables contract write operations with ethers
- Maintains compatibility with Zama SDK

### State Management

The application uses React hooks for state:
- **TanStack Query**: Async data fetching and caching
- **Local State**: Component-level state with useState
- **Memoization**: useMemo and useCallback for performance

### Styling

- **Pure CSS**: No Tailwind or CSS frameworks
- **Modular Stylesheets**: Component-specific CSS files
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, accessible interface

## Security Considerations

### Smart Contract Security

1. **Access Control**: `onlyRegistered` modifier prevents unauthorized actions
2. **Duplicate Prevention**: Users cannot register or bet twice
3. **Input Validation**: All user inputs validated (title length, option count)
4. **Proof Verification**: FHE proofs verified before accepting encrypted inputs
5. **Integer Overflow**: Solidity 0.8.24 has built-in overflow protection
6. **Reentrancy**: No external calls that could enable reentrancy attacks

### Privacy Guarantees

1. **On-Chain Encryption**: Balances and bets encrypted with FHE
2. **Permission System**: Only authorized addresses can decrypt data
3. **No Plaintext Leakage**: Sensitive data never exposed in events or storage
4. **Client-Side Decryption**: Balance decryption happens locally

### Frontend Security

1. **No Environment Variables**: All config hardcoded in frontend
2. **No Private Keys**: Users control their own wallets
3. **Read-Only Public Client**: Uses viem for safe read operations
4. **Transaction Signing**: All writes require user approval

### Known Limitations

1. **Testnet Only**: Currently deployed on Sepolia, not mainnet
2. **No Market Resolution**: Markets cannot be resolved yet (future feature)
3. **Fixed Bet Amount**: All bets cost 10 points (no variable amounts)
4. **No Withdrawals**: Points cannot be converted back to ETH

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)
- [ ] **Market Resolution System**: Enable creators to resolve markets and distribute rewards
- [ ] **Automated Market Maker (AMM)**: Dynamic odds based on bet distribution
- [ ] **Variable Bet Amounts**: Allow users to bet custom point amounts
- [ ] **Time-Based Markets**: Set expiration dates for predictions
- [ ] **Market Categories**: Tag predictions by topic (sports, crypto, politics)

### Phase 2: Advanced Features (Q3 2025)
- [ ] **Encrypted Leaderboard**: Privacy-preserving rankings with ZK proofs
- [ ] **Liquidity Provision**: Allow users to provide liquidity to markets
- [ ] **Market Templates**: Pre-built market types (yes/no, multi-choice, range)
- [ ] **Social Features**: Follow creators, comment on markets
- [ ] **Reputation System**: Track creator accuracy over time

### Phase 3: Scalability (Q4 2025)
- [ ] **Layer 2 Integration**: Deploy on Optimism/Arbitrum for lower fees
- [ ] **Cross-Chain Support**: Enable markets across multiple chains
- [ ] **Mobile App**: React Native application
- [ ] **API Endpoints**: GraphQL API for third-party integrations
- [ ] **Webhook Support**: Real-time notifications for market events

### Phase 4: Decentralization (Q1 2026)
- [ ] **Governance Token**: Launch token for protocol governance
- [ ] **DAO Structure**: Community-controlled development and treasury
- [ ] **Decentralized Oracle**: On-chain oracle for market resolution
- [ ] **Dispute Resolution**: Decentralized appeals process
- [ ] **Mainnet Launch**: Production deployment on Ethereum mainnet

### Research & Innovation
- [ ] **Advanced FHE Operations**: More complex computations on encrypted data
- [ ] **Hybrid Privacy**: Combine FHE with ZK-SNARKs for enhanced privacy
- [ ] **AI Market Analysis**: Encrypted ML models for market insights
- [ ] **Privacy-Preserving Analytics**: Aggregate statistics without revealing individual data

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Bug Reports**: Open an issue with detailed reproduction steps
2. **Feature Requests**: Suggest new features via GitHub issues
3. **Code Contributions**: Submit pull requests with new features or fixes
4. **Documentation**: Improve README, add tutorials, write guides
5. **Testing**: Report bugs, test new features, improve test coverage

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with clear commit messages
4. Write tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint`
7. Submit pull request with detailed description

### Code Standards

- **Solidity**: Follow OpenZeppelin style guide
- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **Comments**: Document complex logic
- **Tests**: Maintain 80%+ coverage

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(contract): add market resolution mechanism

Implement resolveMarket() function that allows creators
to set winning option and distribute encrypted rewards.

Closes #42
```

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for full license text.

### Key Points
- **Open Source**: Code is freely available for review and use
- **No Patent Grant**: Clear BSD license without patent grants
- **Attribution Required**: Must retain copyright notices
- **No Warranty**: Provided "as is" without guarantees

## Support

### Get Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/fhe-polymarket/issues)
- **Documentation**: Read this README and inline code comments
- **FHEVM Docs**: [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- **Community**: Join developer discussions

### Useful Resources

**Zama FHEVM**
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [Zama Discord Community](https://discord.gg/zama)

**Ethereum Development**
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Viem Documentation](https://viem.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)

**Deployment Networks**
- [Sepolia Faucet 1](https://sepoliafaucet.com/)
- [Sepolia Faucet 2](https://www.infura.io/faucet/sepolia)
- [Sepolia Explorer](https://sepolia.etherscan.io/)

### Contact

For questions or collaboration opportunities:
- **GitHub**: [@your-username](https://github.com/your-username)
- **Email**: your-email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

**Built with privacy and decentralization in mind using Zama FHEVM**

*Last Updated: October 2025*
