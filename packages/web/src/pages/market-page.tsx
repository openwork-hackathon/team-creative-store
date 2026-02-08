import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { createApiClient, type MarketplaceQuery } from "@/lib/api";
import {
  FilterDropdown,
  PriceRangeFilter,
  MarketplaceCard,
  Pagination
} from "@/components/market";

const api = createApiClient();

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Device options (for filtering by target device)
const deviceOptions = [
  { value: "mobile", label: "Mobile" },
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "tv", label: "TV" }
];

export function MarketPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [assetType, setAssetType] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [device, setDevice] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, assetType, licenseType, device, priceMin, priceMax]);

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
    setAssetType("");
    setLicenseType("");
    setDevice("");
    setPriceMin("");
    setPriceMax("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Main Content */}
      <main className="mx-auto max-w-[1280px] w-full px-4 py-8 lg:px-10">
        {/* Search and Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="flex h-12 w-full items-stretch rounded-xl border border-slate-200 bg-white transition-all focus-within:ring-2 focus-within:ring-primary/50 dark:border-[#2d3a54] dark:bg-[#1b2537]">
                <div className="flex items-center justify-center pl-4 pr-2 text-slate-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  className="flex w-full border-none bg-transparent px-2 text-base font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                  placeholder="Search AI creatives, ads, and templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="flex items-center justify-center px-3 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-3 pb-2">
            <PriceRangeFilter
              priceMin={priceMin}
              priceMax={priceMax}
              onPriceMinChange={setPriceMin}
              onPriceMaxChange={setPriceMax}
            />

            <FilterDropdown
              label="Asset Type"
              options={assetTypes}
              value={assetType}
              onChange={setAssetType}
            />

            <FilterDropdown
              label="Device"
              options={deviceOptions}
              value={device}
              onChange={setDevice}
            />

            <FilterDropdown
              label="License"
              options={licenseTypes}
              value={licenseType}
              onChange={setLicenseType}
            />
          </div>
        </div>

        {/* Marketplace Grid */}
        {listingsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#2d3a54] dark:bg-[#1b2537]"
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-6 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">No Results Found</h3>
            <p className="mb-6 max-w-md text-slate-500 dark:text-slate-400">
              We couldn't find any creatives matching your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <MarketplaceCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {!listingsQuery.isLoading && listings.length > 0 && (
          <div className="mb-8 mt-12 flex items-center justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
