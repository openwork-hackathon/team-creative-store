export type ProjectStatus = "draft" | "generating" | "ready" | "published";

export interface ProjectMember {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  imageUrl: string;
  updatedAt: string;
  members: ProjectMember[];
}

export interface ProjectFilter {
  status?: ProjectStatus;
  industry?: string;
  recency?: string;
}
