import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { createApiClient, type MarketplaceListing, type MarketplaceQuery } from "@/lib/api";

const api = createApiClient();

// Filter dropdown component
function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "All"
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-border bg-card pl-4 pr-3 transition-colors hover:border-primary"
      >
        <p className="text-sm font-medium text-foreground">{label}: {selectedLabel}</p>
        <span className="material-symbols-outlined text-muted-foreground">keyboard_arrow_down</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-xl">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${!value ? "text-primary font-semibold" : "text-foreground"}`}
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${value === option.value ? "text-primary font-semibold" : "text-foreground"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Price range filter component
function PriceRangeFilter({
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange
}: {
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = priceMin || priceMax
    ? `${priceMin || "0"} - ${priceMax || "∞"} AICC`
    : "All";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-border bg-card pl-4 pr-3 transition-colors hover:border-primary"
      >
        <p className="text-sm font-medium text-foreground">Price: {displayLabel}</p>
        <span className="material-symbols-outlined text-muted-foreground">keyboard_arrow_down</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[200px] rounded-lg border border-border bg-card p-4 shadow-xl">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Min Price (AICC)</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => onPriceMinChange(e.target.value)}
                  placeholder="0"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Price (AICC)</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => onPriceMaxChange(e.target.value)}
                  placeholder="No limit"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onPriceMinChange("");
                  onPriceMaxChange("");
                }}
                className="w-full rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Marketplace card component
function MarketplaceCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <Link
      to="/market/$id"
      params={{ id: listing.id }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card pb-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${listing.imageUrl}")` }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex translate-y-4 transform items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl transition-transform group-hover:translate-y-0">
            <span className="material-symbols-outlined">visibility</span> View Details
          </span>
        </div>
        {listing.isPremium && (
          <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Premium
          </div>
        )}
      </div>
      <div className="px-4 py-1">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {listing.title}
          </h3>
          <div className="flex items-center gap-0.5 text-amber-500">
            <span className="material-symbols-outlined !text-[14px]">star</span>
            <span className="text-xs font-bold">{listing.rating}</span>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          by <span className="transition-colors hover:text-primary">{listing.creator.name}</span>
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined !text-[18px] text-primary">monetization_on</span>
            <span className="font-bold text-foreground">{listing.priceAicc} AICC</span>
          </div>
          <span className="rounded-full p-2 text-primary transition-colors group-hover:bg-primary/10">
            <span className="material-symbols-outlined">shopping_cart</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const result: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        result.push(i);
      }
      if (currentPage < totalPages - 2) result.push("ellipsis");
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="flex size-10 items-center justify-center text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={
              page === currentPage
                ? "flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
                : "flex size-10 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            }
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </nav>
  );
}

function MarketPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assetType, setAssetType] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Simple debounce
    setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  // Build query params
  const queryParams: MarketplaceQuery = useMemo(() => {
    const params: MarketplaceQuery = {
      page: currentPage,
      limit: 12
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (assetType) params.assetType = assetType;
    if (licenseType) params.licenseType = licenseType;
    if (priceMin) params.priceMin = parseFloat(priceMin);
    if (priceMax) params.priceMax = parseFloat(priceMax);
    return params;
  }, [debouncedSearch, assetType, licenseType, priceMin, priceMax, currentPage]);

  // Fetch listings
  const listingsQuery = useQuery({
    queryKey: ["marketplace", "listings", queryParams],
    queryFn: () => api.getMarketplaceListings(queryParams)
  });

  // Fetch asset types for filter
  const assetTypesQuery = useQuery({
    queryKey: ["marketplace", "asset-types"],
    queryFn: () => api.getAssetTypes()
  });

  // Fetch license types for filter
  const licenseTypesQuery = useQuery({
    queryKey: ["marketplace", "license-types"],
    queryFn: () => api.getLicenseTypes()
  });

  const listings = listingsQuery.data?.listings ?? [];
  const pagination = listingsQuery.data?.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 1 };
  const assetTypes = assetTypesQuery.data?.assetTypes ?? [];
  const licenseTypes = licenseTypesQuery.data?.licenseTypes ?? [];

  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setAssetType("");
    setLicenseType("");
    setPriceMin("");
    setPriceMax("");
    setCurrentPage(1);
  };

  const hasActiveFilters = debouncedSearch || assetType || licenseType || priceMin || priceMax;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-[-0.033em] text-foreground md:text-4xl">
          AI Creative Marketplace
        </h1>
        <p className="text-base text-muted-foreground">
          Discover and purchase AI-generated creative assets, templates, and ad kits
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="flex w-full flex-col">
              <div className="flex h-12 w-full items-stretch rounded-xl border border-border bg-card transition-all focus-within:ring-2 focus-within:ring-primary/50">
                <div className="flex items-center justify-center pl-4 pr-2 text-muted-foreground">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  className="flex w-full border-none bg-transparent px-2 text-base font-normal text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  placeholder="Search AI creatives, ads, and templates..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <PriceRangeFilter
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMinChange={(v) => {
              setPriceMin(v);
              setCurrentPage(1);
            }}
            onPriceMaxChange={(v) => {
              setPriceMax(v);
              setCurrentPage(1);
            }}
          />

          <FilterDropdown
            label="Asset Type"
            options={assetTypes}
            value={assetType}
            onChange={(v) => {
              setAssetType(v);
              setCurrentPage(1);
            }}
          />

          <FilterDropdown
            label="License"
            options={licenseTypes}
            value={licenseType}
            onChange={(v) => {
              setLicenseType(v);
              setCurrentPage(1);
            }}
          />

          {hasActiveFilters && (
            <>
              <div className="mx-2 h-6 w-px bg-border" />
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 px-4 text-primary transition-colors hover:bg-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list_off</span>
                <p className="text-sm font-semibold">Clear Filters</p>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {listingsQuery.isLoading ? (
            "Loading..."
          ) : (
            <>
              Showing <span className="font-semibold text-foreground">{listings.length}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination.total}</span> results
            </>
          )}
        </p>
      </div>

      {/* Marketplace Grid */}
      {listingsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card">
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-6 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
            <span className="material-symbols-outlined text-4xl text-muted-foreground">search_off</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">No Results Found</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            We couldn't find any creatives matching your search criteria. Try adjusting your filters or search terms.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined">refresh</span>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <MarketplaceCard
              key={listing.id}
              listing={listing}
            />
          ))}
        </div>
      )}

      {/* Pagination Section */}
      <div className="mb-8 mt-12 flex items-center justify-center">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/market")({
  component: MarketPage
});
