# Polymarket Contract Deployment Guide

This guide explains how to deploy the Polymarket prediction market contract to the Sui blockchain.

## Prerequisites

1. **Sui CLI**: Install the Sui CLI from [sui.io](https://sui.io)
2. **Sui Wallet**: Install a Sui wallet (Sui Wallet, Suiet, etc.)
3. **Test SUI**: Get test SUI from the Sui faucet for testing

## Contract Structure

The contract is located in `contract/polymarket.move` and includes:

- **Market Creation**: Create new prediction markets
- **Prediction Placement**: Place YES/NO predictions on markets
- **Liquidity Management**: Add liquidity to markets
- **Market Resolution**: Resolve markets after they end
- **Price Calculation**: Dynamic pricing based on liquidity

## Deployment Steps

### 1. Set up Sui Environment

```bash
# Initialize Sui environment
sui client new-env --alias devnet --rpc https://fullnode.devnet.sui.io:443

# Switch to devnet
sui client switch --env devnet

# Create a new address (if needed)
sui client new-address ed25519
```

### 2. Fund Your Address

```bash
# Get test SUI from faucet
curl --location --request POST 'https://faucet.devnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "YOUR_ADDRESS_HERE"
    }
}'
```

### 3. Deploy the Contract

```bash
# Navigate to contract directory
cd contract

# Publish the contract
sui client publish --gas-budget 100000000

# Note the package ID from the output
```

### 4. Update Environment Variables

After deployment, update your frontend environment variables:

```bash
# Create .env file in project root
echo "VITE_SUI_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE" > .env
```

### 5. Test the Contract

```bash
# Test market creation
sui client call --package 0xYOUR_PACKAGE_ID \
  --module polymarket \
  --function create_market \
  --args "Will Bitcoin hit $100K?" "Bitcoin price prediction" 1735689600 "Crypto" "https://example.com/image.jpg" [] 1000000000 \
  --gas-budget 100000000
```

## Contract Functions

### Market Creation
```move
public entry fun create_market(
    question: vector<u8>,
    description: vector<u8>,
    end_time: u64,
    category: vector<u8>,
    image_url: vector<u8>,
    tags: vector<vector<u8>>,
    initial_liquidity: Coin<SUI>,
    ctx: &mut TxContext
)
```

### Place Prediction
```move
public entry fun place_prediction(
    market: &mut Market,
    outcome: u8, // 0 = NO, 1 = YES
    payment: Coin<SUI>,
    ctx: &mut TxContext
)
```

### Add Liquidity
```move
public entry fun add_liquidity(
    market: &mut Market,
    liquidity: Coin<SUI>,
    ctx: &mut TxContext
)
```

### Resolve Market
```move
public entry fun resolve_market(
    market: &mut Market,
    winning_outcome: u8, // 0 = NO, 1 = YES, 2 = INVALID
    clock: &Clock,
    ctx: &mut TxContext
)
```

## Frontend Integration

The frontend is already configured to work with the deployed contract. Key hooks:

- `useCreateMarket`: Create new markets
- `usePrediction`: Place predictions
- `useLiquidity`: Add liquidity
- `useMarketResolution`: Resolve markets
- `useMarket`: Fetch market data
- `useMarketPrices`: Get current prices

## Testing

1. **Create a Market**: Use the "Create Market" button in the UI
2. **Place Predictions**: Click on market cards to place YES/NO predictions
3. **Add Liquidity**: Use the liquidity management features
4. **Resolve Markets**: After markets end, resolve them as the creator

## Production Deployment

For mainnet deployment:

1. Switch to mainnet: `sui client switch --env mainnet`
2. Fund your address with real SUI
3. Deploy: `sui client publish --gas-budget 100000000`
4. Update environment variables with mainnet package ID

## Security Considerations

- Only market creators can resolve markets
- Markets cannot be resolved before their end time
- All transactions require proper gas fees
- Test thoroughly on devnet before mainnet deployment

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Increase gas budget in transactions
2. **Invalid Arguments**: Ensure all parameters match expected types
3. **Market Not Found**: Verify market ID is correct
4. **Permission Denied**: Ensure you're the market creator for resolution

### Error Codes

- `EMarketEnded`: Market has already ended
- `EMarketResolved`: Market has already been resolved
- `EInsufficientLiquidity`: Not enough liquidity for the trade
- `EInvalidOutcome`: Invalid outcome value (must be 0 or 1)
- `ENotCreator`: Only market creator can perform this action
- `EMarketNotEnded`: Cannot resolve market before end time
- `EInvalidWinningOutcome`: Invalid winning outcome (must be 0, 1, or 2)

## Support

For issues or questions:
1. Check the Sui documentation
2. Review contract code comments
3. Test on devnet first
4. Check transaction logs for detailed error messages