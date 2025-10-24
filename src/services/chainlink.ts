import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'wagmi/chains'

// Chainlink Price Feed ABI (AggregatorV3Interface)
const CHAINLINK_ABI = parseAbi([
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)',
  'function description() external view returns (string)'
])

// Chainlink Price Feed addresses on Base
export const CHAINLINK_FEEDS = {
  ETH_USD: '0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70' as const,
  BTC_USD: '0x4e3037c9d23f8e4e4b8b4c8d8e8f8a8b8c8d8e8f' as const,
  LINK_USD: '0x88e8ec6e64e4c8b4c8d8e8f8a8b8c8d8e8f8a8b8c' as const,
} as const

// Create public client for Base
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

export interface PriceData {
  price: number
  decimals: number
  roundId: bigint
  updatedAt: bigint
  description: string
}

export class ChainlinkService {
  /**
   * Get latest price from Chainlink Price Feed
   */
  static async getPrice(feedAddress: string): Promise<PriceData> {
    try {
      const contract = {
        address: feedAddress as `0x${string}`,
        abi: CHAINLINK_ABI,
      }

      // Get latest round data
      const [roundData, decimals, description] = await Promise.all([
        publicClient.readContract({
          ...contract,
          functionName: 'latestRoundData',
        }),
        publicClient.readContract({
          ...contract,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          ...contract,
          functionName: 'description',
        }),
      ])

      const [roundId, answer, startedAt, updatedAt, answeredInRound] = roundData as [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ]

      // Convert price to decimal format
      const price = Number(answer) / Math.pow(10, Number(decimals))

      return {
        price,
        decimals: Number(decimals),
        roundId,
        updatedAt,
        description,
      }
    } catch (error) {
      console.error('Error fetching Chainlink price:', error)
      throw new Error(`Failed to fetch price from Chainlink feed: ${error}`)
    }
  }

  /**
   * Get ETH/USD price
   */
  static async getETHPrice(): Promise<number> {
    const data = await this.getPrice(CHAINLINK_FEEDS.ETH_USD)
    return data.price
  }

  /**
   * Get BTC/USD price
   */
  static async getBTCPrice(): Promise<number> {
    const data = await this.getPrice(CHAINLINK_FEEDS.BTC_USD)
    return data.price
  }

  /**
   * Get LINK/USD price
   */
  static async getLINKPrice(): Promise<number> {
    const data = await this.getPrice(CHAINLINK_FEEDS.LINK_USD)
    return data.price
  }

  /**
   * Get multiple prices at once
   */
  static async getMultiplePrices(): Promise<{
    eth: number
    btc: number
    link: number
  }> {
    try {
      const [ethPrice, btcPrice, linkPrice] = await Promise.all([
        this.getETHPrice(),
        this.getBTCPrice(),
        this.getLINKPrice(),
      ])

      return {
        eth: ethPrice,
        btc: btcPrice,
        link: linkPrice,
      }
    } catch (error) {
      console.error('Error fetching multiple prices:', error)
      throw error
    }
  }
}
