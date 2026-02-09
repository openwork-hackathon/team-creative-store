import { useQuery } from "@tanstack/react-query";

// Types matching the API response
export interface TokenTransaction {
  address: string;
  action: "bought" | "sold" | "licensed";
  amount: string;
  timestamp: number;
}

export interface TokenData {
  holders: number;
  holdersChange: string;
  transfers24h: string;
  transfersChange: string;
  marketCap: string;
  marketCapVerified: boolean;
  liquidity: string;
  liquidityLocked: boolean;
  priceUsd: number;
  priceChange24h: number;
  recentTransactions: TokenTransaction[];
  lastUpdated: string;
}

export interface TokenPriceData {
  priceUsd: number;
  priceChange24h: number;
  marketCap: string;
  liquidity: string;
  lastUpdated: string;
}

// API base URL - use environment variable or default to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Fetch full token data
async function fetchTokenData(): Promise<TokenData> {
  const response = await fetch(`${API_BASE_URL}/api/token`);
  if (!response.ok) {
    throw new Error("Failed to fetch token data");
  }
  return response.json();
}

// Fetch price data only
async function fetchTokenPrice(): Promise<TokenPriceData> {
  const response = await fetch(`${API_BASE_URL}/api/token/price`);
  if (!response.ok) {
    throw new Error("Failed to fetch token price");
  }
  return response.json();
}

// Fetch recent transactions
async function fetchTokenTransactions(): Promise<{ transactions: TokenTransaction[]; lastUpdated: string }> {
  const response = await fetch(`${API_BASE_URL}/api/token/transactions`);
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}

/**
 * Hook to fetch full token data including holders, transfers, market cap, liquidity, and recent transactions
 * Refetches every 30 seconds
 */
export function useTokenData() {
  return useQuery({
    queryKey: ["tokenData"],
    queryFn: fetchTokenData,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Hook to fetch just price data (lighter weight)
 * Refetches every 15 seconds
 */
export function useTokenPrice() {
  return useQuery({
    queryKey: ["tokenPrice"],
    queryFn: fetchTokenPrice,
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Hook to fetch recent transactions
 * Refetches every 15 seconds
 */
export function useTokenTransactions() {
  return useQuery({
    queryKey: ["tokenTransactions"],
    queryFn: fetchTokenTransactions,
    refetchInterval: 15000,
    staleTime: 10000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
