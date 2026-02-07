import { Link, useRouterState } from "@tanstack/react-router";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Creatives", to: "/creative-studio" },
  { label: "Project", to: "/projects" },
  { label: "Market", to: "/market" },
  { label: "Wallet", to: "/wallet" }
] as const;

type TopNavUser = {
  name?: string;
  email?: string;
  image?: string;
};

type TopNavProps = {
  user?: TopNavUser | null;
};

export function TopNav({ user }: TopNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-background-light px-4 py-3 dark:border-[#232f48] dark:bg-background-dark md:px-10">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4 text-primary">
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

        {/* Search */}
        <label className="hidden max-w-64 min-w-40 flex-col md:flex !h-10">
          <div className="flex h-full w-full flex-1 items-stretch rounded-lg">
            <div className="flex items-center justify-center rounded-l-lg border-r-0 border-none bg-slate-100 pl-4 text-slate-400 dark:bg-[#232f48] dark:text-[#92a4c9]">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="form-input flex h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-l-0 border-none bg-slate-100 px-4 pl-2 text-base font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:border-none focus:outline-0 focus:ring-0 dark:bg-[#232f48] dark:text-white dark:placeholder:text-[#92a4c9]"
              placeholder="Search assets..."
            />
          </div>
        </label>
      </div>

      <div className="flex flex-1 items-center justify-end gap-8">
        {/* Navigation Links */}
        <nav className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "text-sm font-bold leading-normal text-primary"
                    : "text-sm font-medium leading-normal text-slate-600 transition-colors hover:text-primary dark:text-white"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Avatar */}
        {user?.image ? (
          <div
            className="aspect-square size-10 rounded-full border-2 border-primary bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${user.image}")` }}
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-[#232f48] dark:text-white">
            {initials || "AI"}
          </div>
        )}
      </div>
    </header>
  );
}
