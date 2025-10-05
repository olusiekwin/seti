module polymarket::polymarket {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use std::string::{Self, String};
    use sui::vec_map::{Self, VecMap};
    use sui::bag::{Self, Bag};
    use sui::clock::{Self, Clock};
    use sui::sui::SUI;

    // Market object with all necessary data for frontend
    public struct Market has key {
        id: UID,
        question: String,
        description: String,
        end_time: u64,
        creator: address,
        resolved: bool,
        winning_outcome: u8, // 0 = false, 1 = true, 2 = invalid/canceled
        total_liquidity: u64,
        outcome_a_shares: Balance<SUI>,
        outcome_b_shares: Balance<SUI>,
        liquidity_providers: Bag, // Track LP positions
        volume_24h: u64, // Track volume for sorting
        created_timestamp: u64,
        // Add fields the frontend needs for display
        category: String,
        image_url: String,
        tags: vector<String>
    }

    // Event for market creation - frontend can listen to these
    public struct MarketCreated has copy, drop {
        market_id: ID,
        creator: address,
        question: String,
        end_time: u64
    }

    // Event for trades - frontend can update UI in real-time
    public struct TradeExecuted has copy, drop {
        market_id: ID,
        trader: address,
        outcome: u8, // 0 or 1
        amount: u64,
        price: u64
    }

    // Event for liquidity provision
    public struct LiquidityProvided has copy, drop {
        market_id: ID,
        provider: address,
        amount: u64
    }

    // Event for market resolution
    public struct MarketResolved has copy, drop {
        market_id: ID,
        winning_outcome: u8,
        resolver: address
    }

    // Error codes
    const EMarketEnded: u64 = 0;
    const EMarketResolved: u64 = 1;
    const EInsufficientLiquidity: u64 = 2;
    const EInvalidOutcome: u64 = 3;
    const ENotCreator: u64 = 4;
    const EMarketNotEnded: u64 = 5;
    const EInvalidWinningOutcome: u64 = 6;

    public entry fun create_market(
        question: vector<u8>,
        description: vector<u8>,
        end_time: u64,
        category: vector<u8>,
        image_url: vector<u8>,
        tags: vector<vector<u8>>,
        initial_liquidity: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let uid = object::new(ctx);
        let market_id_for_event = object::uid_to_inner(&uid);
        let mut liquidity_balance = coin::into_balance(initial_liquidity);
        let liquidity_amount = balance::value(&liquidity_balance);
        
        // Split initial liquidity equally between outcomes
        let outcome_a_balance = balance::split(&mut liquidity_balance, liquidity_amount / 2);
        let outcome_b_balance = liquidity_balance;
        
        let market = Market {
            id: uid,
            question: string::utf8(question),
            description: string::utf8(description),
            end_time,
            creator: tx_context::sender(ctx),
            resolved: false,
            winning_outcome: 2, // Invalid/canceled by default
            total_liquidity: liquidity_amount,
            outcome_a_shares: outcome_a_balance,
            outcome_b_shares: outcome_b_balance,
            liquidity_providers: bag::new(ctx),
            volume_24h: 0,
            created_timestamp: tx_context::epoch_timestamp_ms(ctx),
            category: string::utf8(category),
            image_url: string::utf8(image_url),
            tags: {
                let mut converted_tags = vector::empty<String>();
                let mut i = 0;
                let len = vector::length(&tags);
                while (i < len) {
                    vector::push_back(&mut converted_tags, string::utf8(*vector::borrow(&tags, i)));
                    i = i + 1;
                };
                converted_tags
            }
        };

        // Transfer market to creator
        transfer::transfer(market, tx_context::sender(ctx));

        // Emit market created event
        event::emit(MarketCreated {
            market_id: market_id_for_event,
            creator: tx_context::sender(ctx),
            question: string::utf8(question),
            end_time
        });
    }

    // Place a prediction (buy shares)
    public entry fun place_prediction(
        market: &mut Market,
        outcome: u8, // 0 = NO, 1 = YES
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        assert!(current_time < market.end_time, EMarketEnded);
        assert!(!market.resolved, EMarketResolved);
        assert!(outcome == 0 || outcome == 1, EInvalidOutcome);

        let payment_amount = coin::value(&payment);
        let trader = tx_context::sender(ctx);

        // Calculate price based on current shares
        let total_shares = balance::value(&market.outcome_a_shares) + balance::value(&market.outcome_b_shares);
        let price = if (outcome == 1) {
            // Buying YES shares - price based on NO shares
            if (total_shares == 0) 5000 else (balance::value(&market.outcome_b_shares) * 10000) / total_shares
        } else {
            // Buying NO shares - price based on YES shares  
            if (total_shares == 0) 5000 else (balance::value(&market.outcome_a_shares) * 10000) / total_shares
        };

        // Calculate shares to receive
        let shares_to_receive = (payment_amount * 10000) / price;
        
        // Update market state
        if (outcome == 1) {
            // Buying YES shares - add to outcome_b_shares (NO side)
            balance::join(&mut market.outcome_b_shares, coin::into_balance(payment));
        } else {
            // Buying NO shares - add to outcome_a_shares (YES side)
            balance::join(&mut market.outcome_a_shares, coin::into_balance(payment));
        };

        market.total_liquidity = market.total_liquidity + payment_amount;
        market.volume_24h = market.volume_24h + payment_amount;

        // Emit trade event
        event::emit(TradeExecuted {
            market_id: object::uid_to_inner(&market.id),
            trader,
            outcome,
            amount: payment_amount,
            price
        });

        // TODO: Create and transfer shares to trader
        // For now, we'll just burn the payment as this is a simplified version
    }

    // Add liquidity to market
    public entry fun add_liquidity(
        market: &mut Market,
        liquidity: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        assert!(current_time < market.end_time, EMarketEnded);
        assert!(!market.resolved, EMarketResolved);

        let liquidity_amount = coin::value(&liquidity);
        let provider = tx_context::sender(ctx);

        // Split liquidity equally between outcomes
        let mut liquidity_balance = coin::into_balance(liquidity);
        let outcome_a_balance = balance::split(&mut liquidity_balance, liquidity_amount / 2);
        let outcome_b_balance = liquidity_balance;

        // Add to market balances
        balance::join(&mut market.outcome_a_shares, outcome_a_balance);
        balance::join(&mut market.outcome_b_shares, outcome_b_balance);

        market.total_liquidity = market.total_liquidity + liquidity_amount;

        // Track liquidity provider
        bag::add(&mut market.liquidity_providers, provider, liquidity_amount);

        // Emit liquidity event
        event::emit(LiquidityProvided {
            market_id: object::uid_to_inner(&market.id),
            provider,
            amount: liquidity_amount
        });
    }

    // Resolve market (only creator can resolve)
    public entry fun resolve_market(
        market: &mut Market,
        winning_outcome: u8, // 0 = NO, 1 = YES, 2 = invalid/canceled
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == market.creator, ENotCreator);
        assert!(clock::timestamp_ms(clock) >= market.end_time, EMarketNotEnded);
        assert!(!market.resolved, EMarketResolved);
        assert!(winning_outcome <= 2, EInvalidWinningOutcome);

        market.resolved = true;
        market.winning_outcome = winning_outcome;

        // Emit resolution event
        event::emit(MarketResolved {
            market_id: object::uid_to_inner(&market.id),
            winning_outcome,
            resolver: tx_context::sender(ctx)
        });
    }

    // Get market information for frontend queries
    public fun get_market_info(market: &Market): (String, String, u64, address, bool, u8, u64, u64, u64, u64, String, String, vector<String>) {
        (
            market.question,
            market.description,
            market.end_time,
            market.creator,
            market.resolved,
            market.winning_outcome,
            market.total_liquidity,
            balance::value(&market.outcome_a_shares),
            balance::value(&market.outcome_b_shares),
            market.volume_24h,
            market.category,
            market.image_url,
            market.tags
        )
    }

    // Get current prices for a market
    public fun get_market_prices(market: &Market): (u64, u64) {
        let total_shares = balance::value(&market.outcome_a_shares) + balance::value(&market.outcome_b_shares);
        let yes_price = if (total_shares == 0) {
            5000 // 50% if no liquidity
        } else {
            (balance::value(&market.outcome_b_shares) * 10000) / total_shares
        };
        let no_price = if (total_shares == 0) {
            5000 // 50% if no liquidity
        } else {
            (balance::value(&market.outcome_a_shares) * 10000) / total_shares
        };
        (yes_price, no_price)
    }

    // Check if market is active (not ended and not resolved)
    public fun is_market_active(market: &Market, clock: &Clock): bool {
        !market.resolved && clock::timestamp_ms(clock) < market.end_time
    }

    // Get liquidity provider amount
    public fun get_liquidity_provider_amount(market: &Market, provider: address): u64 {
        if (bag::contains(&market.liquidity_providers, provider)) {
            *bag::borrow(&market.liquidity_providers, provider)
        } else {
            0
        }
    }
}