import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  PublishFormData,
  LicenseType,
  PublishCategory,
  DeliverablePackage,
} from "./types";

export interface PublishModalProps {
  isOpen: boolean;
  projectTitle?: string;
  onClose: () => void;
  onPublish: (data: PublishFormData) => void;
  onSaveDraft?: (data: PublishFormData) => void;
}

const DEFAULT_DELIVERABLES: DeliverablePackage[] = [
  {
    id: "mobile",
    name: "Mobile Package",
    description: "4 Sizes (PNG, MP4)",
    icon: "smartphone",
    iconColor: "text-blue-500",
    selected: true,
  },
  {
    id: "web",
    name: "Web & Social",
    description: "8 Sizes (JPG, WebP)",
    icon: "desktop_windows",
    iconColor: "text-purple-500",
    selected: true,
  },
];

const CATEGORIES: { value: PublishCategory; label: string }[] = [
  { value: "ads", label: "Ads" },
  { value: "branding", label: "Branding" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "gaming", label: "Gaming" },
];

const DEFAULT_DESCRIPTION =
  "Elevate your digital presence with this creative collection. This package features AI-optimized assets across 15+ dimensions, ensuring your creative message lands perfectly on every device from mobile to TV displays.";

export function PublishModal({
  isOpen,
  projectTitle = "",
  onClose,
  onPublish,
}: PublishModalProps) {
  const [formData, setFormData] = useState<PublishFormData>({
    title: projectTitle,
    description: DEFAULT_DESCRIPTION,
    category: "ads",
    licenseType: "standard",
    tags: [],
    price: 1250,
    deliverables: DEFAULT_DELIVERABLES,
    includeSourceFiles: false,
  });

  const [tagInput, setTagInput] = useState("");

  const handleInputChange = useCallback(
    (field: keyof PublishFormData, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && tagInput.trim() && formData.tags.length < 10) {
        e.preventDefault();
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
        setTagInput("");
      }
    },
    [tagInput, formData.tags.length]
  );

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const handleLicenseChange = useCallback((license: LicenseType) => {
    setFormData((prev) => ({ ...prev, licenseType: license }));
  }, []);

  const handleSourceFilesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, includeSourceFiles: e.target.checked }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onPublish(formData);
    },
    [formData, onPublish]
  );

  if (!isOpen) return null;

  const selectedAssetsCount = formData.deliverables.filter(
    (d) => d.selected
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Publish to Network
            </h2>
            <p className="text-sm text-muted-foreground">
              Finalize your assets and prepare for distribution
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Left Column */}
            <div className="md:col-span-7 space-y-6">
              {/* Campaign Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Campaign Title <span className="text-primary">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Summer NFT Drop 2024"
                  required
                  className="rounded-xl px-4 py-3 h-auto"
                />
              </div>

              {/* Description */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Description
                  </label>
                </div>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                  rows={4}
                />
              </div>

              {/* Category & License */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange(
                        "category",
                        e.target.value as PublishCategory
                      )
                    }
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    License Type
                  </label>
                  <div className="flex p-1 bg-muted rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => handleLicenseChange("standard")}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                        formData.licenseType === "standard"
                          ? "bg-card shadow-sm text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLicenseChange("extended")}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                        formData.licenseType === "extended"
                          ? "bg-card shadow-sm text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      Extended
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted border border-border rounded-xl min-h-[48px]">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-card px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2 text-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="material-symbols-outlined text-[14px] cursor-pointer hover:text-primary"
                      >
                        close
                      </button>
                    </span>
                  ))}
                  {formData.tags.length < 10 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 focus:outline-none w-20 text-foreground placeholder:text-muted-foreground"
                      placeholder="Add tag..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-5 space-y-6">
              {/* Price */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <label className="block text-sm font-semibold mb-4 text-primary">
                  Listing Price (AICC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange("price", Number(e.target.value))
                    }
                    className="w-full bg-card border border-primary/20 rounded-xl px-4 py-4 text-2xl font-black focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                    AICC
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    info
                  </span>
                  Recommended Price:{" "}
                  <span className="text-foreground font-bold">
                    1,180 - 1,420 AICC
                  </span>
                </p>
              </div>

              {/* Deliverables */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-foreground">
                    Deliverables
                  </label>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    {selectedAssetsCount * 6} Assets selected
                  </span>
                </div>
                <div className="space-y-3">
                  {formData.deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            deliverable.icon === "smartphone"
                              ? "bg-blue-500/10"
                              : "bg-purple-500/10"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-sm ${deliverable.iconColor}`}
                          >
                            {deliverable.icon}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {deliverable.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {deliverable.description}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                    </div>
                  ))}

                  {/* Include Source Files */}
                  <label className="flex items-center gap-3 p-4 border border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.includeSourceFiles}
                      onChange={handleSourceFilesChange}
                      className="rounded border-border text-primary focus:ring-primary bg-transparent"
                    />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Include Source Files
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        PSD, AI, and Figma Archives
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border bg-muted/50 flex items-center justify-between">
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-3 h-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="px-10 py-3 h-auto rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Confirm & Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
