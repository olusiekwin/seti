# 🔗 Backend Integration Guide

## ✅ Connected to Backend!

Your frontend is now connected to the Flask backend with **no more mock data**.

## 🔄 Architecture

```
React Frontend (Port 5173)
    ↓ HTTP Requests
Backend API (Port 5000)
    ↓ Reads/Writes
Database (SQLite/Supabase)
    ↑
Blockchain (Sui) → Syncs transaction data
```

## 📡 API Service

Location: `src/services/api.ts`

All backend API calls go through this centralized service:

```typescript
import { marketsApi, predictionsApi, usersApi, analyticsApi } from '@/services/api';

// Get all markets
const { markets } = await marketsApi.getAll();

// Get single market
const { market } = await marketsApi.getById(marketId);

// Create prediction after blockchain tx
await predictionsApi.create({
  transaction_hash: "0x...",
  market_id: "0x...",
  user_address: "0x...",
  outcome: 1, // YES
  amount: 1000000000,
  timestamp: Date.now() / 1000
});
```

## 🎣 Updated Hooks

### `useMarkets()`
**Before:** Returned hardcoded mock data
**Now:** Fetches from backend API

```typescript
const { markets, isLoading, error } = useMarkets({
  category: 'Crypto',
  status: 'active',
  sort_by: 'volume_24h'
});
```

### `useMarket(marketId)`
**Before:** Only queried blockchain
**Now:** Tries backend first (fast), falls back to blockchain

```typescript
const { data: market, isLoading } = useMarket(marketId);
```

## 🚀 How to Use

### 1. Start Backend (if not running)
```bash
cd backend
python3 run.py
```

### 2. Start Frontend
```bash
cd seti
npm run dev
```

### 3. Browse Markets
- Frontend will automatically fetch from `http://localhost:5000/api/v1`
- No mock data - all real data from database
- Empty at first? Use seed data!

## 🌱 Seed Data

To add sample markets for testing:

```bash
cd backend
python3 scripts/seed_data.py
```

This creates:
- 3 sample markets (BTC, TSLA, ETH)
- 2 sample users
- 2 sample predictions

## 📝 Syncing Blockchain Transactions

When a user makes a blockchain transaction, sync it to backend:

```typescript
import { syncTransactionToBackend } from '@/services/api';

// After successful blockchain transaction
const result = await executeTransaction();

// Sync to backend for fast queries
await syncTransactionToBackend({
  type: 'prediction',
  transaction_hash: result.digest,
  data: {
    market_id: marketId,
    user_address: currentAccount.address,
    outcome: selectedOutcome,
    amount: betAmount,
    price: currentPrice,
    shares: sharesReceived
  }
});
```

## 🔍 Testing the Connection

### Test 1: Backend Health
```bash
curl http://localhost:5000/health
```

Expected: `{"status": "healthy", "service": "seti-backend"}`

### Test 2: Get Markets
```bash
curl http://localhost:5000/api/v1/markets
```

Expected: JSON with markets array

### Test 3: Frontend Fetch
Open browser console on `http://localhost:5173`:
```javascript
fetch('http://localhost:5000/api/v1/markets')
  .then(r => r.json())
  .then(console.log)
```

## 🎯 What Changed

### Removed
- ❌ All mock data from `useMarkets.ts`
- ❌ Hardcoded sample markets array
- ❌ Simulated network delays

### Added
- ✅ `src/services/api.ts` - API service layer
- ✅ `.env.local` - Backend URL configuration
- ✅ Real API calls in all hooks
- ✅ Proper error handling
- ✅ Loading states

## 🌐 Environment Variables

File: `.env.local`

```env
# Backend API
VITE_API_URL=http://localhost:5000/api/v1

# Sui Configuration
VITE_SUI_PACKAGE_ID=0x9fb4dbbd21acb0e9c3f61a6f7bf91a098ebd772f87e764fcdfe582069936fdcb
VITE_NETWORK=devnet
VITE_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
```

## 🔒 CORS

Backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative port)

## 🚨 Troubleshooting

### "Network Error" or "Failed to fetch"
1. Check backend is running: `curl http://localhost:5000/health`
2. Check CORS configuration in `backend/.env`
3. Check browser console for CORS errors

### "Markets array is empty"
1. Seed the database: `python3 backend/scripts/seed_data.py`
2. Check backend logs for errors
3. Verify database file exists: `ls backend/seti.db`

### "Cannot read property 'markets'"
1. Check API response format in Network tab
2. Verify `marketsApi.getAll()` returns correct structure
3. Check for TypeScript errors in console

## 📊 Available Endpoints

All endpoints documented in `backend/README.md`:

### Markets
- `GET /api/v1/markets` - List all markets
- `GET /api/v1/markets/:id` - Get single market
- `GET /api/v1/markets/featured` - Featured markets
- `GET /api/v1/markets/categories` - Categories with counts

### Predictions
- `GET /api/v1/predictions` - List predictions
- `POST /api/v1/predictions` - Create prediction
- `GET /api/v1/predictions/recent` - Recent activity

### Users
- `GET /api/v1/users/:address` - User profile
- `PUT /api/v1/users/:address` - Update profile
- `GET /api/v1/users/:address/predictions` - User's predictions
- `GET /api/v1/users/:address/stats` - User statistics
- `GET /api/v1/users/leaderboard` - Top traders

### Analytics
- `GET /api/v1/analytics/overview` - Platform stats
- `GET /api/v1/analytics/markets/top` - Top markets
- `GET /api/v1/analytics/categories/stats` - Category breakdown

## 🎉 Benefits

**Speed:**
- ⚡ Instant market loading (no blockchain queries)
- ⚡ Fast search and filtering
- ⚡ Real-time updates

**Features:**
- 🔍 Full-text search
- 📊 Rich analytics
- 👤 User profiles
- 💬 Comments (coming soon)
- ⭐ Favorites (coming soon)

**Developer Experience:**
- 🛠️ Standard REST API
- 📝 Type-safe with TypeScript
- 🔄 Easy to extend
- 🧪 Easy to test

---

**Your frontend is now a true Web2.5 app!** 🚀
Fast as traditional web apps, secured by blockchain.

