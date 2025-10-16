/**
 * API Service for connecting to Seti Backend
 * Web2.5 Architecture: Fast backend queries + Blockchain settlement
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Markets API
export const marketsApi = {
  // Get all markets with optional filters
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    status?: 'active' | 'resolved';
    sort_by?: 'volume_24h' | 'total_liquidity' | 'created_timestamp';
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{
      markets: any[];
      pagination: {
        page: number;
        per_page: number;
        total: number;
        pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>(`/markets${query ? `?${query}` : ''}`);
  },

  // Get single market by ID
  getById: async (id: string) => {
    return apiFetch<{ market: any }>(`/markets/${id}`);
  },

  // Get featured markets
  getFeatured: async () => {
    return apiFetch<{ markets: any[] }>('/markets/featured');
  },

  // Get market categories
  getCategories: async () => {
    return apiFetch<{ categories: Array<{ name: string; count: number }> }>('/markets/categories');
  },

  // Sync markets from blockchain (admin)
  sync: async () => {
    return apiFetch<{ message: string; synced_count: number }>('/markets/sync', {
      method: 'POST',
    });
  },
};

// Predictions API
export const predictionsApi = {
  // Get all predictions with filters
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    market_id?: string;
    user_address?: string;
    outcome?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{
      predictions: any[];
      pagination: any;
    }>(`/predictions${query ? `?${query}` : ''}`);
  },

  // Create new prediction (after blockchain transaction)
  create: async (data: {
    transaction_hash: string;
    market_id: string;
    user_address: string;
    outcome: number;
    amount: number;
    price?: number;
    shares?: number;
    timestamp: number;
  }) => {
    return apiFetch<{ message: string; prediction: any }>('/predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get recent predictions
  getRecent: async (limit: number = 50) => {
    return apiFetch<{ predictions: any[] }>(`/predictions/recent?limit=${limit}`);
  },
};

// Users API
export const usersApi = {
  // Get user profile
  getProfile: async (address: string) => {
    return apiFetch<{ user: any }>(`/users/${address}`);
  },

  // Update user profile
  updateProfile: async (address: string, data: {
    username?: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
  }) => {
    return apiFetch<{ message: string; user: any }>(`/users/${address}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user predictions
  getPredictions: async (address: string, page: number = 1, per_page: number = 20) => {
    return apiFetch<{
      predictions: any[];
      pagination: any;
    }>(`/users/${address}/predictions?page=${page}&per_page=${per_page}`);
  },

  // Get user stats
  getStats: async (address: string) => {
    return apiFetch<{ stats: any }>(`/users/${address}/stats`);
  },

  // Get leaderboard
  getLeaderboard: async (params?: {
    sort_by?: 'total_volume' | 'total_predictions';
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{ leaderboard: any[] }>(`/users/leaderboard${query ? `?${query}` : ''}`);
  },
};

// Analytics API
export const analyticsApi = {
  // Get platform overview
  getOverview: async () => {
    return apiFetch<{
      overview: {
        total_markets: number;
        active_markets: number;
        resolved_markets: number;
        total_volume: number;
        total_liquidity: number;
        total_predictions: number;
        total_users: number;
        active_users_7d: number;
      };
    }>('/analytics/overview');
  },

  // Get top markets
  getTopMarkets: async (metric: string = 'volume', limit: number = 10) => {
    return apiFetch<{ markets: any[] }>(`/analytics/markets/top?metric=${metric}&limit=${limit}`);
  },

  // Get category stats
  getCategoryStats: async () => {
    return apiFetch<{
      categories: Array<{
        category: string;
        market_count: number;
        total_volume: number;
        total_liquidity: number;
      }>;
    }>('/analytics/categories/stats');
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 20) => {
    return apiFetch<{ activity: any[] }>(`/analytics/activity/recent?limit=${limit}`);
  },
};

// Helper to sync blockchain transaction to backend
export async function syncTransactionToBackend(txData: {
  type: 'prediction' | 'market_created' | 'liquidity_added';
  transaction_hash: string;
  data: any;
}) {
  try {
    switch (txData.type) {
      case 'prediction':
        return await predictionsApi.create({
          transaction_hash: txData.transaction_hash,
          market_id: txData.data.market_id,
          user_address: txData.data.user_address,
          outcome: txData.data.outcome,
          amount: txData.data.amount,
          price: txData.data.price,
          shares: txData.data.shares,
          timestamp: Math.floor(Date.now() / 1000),
        });
      
      // Add other transaction types as needed
      default:
        console.warn(`Unhandled transaction type: ${txData.type}`);
    }
  } catch (error) {
    console.error('Failed to sync transaction to backend:', error);
    // Don't throw - let the blockchain transaction succeed even if backend sync fails
  }
}

export default {
  markets: marketsApi,
  predictions: predictionsApi,
  users: usersApi,
  analytics: analyticsApi,
  syncTransaction: syncTransactionToBackend,
};

