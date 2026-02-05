import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./dashboard-page";

describe("DashboardPage", () => {
  it("renders welcome message and empty state when no projects", () => {
    render(<DashboardPage userName="Alice" />);

    expect(screen.getByText(/Welcome back, Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it("renders stats cards with values", () => {
    const stats = {
      dailyGenerations: { value: 142, change: 12 },
      publishedCreatives: { value: 89, change: 5 },
      monthlyRevenue: { value: "12,450 AICC", change: -2 }
    };

    render(<DashboardPage stats={stats} />);

    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("89")).toBeInTheDocument();
    expect(screen.getByText("12,450 AICC")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();
    expect(screen.getByText("-2%")).toBeInTheDocument();
  });

  it("renders recent projects list", () => {
    const projects = [
      { id: "1", name: "Project Alpha", timestamp: "2 hours ago", status: "published" as const },
      { id: "2", name: "Project Beta", timestamp: "Yesterday", status: "generating" as const }
    ];

    render(<DashboardPage recentProjects={projects} />);

    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
    expect(screen.getByText("Project Beta")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Generating")).toBeInTheDocument();
  });

  it("calls onNewProject when New Project button is clicked", async () => {
    const user = userEvent.setup();
    const handleNewProject = vi.fn();

    render(<DashboardPage onNewProject={handleNewProject} />);

    await user.click(screen.getByRole("button", { name: /New Project/i }));
    expect(handleNewProject).toHaveBeenCalledTimes(1);
  });

  it("calls onEnterGenerator when Enter Generator button is clicked", async () => {
    const user = userEvent.setup();
    const handleEnterGenerator = vi.fn();

    render(<DashboardPage onEnterGenerator={handleEnterGenerator} />);

    await user.click(screen.getByRole("button", { name: /Enter Generator/i }));
    expect(handleEnterGenerator).toHaveBeenCalledTimes(1);
  });

  it("calls onProjectAction with correct params when project action is clicked", async () => {
    const user = userEvent.setup();
    const handleProjectAction = vi.fn();
    const projects = [
      { id: "proj-1", name: "Test Project", timestamp: "Now", status: "draft" as const }
    ];

    render(<DashboardPage recentProjects={projects} onProjectAction={handleProjectAction} />);

    await user.click(screen.getByRole("button", { name: /Continue/i }));
    expect(handleProjectAction).toHaveBeenCalledWith("proj-1", "continue");
  });

  it("renders different actions based on project status", () => {
    const projects = [
      { id: "1", name: "Draft Project", timestamp: "Now", status: "draft" as const },
      { id: "2", name: "Gen Project", timestamp: "Now", status: "generating" as const },
      { id: "3", name: "Ready Project", timestamp: "Now", status: "ready" as const },
      { id: "4", name: "Pub Project", timestamp: "Now", status: "published" as const }
    ];

    render(<DashboardPage recentProjects={projects} />);

    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Logs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Publish/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Preview/i }).length).toBeGreaterThan(0);
  });
});
