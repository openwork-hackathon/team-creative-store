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


// Device options (for filtering by target device)
const deviceOptions = [
  { value: "mobile", label: "Mobile" },
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "tv", label: "TV" }
];

export function MarketPage() {
  const [assetType, setAssetType] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [device, setDevice] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [assetType, licenseType, device, priceMin, priceMax]);

  // Build query params
  const queryParams: MarketplaceQuery = useMemo(() => {
    const params: MarketplaceQuery = {
      page: currentPage,
      limit: 12
    };
    if (assetType) params.assetType = assetType;
    if (licenseType) params.licenseType = licenseType;
    if (priceMin) params.priceMin = parseFloat(priceMin);
    if (priceMax) params.priceMax = parseFloat(priceMax);
    return params;
  }, [assetType, licenseType, priceMin, priceMax, currentPage]);

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

  // Fetch purchase status for all displayed listings
  const listingIds = useMemo(() => listings.map(l => l.id), [listings]);
  const purchaseStatusQuery = useQuery({
    queryKey: ["marketplace", "purchase-status", listingIds],
    queryFn: () => api.batchCheckPurchase({ publishRecordIds: listingIds }),
    enabled: listingIds.length > 0,
    staleTime: 30000 // Cache for 30 seconds
  });

  const purchasedMap = purchaseStatusQuery.data?.purchasedMap ?? {};
  const pagination = listingsQuery.data?.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 1 };
  const assetTypes = assetTypesQuery.data?.assetTypes ?? [];
  const licenseTypes = licenseTypesQuery.data?.licenseTypes ?? [];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 lg:px-10">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-black leading-tight tracking-[-0.033em] text-foreground md:text-4xl">
          Marketplace
        </h1>
        <p className="text-base text-muted-foreground">
          Discover and purchase AI-generated creative assets from talented creators
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
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
            <MarketplaceCard
              key={listing.id}
              listing={listing}
              purchased={purchasedMap[listing.id] ?? false}
            />
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
    </div>
  );
}
