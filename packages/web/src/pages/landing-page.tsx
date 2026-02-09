import { Link } from "@tanstack/react-router";
import { useTokenData, type TokenTransaction } from "../hooks/use-token-data";
import { aiccTokenAddress } from "@/lib/constants";

// Skeleton loader component for stats
function StatSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-16 bg-slate-700 rounded mb-1" />
      <div className="h-3 w-10 bg-slate-800 rounded" />
    </div>
  );
}

// Skeleton loader for transactions
function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between text-xs py-3 border-b border-white/10 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700" />
        <div className="h-4 w-32 bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-20 bg-slate-700 rounded" />
    </div>
  );
}

// Transaction item component
function TransactionItem({ tx }: { tx: TokenTransaction }) {
  const actionText = tx.action === "bought" ? "bought" : tx.action === "sold" ? "sold" : "licensed";
  const initials = tx.address.slice(2, 4).toUpperCase();
  
  return (
    <div className="flex items-center justify-between text-xs py-3 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
          {initials}
        </div>
        <div className="text-slate-300">
          {tx.address} <span className="text-slate-600">{actionText}</span>
          {tx.action === "licensed" && " asset"}
        </div>
      </div>
      <div className={`font-bold ${tx.action === "sold" ? "text-red-400" : "text-accent"}`}>
        {tx.action === "sold" ? "-" : "+"}{tx.amount} AICC
      </div>
    </div>
  );
}

// Live Network Data component
function LiveNetworkData() {
  const { data, isLoading, isError } = useTokenData();
  const tokenData = data;

  const isOffline = isError || !tokenData;
  
  return (
    <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-accent/20 rounded-2xl p-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="font-bold text-white">Live Network Data</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-accent font-bold px-2 py-1 bg-accent/10 rounded-full">
          <span className={`w-1.5 h-1.5 rounded-full bg-accent ${isLoading ? "animate-pulse" : ""}`} />
          {isLoading ? "UPDATING" : isOffline ? "OFFLINE" : "LIVE"}
        </span>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="p-4 bg-[#05070a] rounded-xl border border-white/10">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Holders</div>
          {isLoading ? (
            <StatSkeleton />
          ) : isOffline ? (
            <>
              <div className="text-xl font-black text-white">—</div>
              <div className="text-[10px] text-slate-500">Offline</div>
            </>
          ) : (
            <>
              <div className="text-xl font-black text-white">
                {tokenData.holders > 0 ? tokenData.holders.toLocaleString() : "—"}
              </div>
              <div className="text-[10px] text-accent">{tokenData.holdersChange}</div>
            </>
          )}
        </div>
        
        <div className="p-4 bg-[#05070a] rounded-xl border border-white/10">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Transfers (24h)</div>
          {isLoading ? (
            <StatSkeleton />
          ) : isOffline ? (
            <>
              <div className="text-xl font-black text-white">—</div>
              <div className="text-[10px] text-slate-500">Offline</div>
            </>
          ) : (
            <>
              <div className="text-xl font-black text-white">{tokenData.transfers24h}</div>
              <div className="text-[10px] text-accent">{tokenData.transfersChange}</div>
            </>
          )}
        </div>
        
        <div className="p-4 bg-[#05070a] rounded-xl border border-white/10">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Market Cap</div>
          {isLoading ? (
            <StatSkeleton />
          ) : isOffline ? (
            <>
              <div className="text-xl font-black text-white">—</div>
              <div className="text-[10px] text-slate-500">Offline</div>
            </>
          ) : (
            <>
              <div className="text-xl font-black text-white">{tokenData.marketCap}</div>
              <div className="text-[10px] text-slate-500">
                {tokenData.marketCapVerified ? "Verified" : "Unverified"}
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 bg-[#05070a] rounded-xl border border-white/10">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Liquidity</div>
          {isLoading ? (
            <StatSkeleton />
          ) : isOffline ? (
            <>
              <div className="text-xl font-black text-white">—</div>
              <div className="text-[10px] text-slate-500">Offline</div>
            </>
          ) : (
            <>
              <div className="text-xl font-black text-white">{tokenData.liquidity}</div>
              <div className="text-[10px] text-accent">
                {tokenData.liquidityLocked ? "Locked" : "Unlocked"}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : isOffline ? (
          <div className="text-center text-slate-500 py-4">Offline</div>
        ) : tokenData.recentTransactions.length > 0 ? (
          tokenData.recentTransactions.slice(0, 3).map((tx, index) => (
            <TransactionItem key={`${tx.address}-${tx.timestamp}-${index}`} tx={tx} />
          ))
        ) : (
          <div className="text-center text-slate-500 py-4">No recent transactions</div>
        )}
      </div>
      
      {/* Last updated timestamp */}
      {!isLoading && !isOffline && tokenData.lastUpdated && (
        <div className="mt-4 text-[10px] text-slate-600 text-right">
          Last updated: {new Date(tokenData.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070a] font-display text-slate-200 antialiased selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3 text-primary">
            <div className="size-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">
              CreativeAI
            </h2>

          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a className="hover:text-primary transition-colors" href="#studio">Studio</a>
            <a className="hover:text-primary transition-colors" href="#marketplace">Marketplace</a>
            <a className="hover:text-accent transition-colors" href="#token">AICC Token</a>
          </div>
          <Link to="/dashboard" className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded font-bold text-sm transition-all shadow-lg shadow-primary/20">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Next-Gen Creative Platform</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-8">
                The AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Creative Marketplace</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-lg mb-10 leading-relaxed">
                Generate high-fidelity ad creatives with AI intent recognition and trade them on a decentralized digital asset marketplace.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="px-8 py-4 bg-white text-[#05070a] font-bold rounded hover:bg-slate-200 transition-colors">
                  Start Generating
                </Link>
                <Link to="/login" className="px-8 py-4 bg-[#0f172a] border border-white/10 text-white font-bold rounded hover:bg-slate-800 transition-colors">
                  Explore Assets
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-4">
                  <img alt="Creative 1" className="w-full rounded-xl border border-white/10 opacity-80 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Ns23Q0Mcr294Tg9H-rbcpmKUHT5ai2wl6z_UGq0_iNoXPm8JxgSJnNwY8v8R1nwpVpFwtgh2wPuUT6IWbQYqLax3RCH7zDNRJfNvJ1-HAbEzplHjA1E8eEAM7RGBeQiCnKqma_ODv4WHIU4clmBDv7n2pkzo7wbKPnLgOp_h0tyfCymew9H5NbAmgLa-HaUOl5zIEal518zaByHe59VP8SJ_j7cqy5z1s69USYD9dtKh2SOVQz-Eq8WGWA52hgEeWT4SqEyxca0"/>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="studio" className="py-24 border-y border-white/10 bg-[#0f172a]/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">A Seamless Workflow</h2>
              <p className="text-slate-400">From concept to global distribution in minutes.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#0f172a] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1. Generate</h3>
                <p className="text-slate-400 text-sm">Input your campaign intent and let our LLM-powered engine build your visual identity.</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#0f172a] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">2. Preview</h3>
                <p className="text-slate-400 text-sm">Instantly visualize how your assets look across 20+ device frames and platforms.</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#0f172a] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">3. Publish</h3>
                <p className="text-slate-400 text-sm">Deploy directly to ad networks or mint as an NFT to secure your intellectual property.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="marketplace" className="py-32 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 p-10 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden group">
              <div className="relative z-10">
                <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Creative Studio</h3>
                <p className="text-slate-400 mb-8 max-w-md">Our 'Intent-to-Creative' engine understands marketing strategy, not just keywords. It builds brand-aligned visuals from simple briefs.</p>
                <div className="flex items-center gap-4 text-xs font-mono text-primary">
                  <span className="bg-primary/10 px-2 py-1 rounded">GPT-4V Core</span>
                  <span className="bg-primary/10 px-2 py-1 rounded">Stable Diffusion XL</span>
                </div>
              </div>
            </div>
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 p-10 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden group">
              <div className="relative z-10">
                <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Decentralized Marketplace</h3>
                <p className="text-slate-400 mb-8 max-w-md">The first peer-to-peer exchange for high-performance ad templates. Buy, sell, and license creative IP with smart contract security.</p>
                <div className="flex items-center gap-4 text-xs font-mono text-accent">
                  <span className="bg-accent/10 px-2 py-1 rounded">On-Chain Licensing</span>
                  <span className="bg-accent/10 px-2 py-1 rounded">Royalties 2.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Size Table */}
          <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Multi-Size Auto-Adapt</h3>
                <p className="text-sm text-slate-400">Real-time scaling across device categories</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0f172a] text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="px-8 py-4">Format</th>
                    <th className="px-8 py-4">Dimensions</th>
                    <th className="px-8 py-4">AI Optimization</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 text-white font-medium flex items-center gap-3">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Mobile Vertical
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-mono">1080 x 1920</td>
                    <td className="px-8 py-5 text-slate-300">Face-Centric Cropping</td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded text-[10px] font-bold">READY</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 text-white font-medium flex items-center gap-3">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Tablet Square
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-mono">2048 x 2048</td>
                    <td className="px-8 py-5 text-slate-300">Negative Space Fill</td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded text-[10px] font-bold">READY</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 text-white font-medium flex items-center gap-3">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Desktop Banner
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-mono">1920 x 600</td>
                    <td className="px-8 py-5 text-slate-300">Dynamic Text Flow</td>
                    <td className="px-8 py-5 text-right">
                      <span className="px-2 py-1 bg-accent/20 text-accent rounded text-[10px] font-bold">READY</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Token Section */}
        <section id="token" className="bg-[#020408] py-32 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-4xl font-black text-white mb-6 tracking-tight">AICC Token Ecosystem</h2>
                <p className="text-slate-400 mb-10 leading-relaxed">
                  AICC powers the CreativeAI marketplace. Use it to license assets, pay for generation compute, and participate in governance.
                </p>
                <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 mb-8 group hover:border-accent/50 transition-all">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">AICC Token Contract</label>
                  <div className="flex items-center justify-between">
                    <code className="text-accent font-mono text-sm">0x6F94...1d45</code>
                    <button
                      className="text-slate-400 hover:text-white transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(aiccTokenAddress);
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a
                    className="flex-1 bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    href={`https://basescan.org/token/${aiccTokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">Basescan</span>
                  </a>
                  <a 
                    className="flex-1 bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors" 
                    href="https://www.defined.fi/base/0xd65c491ef1c406882fbb380532119b6298910bf57b9eaa81d40eb6eeb9df269a"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Defined.fi</span>
                  </a>
                </div>
              </div>
              <div className="lg:col-span-3">
                <LiveNetworkData />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="h-6 w-6 bg-slate-400 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-[#05070a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-black tracking-tighter uppercase text-white">CreativeAI</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a className="hover:text-white transition-colors" href="#">Privacy</a>
            <a className="hover:text-white transition-colors" href="#">Terms</a>
            <a className="hover:text-white transition-colors" href="#">Support</a>
            <a className="hover:text-white transition-colors" href="#">Documentation</a>
          </div>
          <p className="text-xs text-slate-600">© 2026 CreativeAI. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}