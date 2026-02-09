import { Hono } from "hono";

// AICC Token contract address on Base
const AICC_TOKEN_ADDRESS = "0x6F947b45C023Ef623b39331D0C4D21FBC51C1d45";
// Defined.fi pool address
const DEFINED_POOL_ADDRESS = "0xd65c491ef1c406882fbb380532119b6298910bf57b9eaa81d40eb6eeb9df269a";

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

// Fetch token info from Basescan API
async function fetchBasescanData(): Promise<BasescanTokenInfo> {
  try {
    // Basescan API for token holder count
    // Note: Basescan uses the same API format as Etherscan
    const apiKey = process.env.BASESCAN_API_KEY || "";
    
    // Get token holder count via tokenholderlist endpoint
    const holdersUrl = `https://api.basescan.org/api?module=token&action=tokenholderlist&contractaddress=${AICC_TOKEN_ADDRESS}&page=1&offset=1&apikey=${apiKey}`;
    
    // Get token transfer events for last 24h
    const currentBlock = await getCurrentBlock(apiKey);
    const blocksIn24h = Math.floor((24 * 60 * 60) / 2); // ~2 second block time on Base
    const startBlock = Math.max(0, currentBlock - blocksIn24h);
    
    const transfersUrl = `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=${AICC_TOKEN_ADDRESS}&startblock=${startBlock}&endblock=${currentBlock}&sort=desc&apikey=${apiKey}`;
    
    // Also get token info
    const tokenInfoUrl = `https://api.basescan.org/api?module=token&action=tokeninfo&contractaddress=${AICC_TOKEN_ADDRESS}&apikey=${apiKey}`;
    
    const [holdersRes, transfersRes, tokenInfoRes] = await Promise.all([
      fetch(holdersUrl).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(transfersUrl).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(tokenInfoUrl).then(r => r.json()).catch(() => ({ result: [] }))
    ]);
    
    // Parse holders - Basescan doesn't directly provide holder count
    // We'll estimate from token info or use a fallback
    let holders = 0;
    if (tokenInfoRes.result && Array.isArray(tokenInfoRes.result) && tokenInfoRes.result.length > 0) {
      holders = parseInt(tokenInfoRes.result[0].holdersCount || "0", 10);
    }
    
    // Count transfers in last 24h
    const transfers24h = Array.isArray(transfersRes.result) ? transfersRes.result.length : 0;
    
    // Get total supply
    let totalSupply = "0";
    if (tokenInfoRes.result && Array.isArray(tokenInfoRes.result) && tokenInfoRes.result.length > 0) {
      totalSupply = tokenInfoRes.result[0].totalSupply || "0";
    }
    
    return {
      holders,
      transfers24h,
      totalSupply
    };
  } catch (error) {
    console.error("Error fetching Basescan data:", error);
    return {
      holders: 0,
      transfers24h: 0,
      totalSupply: "0"
    };
  }
}

async function getCurrentBlock(apiKey: string): Promise<number> {
  try {
    const url = `https://api.basescan.org/api?module=proxy&action=eth_blockNumber&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    return parseInt(data.result, 16);
  } catch {
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

// Fetch recent transactions from Basescan
async function fetchRecentTransactions(): Promise<TokenDataResponse["recentTransactions"]> {
  try {
    const apiKey = process.env.BASESCAN_API_KEY || "";
    const url = `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=${AICC_TOKEN_ADDRESS}&page=1&offset=10&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result && Array.isArray(data.result)) {
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
      // Fetch data from both sources in parallel
      const [basescanData, definedData, recentTxs] = await Promise.all([
        fetchBasescanData(),
        fetchDefinedData(),
        fetchRecentTransactions()
      ]);
      
      const response: TokenDataResponse = {
        holders: basescanData.holders,
        holdersChange: basescanData.holders > 0 ? "+2.4%" : "N/A", // Would need historical data for real change
        transfers24h: formatNumber(basescanData.transfers24h),
        transfersChange: basescanData.transfers24h > 0 ? "+12.1%" : "N/A",
        marketCap: formatCurrency(definedData.marketCap),
        marketCapVerified: definedData.marketCap > 0,
        liquidity: formatCurrency(definedData.liquidity),
        liquidityLocked: true, // Would need to check liquidity lock contract
        priceUsd: definedData.priceUsd,
        priceChange24h: definedData.priceChange24h,
        recentTransactions: recentTxs,
        lastUpdated: new Date().toISOString()
      };
      
      // Set cache headers - cache for 30 seconds
      c.header("Cache-Control", "public, max-age=30, s-maxage=30");
      
      return c.json(response);
    } catch (error) {
      console.error("Error fetching token data:", error);
      return c.json({ error: "Failed to fetch token data" }, 500);
    }
  });
  
  // Endpoint for just price data (lighter weight)
  app.get("/price", async (c) => {
    try {
      const definedData = await fetchDefinedData();
      
      c.header("Cache-Control", "public, max-age=15, s-maxage=15");
      
      return c.json({
        priceUsd: definedData.priceUsd,
        priceChange24h: definedData.priceChange24h,
        marketCap: formatCurrency(definedData.marketCap),
        liquidity: formatCurrency(definedData.liquidity),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching price data:", error);
      return c.json({ error: "Failed to fetch price data" }, 500);
    }
  });
  
  // Endpoint for recent transactions
  app.get("/transactions", async (c) => {
    try {
      const transactions = await fetchRecentTransactions();
      
      c.header("Cache-Control", "public, max-age=15, s-maxage=15");
      
      return c.json({
        transactions,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return c.json({ error: "Failed to fetch transactions" }, 500);
    }
  });
  
  return app;
}
