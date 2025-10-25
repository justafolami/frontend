# BodyBase - Walk to Earn DApp

A blockchain-powered fitness application that rewards users with cryptocurrency tokens for walking and maintaining an active lifestyle. Built with React, Node.js, Express, and Ethereum smart contracts.

## 🌟 Features

- **Google Fit Integration**: Sync your daily steps automatically from Google Fit
- **Blockchain Rewards**: Earn BodyToken (cryptocurrency) for every step you take
- **Secure Authentication**: JWT-based authentication system
- **Real-time Step Tracking**: Monitor your daily and total step counts
- **Reward Management**: Claim your earned tokens directly to ythe wallety you signed in with
- **Transparent Transactions**: All rewards recorded on-chain with transaction hashes

## 🏗️ Architecture

### Frontend (React + Vite)
- Modern React 19 with hooks
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Google Fit API integration

### Backend (Node.js + Express)
- RESTful API architecture
- MongoDB database with Mongoose ODM
- JWT authentication
- Rate limiting and security middleware
- Blockchain integration with ethers.js

### Smart Contracts (Ethereum)
- ERC20 Token (BodyToken)
- Reward Distributor Contract
- Step recording and reward claiming

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MongoDB
- MetaMask or similar Web3 wallet
- Google Cloud Project with Fitness API enabled
- Ethereum testnet access (e.g., Sepolia)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bodybase
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/bodybase
JWT_SECRET=your_jwt_secret_key
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key
TOKEN_ADDRESS=deployed_token_contract_address
REWARD_ADDRESS=deployed_distributor_contract_address
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd basebody

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Configure your `.env` file:

```env
VITE_REACT_APP_API_URL=http://localhost:4000/api/v1
VITE_REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Google Fit API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Fitness API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins and redirect URIs
6. Copy the Client ID to your frontend `.env` file

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm start
# or for development with nodemon
npm run dev
```

Server will run on `http://localhost:4000`

### Start Frontend Development Server

```bash
cd basebody
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Steps Management
- `POST /api/v1/steps` - Record steps (requires auth)
- `GET /api/v1/steps` - Get user steps history (requires auth)

### Rewards
- `POST /api/v1/rewards/claim` - Claim pending rewards (requires auth)
- `GET /api/v1/rewards` - Get reward history (requires auth)

### Health Check
- `GET /api/v1/health` - Server health status

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting (100 requests per 15 minutes)
- HPP protection against parameter pollution
- CORS configuration
- Helmet.js for HTTP headers security

## 🎨 Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React (icons)
- Google Fit API

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- ethers.js
- express-rate-limit
- Helmet
- HPP
- CORS

### Blockchain
- Ethereum
- Solidity (Smart Contracts)
- ethers.js (v6)

## 📝 Environment Variables

### Backend Variables
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 4000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `RPC_URL` | Ethereum RPC endpoint |
| `PRIVATE_KEY` | Wallet private key for transactions |
| `TOKEN_ADDRESS` | BodyToken contract address |
| `REWARD_ADDRESS` | Reward Distributor contract address |

### Frontend Variables
| Variable | Description |
|----------|-------------|
| `VITE_REACT_APP_API_URL` | Backend API URL |
| `VITE_REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

## 🔄 Workflow

1. **User Registration**: Create account with email, password, and wallet address
2. **Google Fit Connection**: Connect Google Fit account to sync steps
3. **Step Tracking**: Steps are automatically synced from Google Fit
4. **Backend Processing**: Steps recorded in database and periodically synced to blockchain
5. **Reward Calculation**: Smart contract calculates rewards based on steps
6. **Claim Rewards**: Users can claim their earned tokens to their wallet

## 🛠️ Development

### Build Frontend for Production

```bash
cd basebody
npm run build
```

### Lint Frontend Code

```bash
npm run lint
```

## 📦 Project Structure

```
bodybase/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js          # Express app setup
│   ├── server.js           # Entry point
│   └── package.json
│
└── basebody/
    ├── public/             # Static assets
    ├── src/
    │   ├── assets/         # Images, icons
    │   ├── context/        # React context
    │   ├── pages/          # React components/pages
    │   ├── services/       # API services
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── index.html
    └── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by the BodyBase Team