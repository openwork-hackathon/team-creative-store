export type ProjectStatus = "draft" | "generating" | "ready" | "published";

export type RecencyFilter = "today" | "week" | "month" | "all";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  imageUrl: string;
  updatedAt: string;
  createdAt?: string;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  industry?: string;
  recency?: RecencyFilter;
}

export type LicenseType = "standard" | "extended" | "exclusive";

export type PublishCategory = "ads" | "branding" | "e-commerce" | "gaming";

export type AssetType = "ad_kit" | "branding" | "character" | "ui_kit" | "background" | "template" | "logo" | "scene_3d";

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
  imageUrl?: string;
  category: PublishCategory;
  assetType?: AssetType;
  licenseType: LicenseType;
  tags: string[];
  price: number;
  isPremium?: boolean;
  deliverables: DeliverablePackage[];
  includeSourceFiles: boolean;
}
