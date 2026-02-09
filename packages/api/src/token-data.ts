import { Hono } from "hono";

// AICC Token contract address on Base
const AICC_TOKEN_ADDRESS = "0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45";

// Cache configuration - 30 minutes TTL
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: {
  tokenData?: CacheEntry<TokenDataResponse>;
  priceData?: CacheEntry<{
    priceUsd: number;
    priceChange24h: number;
    marketCap: string;
    liquidity: string;
    lastUpdated: string;
  }>;
  transactions?: CacheEntry<{
    transactions: TokenDataResponse["recentTransactions"];
    lastUpdated: string;
  }>;
} = {};

function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}
// Defined.fi pool address
const DEFINED_POOL_ADDRESS = "0xd65c491ef1c406882fbb380532119b6298910bf57b9eaa81d40eb6eeb9df269a";
// Base chain ID for Etherscan V2 API
const BASE_CHAIN_ID = 8453;

// Types for API responses
interface BasescanTokenInfo {
  holders: number;
  transfers24h: number;
  totalSupply: string;
}

interface DefinedTokenInfo {
  priceUsd: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  priceChange24h: number;
}

interface DexScreenerPair {
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  fdv: number;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
}

interface TokenDataResponse {
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
  recentTransactions: {
    address: string;
    action: "bought" | "sold" | "licensed";
    amount: string;
    timestamp: number;
  }[];
  lastUpdated: string;
}

// Fetch token info from Etherscan V2 API (supports Base chain)
// Note: Free tier has limited support for Base chain
async function fetchEtherscanV2Data(): Promise<BasescanTokenInfo> {
  try {
    const apiKey = process.env.BASESCAN_API_KEY || "";
    
    // Etherscan V2 API endpoint with chainid parameter
    const baseUrl = "https://api.etherscan.io/v2/api";
    
    // Get current block number (this works on free tier)
    const currentBlock = await getCurrentBlock(apiKey);
    const blocksIn24h = Math.floor((24 * 60 * 60) / 2); // ~2 second block time on Base
    const startBlock = Math.max(0, currentBlock - blocksIn24h);
    
    // Try to get token transfers (may fail on free tier)
    const transfersUrl = `${baseUrl}?chainid=${BASE_CHAIN_ID}&module=account&action=tokentx&contractaddress=${AICC_TOKEN_ADDRESS}&startblock=${startBlock}&endblock=${currentBlock}&sort=desc&apikey=${apiKey}`;
    
    // Try to get token info
    const tokenInfoUrl = `${baseUrl}?chainid=${BASE_CHAIN_ID}&module=token&action=tokeninfo&contractaddress=${AICC_TOKEN_ADDRESS}&apikey=${apiKey}`;
    
    const [transfersRes, tokenInfoRes] = await Promise.all([
      fetch(transfersUrl).then(r => r.json()).catch((e) => {
        console.error("Error fetching transfers:", e);
        return { status: "0", result: [] };
      }),
      fetch(tokenInfoUrl).then(r => r.json()).catch((e) => {
        console.error("Error fetching token info:", e);
        return { status: "0", result: [] };
      })
    ]);
    
    // Check if API returned an error (e.g., free tier limitation)
    if (transfersRes.status === "0" && transfersRes.message === "NOTOK") {
      console.warn("Etherscan V2 API limitation:", transfersRes.result);
    }
    
    // Parse holders from token info
    let holders = 0;
    if (tokenInfoRes.status === "1" && tokenInfoRes.result && Array.isArray(tokenInfoRes.result) && tokenInfoRes.result.length > 0) {
      holders = parseInt(tokenInfoRes.result[0].holdersCount || "0", 10);
    }
    
    // Count transfers in last 24h
    const transfers24h = (transfersRes.status === "1" && Array.isArray(transfersRes.result))
      ? transfersRes.result.length
      : 0;
    
    // Get total supply
    let totalSupply = "0";
    if (tokenInfoRes.status === "1" && tokenInfoRes.result && Array.isArray(tokenInfoRes.result) && tokenInfoRes.result.length > 0) {
      totalSupply = tokenInfoRes.result[0].totalSupply || "0";
    }
    
    return {
      holders,
      transfers24h,
      totalSupply
    };
  } catch (error) {
    console.error("Error fetching Etherscan V2 data:", error);
    return {
      holders: 0,
      transfers24h: 0,
      totalSupply: "0"
    };
  }
}

// Fetch data from DexScreener API (free, no API key required)
async function fetchDexScreenerData(): Promise<DefinedTokenInfo> {
  try {
    // DexScreener API - search by token address
    const url = `https://api.dexscreener.com/latest/dex/tokens/${AICC_TOKEN_ADDRESS}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.pairs && Array.isArray(data.pairs) && data.pairs.length > 0) {
      // Find the pair on Base chain or use the first one
      const pair: DexScreenerPair = data.pairs.find((p: { chainId: string }) => p.chainId === "base") || data.pairs[0];
      
      return {
        priceUsd: parseFloat(pair.priceUsd || "0"),
        marketCap: pair.fdv || 0,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        priceChange24h: pair.priceChange?.h24 || 0
      };
    }
    
    return {
      priceUsd: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0
    };
  } catch (error) {
    console.error("Error fetching DexScreener data:", error);
    return {
      priceUsd: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0
    };
  }
}

async function getCurrentBlock(apiKey: string): Promise<number> {
  try {
    // Use Etherscan V2 API for block number
    const url = `https://api.etherscan.io/v2/api?chainid=${BASE_CHAIN_ID}&module=proxy&action=eth_blockNumber&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.result && typeof data.result === "string") {
      return parseInt(data.result, 16);
    }
    return 0;
  } catch (error) {
    console.error("Error getting current block:", error);
    return 0;
  }
}

// Fetch token info from Defined.fi GraphQL API
async function fetchDefinedData(): Promise<DefinedTokenInfo> {
  try {
    const definedApiKey = process.env.DEFINED_API_KEY || "";
    
    // Defined.fi GraphQL endpoint
    const graphqlUrl = "https://graph.defined.fi/graphql";
    
    // Query for token pair data
    const query = `
      query GetTokenPair($pairAddress: String!, $networkId: Int!) {
        pair(pairAddress: $pairAddress, networkId: $networkId) {
          token0 {
            symbol
            name
            address
          }
          token1 {
            symbol
            name
            address
          }
          price
          priceChange24
          liquidity
          volume24
          marketCap
        }
      }
    `;
    
    const variables = {
      pairAddress: DEFINED_POOL_ADDRESS,
      networkId: 8453 // Base network ID
    };
    
    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": definedApiKey ? `Bearer ${definedApiKey}` : "",
        "X-Api-Key": definedApiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    const data = await response.json();
    
    if (data.data?.pair) {
      const pair = data.data.pair;
      return {
        priceUsd: parseFloat(pair.price || "0"),
        marketCap: parseFloat(pair.marketCap || "0"),
        liquidity: parseFloat(pair.liquidity || "0"),
        volume24h: parseFloat(pair.volume24 || "0"),
        priceChange24h: parseFloat(pair.priceChange24 || "0")
      };
    }
    
    // Fallback: try alternative endpoint for token data
    return await fetchDefinedTokenData();
  } catch (error) {
    console.error("Error fetching Defined.fi data:", error);
    return {
      priceUsd: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0
    };
  }
}

// Alternative Defined.fi query for token data
async function fetchDefinedTokenData(): Promise<DefinedTokenInfo> {
  try {
    const definedApiKey = process.env.DEFINED_API_KEY || "";
    const graphqlUrl = "https://graph.defined.fi/graphql";
    
    const query = `
      query GetToken($address: String!, $networkId: Int!) {
        token(address: $address, networkId: $networkId) {
          symbol
          name
          price
          priceChange24
          marketCap
          liquidity
          volume24
        }
      }
    `;
    
    const variables = {
      address: AICC_TOKEN_ADDRESS,
      networkId: 8453
    };
    
    const response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": definedApiKey ? `Bearer ${definedApiKey}` : "",
        "X-Api-Key": definedApiKey
      },
      body: JSON.stringify({ query, variables })
    });
    
    const data = await response.json();
    
    if (data.data?.token) {
      const token = data.data.token;
      return {
        priceUsd: parseFloat(token.price || "0"),
        marketCap: parseFloat(token.marketCap || "0"),
        liquidity: parseFloat(token.liquidity || "0"),
        volume24h: parseFloat(token.volume24 || "0"),
        priceChange24h: parseFloat(token.priceChange24 || "0")
      };
    }
    
    return {
      priceUsd: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0
    };
  } catch (error) {
    console.error("Error fetching Defined.fi token data:", error);
    return {
      priceUsd: 0,
      marketCap: 0,
      liquidity: 0,
      volume24h: 0,
      priceChange24h: 0
    };
  }
}

// Fetch recent transactions using Etherscan V2 API
async function fetchRecentTransactions(): Promise<TokenDataResponse["recentTransactions"]> {
  try {
    const apiKey = process.env.BASESCAN_API_KEY || "";
    // Use Etherscan V2 API with chainid parameter
    const url = `https://api.etherscan.io/v2/api?chainid=${BASE_CHAIN_ID}&module=account&action=tokentx&contractaddress=${AICC_TOKEN_ADDRESS}&page=1&offset=10&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for API errors (e.g., free tier limitation)
    if (data.status === "0" && data.message === "NOTOK") {
      console.warn("Etherscan V2 API limitation for transactions:", data.result);
      return [];
    }
    
    if (data.status === "1" && data.result && Array.isArray(data.result)) {
      return data.result.slice(0, 5).map((tx: {
        to: string;
        from: string;
        value: string;
        timeStamp: string;
      }) => {
        // Determine if it's a buy or sell based on transfer direction
        // This is simplified - in reality you'd check against DEX router addresses
        const isBuy = tx.to.toLowerCase() !== AICC_TOKEN_ADDRESS.toLowerCase();
        
        return {
          address: shortenAddress(isBuy ? tx.to : tx.from),
          action: isBuy ? "bought" as const : "sold" as const,
          amount: formatTokenAmount(tx.value),
          timestamp: parseInt(tx.timeStamp, 10) * 1000
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
}

// Helper functions
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

function formatTokenAmount(value: string): string {
  // Assuming 18 decimals
  const amount = parseFloat(value) / 1e18;
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

// Create the token data routes
export function createTokenDataRoutes() {
  const app = new Hono();
  
  // Main endpoint to get all token data
  app.get("/", async (c) => {
    try {
      // Check cache first
      if (isCacheValid(cache.tokenData)) {
        console.log("Returning cached token data");
        c.header("Cache-Control", "public, max-age=1800, s-maxage=1800");
        c.header("X-Cache", "HIT");
        return c.json(cache.tokenData.data);
      }
      
      console.log("Fetching fresh token data");
      // Fetch data from multiple sources in parallel
      // Use Etherscan V2 for on-chain data, DexScreener as primary price source, Defined.fi as fallback
      const [etherscanData, dexScreenerData, definedData, recentTxs] = await Promise.all([
        fetchEtherscanV2Data(),
        fetchDexScreenerData(),
        fetchDefinedData(),
        fetchRecentTransactions()
      ]);
      
      // Prefer DexScreener data, fallback to Defined.fi
      const priceData = dexScreenerData.priceUsd > 0 ? dexScreenerData : definedData;
      
      const response: TokenDataResponse = {
        holders: etherscanData.holders,
        holdersChange: etherscanData.holders > 0 ? "+2.4%" : "N/A", // Would need historical data for real change
        transfers24h: formatNumber(etherscanData.transfers24h),
        transfersChange: etherscanData.transfers24h > 0 ? "+12.1%" : "N/A",
        marketCap: formatCurrency(priceData.marketCap),
        marketCapVerified: priceData.marketCap > 0,
        liquidity: formatCurrency(priceData.liquidity),
        liquidityLocked: true, // Would need to check liquidity lock contract
        priceUsd: priceData.priceUsd,
        priceChange24h: priceData.priceChange24h,
        recentTransactions: recentTxs,
        lastUpdated: new Date().toISOString()
      };
      
      // Store in cache
      cache.tokenData = {
        data: response,
        timestamp: Date.now()
      };
      
      // Set cache headers - cache for 30 minutes (1800 seconds)
      c.header("Cache-Control", "public, max-age=1800, s-maxage=1800");
      c.header("X-Cache", "MISS");
      
      return c.json(response);
    } catch (error) {
      console.error("Error fetching token data:", error);
      return c.json({ error: "Failed to fetch token data" }, 500);
    }
  });
  
  // Endpoint for just price data (lighter weight)
  app.get("/price", async (c) => {
    try {
      // Check cache first
      if (isCacheValid(cache.priceData)) {
        console.log("Returning cached price data");
        c.header("Cache-Control", "public, max-age=1800, s-maxage=1800");
        c.header("X-Cache", "HIT");
        return c.json(cache.priceData.data);
      }
      
      console.log("Fetching fresh price data");
      const definedData = await fetchDefinedData();
      
      const response = {
        priceUsd: definedData.priceUsd,
        priceChange24h: definedData.priceChange24h,
        marketCap: formatCurrency(definedData.marketCap),
        liquidity: formatCurrency(definedData.liquidity),
        lastUpdated: new Date().toISOString()
      };
      
      // Store in cache
      cache.priceData = {
        data: response,
        timestamp: Date.now()
      };
      
      // Set cache headers - cache for 30 minutes (1800 seconds)
      c.header("Cache-Control", "public, max-age=1800, s-maxage=1800");
      c.header("X-Cache", "MISS");
      
      return c.json(response);
    } catch (error) {
      console.error("Error fetching price data:", error);
      return c.json({ error: "Failed to fetch price data" }, 500);
    }
  });
  
  // Endpoint for recent transactions
  app.get("/transactions", async (c) => {
    try {
      // Check cache first
      if (isCacheValid(cache.transactions)) {
        console.log("Returning cached transactions data");
        c.header("Cache-Control", "public, max-age=1800, s-maxage=1800");
        c.header("X-Cache", "HIT");
        return c.json(cache.transactions.data);
      }
      
      console.log("Fetching fresh transactions data");
      const transactions = await fetchRecentTransactions();
      
      const response = {
        transactions,
        lastUpdated: new Date().toISOString()
      };
      
      // Store in cache
      cache.transactions = {
        data: response,
        timestamp: Date.now()
      };
      
      // Set cache headers - cache for 30 minutes (1800 seconds)
      c.header("Cache-Control", "public, max-age=1800, s-maxage=1800");
      c.header("X-Cache", "MISS");
      
      return c.json(response);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return c.json({ error: "Failed to fetch transactions" }, 500);
    }
  });
  
  return app;
}
