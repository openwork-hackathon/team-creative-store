import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { createApiClient, type MarketplaceQuery } from "@/lib/api";
import {
  FilterDropdown,
  PriceRangeFilter,
  MarketplaceCard,
  Pagination
} from "@/components/market";

const api = createApiClient();

export function MarketPage() {
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
