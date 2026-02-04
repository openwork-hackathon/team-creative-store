export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
      <div className="max-w-xl w-full p-10 text-center">
        <h1 className="text-3xl font-black tracking-tight">Vercel Deploy Smoke Test</h1>
        <p className="mt-4 text-slate-600">
          If you can see this page, the Vercel build + deploy pipeline is working.
        </p>
        <p className="mt-6 text-xs text-slate-400">
          Build timestamp: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}
