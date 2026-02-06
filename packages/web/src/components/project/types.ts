export type ProjectStatus = "draft" | "generating" | "ready" | "published";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  imageUrl: string;
  updatedAt: string;
}

export interface ProjectFilter {
  status?: ProjectStatus;
  industry?: string;
  recency?: string;
}

export type LicenseType = "standard" | "extended";

export type PublishCategory = "ads" | "branding" | "e-commerce" | "gaming";

export interface DeliverablePackage {
  id: string;
  name: string;
  description: string;
  icon: "smartphone" | "desktop_windows" | "tv";
  iconColor: string;
  selected: boolean;
}

export interface PublishFormData {
  title: string;
  description: string;
  category: PublishCategory;
  licenseType: LicenseType;
  tags: string[];
  price: number;
  deliverables: DeliverablePackage[];
  includeSourceFiles: boolean;
}
