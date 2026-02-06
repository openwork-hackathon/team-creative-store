import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ProjectFilterBar,
  ProjectGrid,
  ProjectFab,
  PublishModal,
  type Project,
  type ProjectStatus,
  type PublishFormData
} from "@/components/project";

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Project Alpha Neon",
    status: "published",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTxrNP2Tl5z9pyClfWiUSOTgUdvUEGpCvA9USbxKsZ5pnA6f60BDUykkWd7otcxFmS6JVAyWSR7Hk5a_cgVZBEL5z7jo51TGIWbGVXQHJAO-ki5KkzbGlbljrJe4KpwXWynU_2pkIYqGsUjcDMf_kC56diRu9vBJC5Tf6VqMa3NyuN8nNB6mEjem-qr71iMWw2GcXGeL1dqINVDxwmUWX0h9wXVDlw8VOU0kSzVXUTyML7-hDSl8NkHSZeSaPM7zGYyw39X_Y4M6c",
    updatedAt: "Updated 2 hours ago",
    members: [
      {
        id: "m1",
        name: "Alice",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAJbeAzAKPcXUNUOpE05Ri4sCADNGC_VchhaiSuYBVEWu3mmr7bcMbLzy5Vw8dR-QG5izmeKRFugybTf0nqdRr-xPXyWhumzm5VVkcn0yLuWgbJvJVCYzQK3TDQIB6R3Q869j0RklFA5dJsieFx7WRjEW-W-U885kHupubq0-J8kvAKYG9YvxfHtCjnYzRNvpo5EngRNVZ4RUY4XohD1r6g7CC-FCLZo53E96Fv7cj_V6DpIpyq-hfGuZ-send6aljdUrmIuzTvFFs"
      },
      { id: "m2", name: "Bob" },
      { id: "m3", name: "Charlie" }
    ]
  },
  {
    id: "2",
    title: "Beta Ad Campaign",
    status: "generating",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJh4gjMpZhDz-jB7hwQ6XUYfVkrbgbyLWqBLo5pq4XJvLORkOHGwyq_w2PSXu6gimMxBqHYVxq6X-Yba0FYXmywIK55QEW76kAkLAn_5wPKq3PA14v2oNJmKE8gDamPh1HPEFCO3j9bXeFCPAapngXSjgl4idhZ6SHkStVrdiAWjROLP58Ng69fI2PsxkDfm4mA2XmNlex2a75pQi5zLrgUk9Xbr6vmwnVVR2wNM05VzDXkWUn8VsCr3QSl32wFS1BhRM3Rlz0cxY",
    updatedAt: "Updated 10 mins ago",
    members: [
      {
        id: "m4",
        name: "Diana",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBDcvf6U_DJCAnu9sT3Xsk_40eHSKxZKnscfp6qma8jG9Qvld-F5j-qIyNmx0BiWIXYXEfoeij0-mnPckM3HvvDPBgrvVki_dBWIoJ3JBfL05-LKkjtXWKAJTlRi1gutHjytY6e53x59A12INI_WnCbDLchirUTN0u0AZVRNmN0aOHRq8G6XxvgzIoMM4BKaYYevSOb3CvJw32xwR50lo3379tb7LpkXMoRZuHHddBg8uWEArojbydqGzyS7KJ3eMx2k47wjdEDP3U"
      }
    ]
  },
  {
    id: "3",
    title: "Metasphere NFTs",
    status: "draft",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXeCQmXFTKvjlyyT201BDgijy4si9-XvWd7vMvOxPXswfEsmTOLQvh6a-nKUPMJzN1RY9QjXiAxkHUAd3t5V7yiTPc9nn36FW3j18CgVmh2ogQVLG7qXavevuZNbn_YJq-bkWObeNpzjWGcBvyApP1Kcl_73zJej_Ym40RfjDV6H3Zx_ci-8d9nwYlZXRjSfp7zYZMqwKZZXJPjhYIzG6EOKuDs_fho2rv1QWn6UZoYsYEUBbZV6bNpmrKFBLN5RkioyxWnx9edP8",
    updatedAt: "Updated 1 day ago",
    members: [
      {
        id: "m5",
        name: "Eve",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCj9uNoogLeOcxk4tKPBxkRN2ZnjoEaoQsAHYeUHn9IqxwqmCE9dMklSZNj6TdS7P4yZnO6VkxHvRMwmnDXqT9yhtEEYwkLlB3g7DyaeotMfm0VsfiXdTloIeU4Jd3MpZlw8LPkOsOMdNzgdN7aavzXfgGByW4av9hHUuFj8Gd55VXDZ6I1ZBkMq8jeJCnb3GuURnU_f2DehbtkTZeY254c-nw8c3HP6Bo8-kcPdgaLyBPJiPsZrGwKOIVfc2U1voFSjmIV4onwf70"
      }
    ]
  },
  {
    id: "4",
    title: "Social Launch Kit",
    status: "ready",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoDVIaNlQImpWNIq55oXQjoBFq7l_tfhVB4c0NTnZlXt_DNrsbfNqu1BQeryhiBYrmFHO1SDGY7TSG4KYfT-ieKEqmcZqePo3zYXuoCr1yB6xzyc_pjzc7y2jnSbu3vcqZwR6yikSPQ9XAEAGWn1-2CTjJJQ4cU8VuwcWUOJGdVpnrJZXJ8c8OTC-9O3Zt-r-RmtxlZuZRDhQgyYksJBpKfqJPP-njWCzXljY0AByXjUk23AoNCgSh8-uedZN9DxUgP4nxoLbezpk",
    updatedAt: "Updated 5 hours ago",
    members: [
      {
        id: "m6",
        name: "Frank",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA7dA2ddfvLOVXoGb7zhhHwvjTYK7b19ybXMOrckDOzcaBXgP_xg-16QCh5Sy_kkiwezxNQDk2-eMlpGmIB1Cx0EqvYQrguMLjt6C5YfpyBtd7A5KVW4mcakSKi0Y7ORYI3CbxWvA2zfBwwI2r0IebnxEbJ-4N34xsS61-OdUyJB_gdNF9hQLdjuYeHCTXJi6RR7FG8ldEj9fwrhC0WjfTtFps5vUin_JXPhZgI93OEucf43CFOl2i6gH38fg5aWnOdZ7PqzaXTqKA"
      }
    ]
  },
  {
    id: "5",
    title: "Q3 Marketing Kit",
    status: "published",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDX0-nro4QDsxDtEvoJg6G-uxneSuk-33n95MEkyoq4c21vWdFNzizqoqe_0tqKoT5R_UkApbBNjvIkffoX-iYy9i66W599KI41N5KuQjFmmMnyCehTqhNJxOa9sJv1DfnVsto8JHI_jxvOISJqxm_xzVNIBwhBQ7hTAxjXG4QyqUImXQCw9vOXuz_KfAbPJfhcWeBF0xIIX-2ZRsWYK3FWyanXD0bCgegkvDFgBSSgVl_oytE_91irZr3c5bSOFPIj5OqavmqtfHs",
    updatedAt: "Updated 3 days ago",
    members: [
      {
        id: "m7",
        name: "Grace",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAJJkcSdb0vfG5Tb7k1sHt082NKAHzF2cPcSbojCp9PoUCttCLPnsOgC5chnYckBMZkb35TJbm5-DxGiLmuOnmnSxkQitzUo2lvu-unr6D5Fmf-7UwaM3q_on4wLEqNomVnjQMgUtuWQp2GoNg5J18Q0_FQMF1Snbtr8WoVhUxaLGrR9OS4GP-bS3HBTjDnzEaTZByfiqd47t4fYqYsB7dPC-NQEuoogAaUo-0-F7Bg6_3S06wtyapQh8xA9oT2J_Pa-QRE2vugh4Y"
      }
    ]
  },
  {
    id: "6",
    title: "Eco-Brand Identity",
    status: "draft",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKh5JNt6La1MpFBKXXM4REKdK78u0EjUwRhc3faKK2z8wO6FyTT8PdlZBmmw5jHnfMlu_4H9pfUOhzmXgxiH2tJhXYY7WuH4Llnd_lh--jvGP-MY9rz4UY7e0JiP0talyZavhiSjczvXH4Jfal8sGWI8FDAWNHsChopgmx0GHkwXnjLfEfrQYzuDxMbuKv5-Y9alnFarbHV9ejdVQRKHQWnISMW-MQwnUx9UjDh1gKhz2TZPRmMdh8HPRYCvoiih51hjhpv2FDT_8",
    updatedAt: "Updated 4 hours ago",
    members: [
      {
        id: "m8",
        name: "Henry",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBwUyIUZFPDQ-cunyWbmKfse6WFzj5t9Z1Qty6KCZDt06YIIIOjge4PQ9TuRSE-VQz6plANMeOMM9g9DLAQ0SvsJzIRXQ20GlhIddQ_UQyxFLGMyIfZJ4th2mQBuP-Kd6UVQCiUmn7jMNOHBVejfM7C9bUb_idVRho7I4AgYP274qiE1YEL24Be2vmRLfA7dLmJLNOVOa2JvRwPygLjVnuvoWxM8qlT-sz_I0E5v4BwA_WjBAsFvzqHflA9QFAgK8vV2lg5R9XEkTA"
      }
    ]
  },
  {
    id: "7",
    title: "Summer Flash Sale",
    status: "ready",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDBguNRQDisXS_WqRL5hvJuxVP5muAl_07cFXFO-5nu_ts7Kx_v6LTnstEcCmdEqCBKoI6-x9a1-T3gOKxX_XHcH1f8voztg6P2XpkLbSA5U0VQgjmliaQXCK9wlihzjFBSBjlZGx4atY_-XNp3pcFeOkvuanvyiY2FNV9Ac390p7SSMEugI18WM1tA-FrBfgRdQZuhw98mEJIfkETdnVLCKcHel2m3pWa1ov-03HAADRlPZzUoy3squdfuPbJxkoBiPIA-d7qOz7c",
    updatedAt: "Updated 6 hours ago",
    members: [
      {
        id: "m9",
        name: "Ivy",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCU_Z4vQDvSAAgqnhsnS2tHrhaWgslL6Hn6n9UZDEGmsD-dpCk2pW-dc1f7lMY2yHaDpKlwKWFpeuY6CYZwAG7sAGNCjym0FcDS-0XY3BaAZsuQH15bwPiHaF-QTSGsEPBHgnmascI77W9hLW6eVvqCGv8BmM1yXyHJ-dW5G8JB7Mn4Npt0JO1LU6-S1RqnbqWLLlQHiclUbHvFsQmYSl7HjpMlsrXtLjHMxv0LqRm3ErPhgaqBTS7aZ8ICKXo803XeWSxq4MSRe9k"
      }
    ]
  },
  {
    id: "8",
    title: "AI Motion Graphics",
    status: "generating",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAiDvTFcXRvVS6ywRSq4YPdaW9h5s1VSEW1yjjLIokK-38QxJdLKptyD095KU7OnNaUni9s-XMbyHBZGcfRHOBkRimj3EAaE2fXgRdQcuY2o5DzIWuLg-ag5pdv8R0AoOeRAfj4dHkTaffmxJ-hh00XPL_d4bhdzo5d9PP7GvoiexV3kxa8vbzCC81CSB6aZG3aP49ZxfKpGQBebfuJ9RZ6s3xsoUcJnf-F-6Ecw1-YTyV1vVKGlHIMXsGw7pTcnBHFC4jfA4aldI4",
    updatedAt: "Updated 1 hour ago",
    members: [
      {
        id: "m10",
        name: "Jack",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB9fFXLwi_B-o5WkDUzmPFTYJEh_AkUoeYSxjjnMyf0v5dwFQXF_OxdkTg6EtxkoOHZjHFgJISMkGYDB3zXH4VWO7mEl0muoauVS5VMwS61r35GMF1egyNbEvtjWzq3e2_CzYv1pYRjLXQtXrE-8yWztFcU7fxATzwu_9x6v8jdvTlSBXXBoAxD8ZHLMm78vn1WSzIyg8LMHxszugLatG2wbdBZh-YHdDi8sn73YSMwRFm-IyxWFhF4AUs3DoA-Uf4rEsa3wDcQMvA"
      }
    ]
  }
];

export function ProjectsPage() {
  const navigate = useNavigate();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>();
  const [industryFilter, setIndustryFilter] = useState<string | undefined>();
  const [recencyFilter, setRecencyFilter] = useState<string | undefined>();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Publish modal state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishingProjectId, setPublishingProjectId] = useState<string | null>(null);

  // Get the project being published
  const publishingProject = useMemo(() => {
    if (!publishingProjectId) return null;
    return mockProjects.find((p) => p.id === publishingProjectId) ?? null;
  }, [publishingProjectId]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }
      // Industry and recency filters would be applied here with real data
      return true;
    });
  }, [statusFilter]);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleEdit = (id: string) => {
    // Navigate to project editor
    navigate({ to: "/creative-studio", search: { projectId: id } });
  };

  const handlePreview = (id: string) => {
    // Open preview modal or navigate to preview page
    console.log("Preview project:", id);
  };

  const handleMenuClick = (id: string) => {
    // Open context menu
    console.log("Menu clicked for project:", id);
  };

  const handleNewProject = () => {
    // Navigate to create new project
    navigate({ to: "/creative-studio" });
  };

  const handleEditSelection = () => {
    if (selectedIds.size === 1) {
      const [id] = selectedIds;
      handleEdit(id);
    }
  };

  const handlePreviewSelection = () => {
    if (selectedIds.size === 1) {
      const [id] = selectedIds;
      handlePreview(id);
    }
  };

  const handleArchiveSelection = () => {
    console.log("Archive projects:", Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleDeleteSelection = () => {
    console.log("Delete projects:", Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  // Publish handlers
  const handlePublishClick = useCallback((id: string) => {
    setPublishingProjectId(id);
    setPublishModalOpen(true);
  }, []);

  const handlePublishClose = useCallback(() => {
    setPublishModalOpen(false);
    setPublishingProjectId(null);
  }, []);

  const handlePublishSubmit = useCallback((data: PublishFormData) => {
    console.log("Publishing project:", publishingProjectId, data);
    // TODO: Call API to publish project
    setPublishModalOpen(false);
    setPublishingProjectId(null);
  }, [publishingProjectId]);

  const handleSaveDraft = useCallback((data: PublishFormData) => {
    console.log("Saving draft:", publishingProjectId, data);
    // TODO: Call API to save draft
    setPublishModalOpen(false);
    setPublishingProjectId(null);
  }, [publishingProjectId]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-[-0.033em] text-foreground md:text-4xl">
          Projects
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your AI creative projects, campaigns, and assets
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <ProjectFilterBar
          statusFilter={statusFilter}
          industryFilter={industryFilter}
          recencyFilter={recencyFilter}
          onStatusChange={setStatusFilter}
          onIndustryChange={setIndustryFilter}
          onRecencyChange={setRecencyFilter}
          hasSelection={selectedIds.size > 0}
          onEditSelection={handleEditSelection}
          onPreviewSelection={handlePreviewSelection}
          onArchiveSelection={handleArchiveSelection}
          onDeleteSelection={handleDeleteSelection}
        />
      </div>

      {/* Project Grid */}
      <ProjectGrid
        projects={filteredProjects}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onPreview={handlePreview}
        onMenuClick={handleMenuClick}
        onPublish={handlePublishClick}
      />

      {/* Floating Action Button */}
      <ProjectFab onClick={handleNewProject} />

      {/* Publish Modal */}
      <PublishModal
        isOpen={publishModalOpen}
        projectTitle={publishingProject?.title}
        onClose={handlePublishClose}
        onPublish={handlePublishSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
}
