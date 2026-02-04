import { useEffect, useState } from 'react'

const BG_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAszJdVXUxUULQuBQkqu8T88B7hSrUcivGSgmWudGhgsufouy7jkQHcFkGwZNj8dJxRcM151pN49Y_hWWopuiFP3miIETWgGl9E_osZX5nftqKltbF-4-Prsy6q4HdRxNsn2kEQBMVGNxakUYqrj26ML0LOa0obtNa4Ick2Ej2v284dfZO863FmCUi9Pq4dcbryGDmYoEI5lZZu0zEb2pUWOFmTv_u2WM66t_ygzPjuD-nbmqEldASIt2m2APAayQRowejG8_6W5E0"

const GOOGLE_ICON_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAoQCo-Mq96pcQW4bLJTRkbb5NG6PnX6q26VXF3yjwN7-xBfOYvrA2qCD-T1VLLBcPEYpY_Inn_bOKW7JU0seV7BmHnIWiIrlv5lA3mA3BbPQjUFj0zkcY9bGkj4kOlZt8YJU-oQvVI8OoR4uHul5S8gaXjid9SoctAS86fKRNccSaAI1Co16Ew6s-N8IJ64T2y5Er_NShPxNG6YHnvOicIdPsnspecFxq7zuy5FJmiziivP0VNACPohSHBjtfddNtsvdxv4kjCWos'

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className ?? ''}`.trim()}>
      {name}
    </span>
  )
}

export default function LoginPage() {
  // Design html uses <html class="dark">. Keep it consistent by default.
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen">
      <div className="relative flex h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-row">
          {/* Left Side: Login Form */}
          <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-24 bg-white dark:bg-background-dark">
            <div className="w-full max-w-[440px] flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                      <Icon name="auto_awesome" className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tight uppercase">
                      CreativeAD
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDark((v) => !v)}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {dark ? 'Dark' : 'Light'}
                  </button>
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                  Login to your account
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Access your AI-powered NFT ad campaigns.
                </p>
              </div>

              {/* SSO Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 w-full h-12 rounded-lg bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#2c3b5a] transition-colors font-bold text-sm"
                >
                  <Icon name="mail" className="text-[20px]" />
                  Continue with Email
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 w-full h-12 rounded-lg bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#2c3b5a] transition-colors font-bold text-sm"
                >
                  <img alt="" className="w-5 h-5" src={GOOGLE_ICON_URL} />
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-3 w-full h-12 rounded-lg bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#2c3b5a] transition-colors font-bold text-sm"
                >
                  <Icon name="terminal" className="text-[20px]" />
                  Continue with GitHub
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  Secure Access
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                By continuing, you agree to our{' '}
                <a className="text-primary hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-primary hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </div>

          {/* Right Side: Visual Context & Modal Overlay */}
          <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url('${BG_IMAGE_URL}')` }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-background-dark via-transparent to-primary/20" />

            {/* Wallet Binding Modal (Glassmorphism) */}
            <div className="relative z-20 w-full max-w-[500px] glass-effect rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full w-fit">
                    <Icon name="link" className="text-[14px]" />
                    BASE NETWORK
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Wallet Binding Required
                  </h2>
                  <p className="text-slate-300">
                    To access NFT capabilities and mint campaign assets, please
                    connect your Web3 wallet.
                  </p>
                </div>

                {/* Step-by-step Timeline */}
                <div className="grid grid-cols-[40px_1fr] gap-x-2">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Icon
                        name="account_balance_wallet"
                        className="text-[20px]"
                      />
                    </div>
                    <div className="w-[2px] bg-slate-700 h-10 grow" />
                  </div>
                  <div className="flex flex-1 flex-col pb-6">
                    <p className="text-white text-base font-medium leading-normal">
                      Connect Wallet
                    </p>
                    <p className="text-slate-400 text-sm font-normal">
                      Not Connected
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                      <Icon name="draw" className="text-[20px]" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-slate-300 text-base font-medium leading-normal">
                      Sign Message
                    </p>
                    <p className="text-slate-500 text-sm font-normal">
                      Verification required
                    </p>
                  </div>
                </div>

                {/* Action Panel Area */}
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="truncate">Connect Wallet</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    <span className="truncate">I'll do this later</span>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10 flex gap-3">
                  <Icon name="info" className="text-primary" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Binding your wallet ensures that all AI-generated assets are
                    cryptographically linked to your identity on the Base L2
                    network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
