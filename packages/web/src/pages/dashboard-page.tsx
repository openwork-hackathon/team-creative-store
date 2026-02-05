import { TrendingDown, TrendingUp } from "lucide-react";

type DashboardStats = {
  dailyGenerations: { value: number; change: number };
  publishedCreatives: { value: number; change: number };
  monthlyRevenue: { value: string; change: number };
};

type Project = {
  id: string;
  name: string;
  timestamp: string;
  status: "draft" | "generating" | "ready" | "published";
};

type DashboardPageProps = {
  userName?: string;
  stats?: DashboardStats;
  recentProjects?: Project[];
  onNewProject?: () => void;
  onEnterGenerator?: () => void;
  onProjectAction?: (projectId: string, action: string) => void;
};

const defaultStats: DashboardStats = {
  dailyGenerations: { value: 0, change: 0 },
  publishedCreatives: { value: 0, change: 0 },
  monthlyRevenue: { value: "0 AICC", change: 0 }
};

const statusStyles = {
  draft: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  generating: "bg-primary/10 text-primary",
  ready: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
  published: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
};

const statusLabels = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
  published: "Published"
};

export function DashboardPage({
  userName = "Creator",
  stats = defaultStats,
  recentProjects = [],
  onNewProject,
  onEnterGenerator,
  onProjectAction
}: DashboardPageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">Welcome back, {userName}</h1>
          <p className="text-muted-foreground">
            Manage your creative designs, ad campaigns, and NFT generations from one place.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onNewProject}
            className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-primary-foreground text-base font-bold hover:bg-primary/90 transition-colors"
          >
            <span className="mr-2">+</span>
            <span>New Project</span>
          </button>
          <button
            onClick={onEnterGenerator}
            className="flex items-center justify-center rounded-lg h-12 px-6 bg-secondary text-secondary-foreground text-base font-bold hover:bg-secondary/80 transition-colors"
          >
            <span className="mr-2">✨</span>
            <span>Enter Generator</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 border bg-card">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            Daily Generations
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stats.dailyGenerations.value}</p>
            {stats.dailyGenerations.change !== 0 && (
              <p
                className={`text-sm font-semibold flex items-center ${
                  stats.dailyGenerations.change > 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stats.dailyGenerations.change > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stats.dailyGenerations.change > 0 ? "+" : ""}
                {stats.dailyGenerations.change}%
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 border bg-card">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            Published Creatives
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stats.publishedCreatives.value}</p>
            {stats.publishedCreatives.change !== 0 && (
              <p
                className={`text-sm font-semibold flex items-center ${
                  stats.publishedCreatives.change > 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stats.publishedCreatives.change > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stats.publishedCreatives.change > 0 ? "+" : ""}
                {stats.publishedCreatives.change}%
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-6 border bg-card">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            Monthly Revenue
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stats.monthlyRevenue.value}</p>
            {stats.monthlyRevenue.change !== 0 && (
              <p
                className={`text-sm font-semibold flex items-center ${
                  stats.monthlyRevenue.change > 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stats.monthlyRevenue.change > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stats.monthlyRevenue.change > 0 ? "+" : ""}
                {stats.monthlyRevenue.change}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Recent Projects</h2>
        {recentProjects.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No projects yet. Create your first project to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-muted-foreground text-xs font-bold uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{project.timestamp}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusStyles[project.status]
                        }`}
                      >
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {project.status === "draft" && (
                        <button
                          onClick={() => onProjectAction?.(project.id, "continue")}
                          className="text-primary hover:underline text-sm font-semibold"
                        >
                          Continue
                        </button>
                      )}
                      {project.status === "generating" && (
                        <button
                          onClick={() => onProjectAction?.(project.id, "view-logs")}
                          className="text-primary hover:underline text-sm font-semibold"
                        >
                          View Logs
                        </button>
                      )}
                      {project.status === "ready" && (
                        <>
                          <button
                            onClick={() => onProjectAction?.(project.id, "publish")}
                            className="text-primary hover:underline text-sm font-semibold mr-4"
                          >
                            Publish
                          </button>
                          <button
                            onClick={() => onProjectAction?.(project.id, "preview")}
                            className="text-primary hover:underline text-sm font-semibold"
                          >
                            Preview
                          </button>
                        </>
                      )}
                      {project.status === "published" && (
                        <button
                          onClick={() => onProjectAction?.(project.id, "preview")}
                          className="text-primary hover:underline text-sm font-semibold"
                        >
                          Preview
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
