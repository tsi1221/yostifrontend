
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Eye,
  X,
  MapPin,
  Tag,
  Globe2,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  ""
);

type CatalogType = "EXPORT" | "IMPORT";
type CatalogStatus = "ACTIVE" | "PENDING" | "INACTIVE";

interface Catalog {
  id: string | number;
  name: string;
  productName?: string;
  description?: string;
  category?: string;
  type?: CatalogType | string;
  country?: string;
  city?: string;
  price?: number;
  currency?: string;
  quantity?: number;
  unit?: string;
  status?: CatalogStatus | string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CatalogApiResponse {
  data?: Catalog[];
  items?: Catalog[];
  results?: Catalog[];
}

const getToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

const statusConfig: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  ACTIVE: {
    label: "Active",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700",
  },
  INACTIVE: {
    label: "Inactive",
    icon: XCircle,
    className: "bg-slate-100 text-slate-600",
  },
};

export default function Catalogs() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(
    null
  );

  const fetchCatalogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/catalogs`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load catalogs (${response.status})`
        );
      }

      const result: CatalogApiResponse | Catalog[] =
        await response.json();

      if (Array.isArray(result)) {
        setCatalogs(result);
      } else {
        setCatalogs(
          result.data || result.items || result.results || []
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load catalogs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const filteredCatalogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return catalogs.filter((catalog) => {
      const matchesSearch =
        !query ||
        catalog.name?.toLowerCase().includes(query) ||
        catalog.productName?.toLowerCase().includes(query) ||
        catalog.category?.toLowerCase().includes(query) ||
        catalog.country?.toLowerCase().includes(query) ||
        catalog.city?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        catalog.type?.toUpperCase() === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        catalog.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [catalogs, search, typeFilter, statusFilter]);

  const formatPrice = (catalog: Catalog) => {
    if (catalog.price === undefined || catalog.price === null) {
      return "N/A";
    }

    return `${catalog.currency || "ETB"} ${catalog.price.toLocaleString()}`;
  };

  const getStatus = (status?: string) => {
    const normalized = status?.toUpperCase() || "ACTIVE";

    return (
      statusConfig[normalized] || {
        label: status || "Unknown",
        icon: Clock3,
        className: "bg-slate-100 text-slate-600",
      }
    );
  };

  const getTypeClass = (type?: string) => {
    if (type?.toUpperCase() === "EXPORT") {
      return "bg-blue-50 text-blue-700";
    }

    if (type?.toUpperCase() === "IMPORT") {
      return "bg-violet-50 text-violet-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-6 pt-0 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F3952] text-white">
              <Package size={21} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#0F3952]">
                Export & Import Catalogs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage product export and import catalogs.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search catalogs..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0F3952] focus:ring-2 focus:ring-[#0F3952]/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0F3952]"
                >
                  <option value="ALL">All Types</option>
                  <option value="EXPORT">Export</option>
                  <option value="IMPORT">Import</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0F3952]"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="animate-pulse px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-200" />

                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-slate-200" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>

                    <div className="hidden h-4 w-20 rounded bg-slate-100 sm:block" />
                    <div className="hidden h-4 w-24 rounded bg-slate-100 md:block" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Package size={26} />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No catalogs found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                No catalog matches your current search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Location
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Price
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredCatalogs.map((catalog) => {
                      const status = getStatus(catalog.status);
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={catalog.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                                <Package size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-800">
                                  {catalog.productName ||
                                    catalog.name}
                                </p>

                                {catalog.description && (
                                  <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                                    {catalog.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {catalog.category || "N/A"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getTypeClass(
                                catalog.type
                              )}`}
                            >
                              {catalog.type || "N/A"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <MapPin
                                size={15}
                                className="text-slate-400"
                              />

                              <span>
                                {[catalog.city, catalog.country]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-700">
                            {formatPrice(catalog)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCatalog(catalog)
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#0F3952] hover:text-[#0F3952]"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredCatalogs.map((catalog) => {
                  const status = getStatus(catalog.status);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={catalog.id}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                          <Package size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-medium text-slate-800">
                                {catalog.productName ||
                                  catalog.name}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {catalog.category || "Uncategorized"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getTypeClass(
                                catalog.type
                              )}`}
                            >
                              {catalog.type || "N/A"}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-slate-400">
                                Location
                              </p>

                              <p className="mt-1 text-slate-600">
                                {[catalog.city, catalog.country]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-400">
                                Price
                              </p>

                              <p className="mt-1 font-medium text-slate-700">
                                {formatPrice(catalog)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCatalog(catalog)
                              }
                              className="inline-flex items-center gap-2 text-sm font-medium text-[#0F3952]"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0F3952]">
                  Catalog Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Product catalog information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCatalog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0F3952]/10 text-[#0F3952]">
                  <Package size={27} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedCatalog.productName ||
                      selectedCatalog.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTypeClass(
                        selectedCatalog.type
                      )}`}
                    >
                      {selectedCatalog.type || "N/A"}
                    </span>

                    {(() => {
                      const status = getStatus(
                        selectedCatalog.status
                      );
                      const StatusIcon = status.icon;

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {selectedCatalog.description && (
                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedCatalog.description}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag size={16} />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Category
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedCatalog.category || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe2 size={16} />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Type
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedCatalog.type || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Location
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {[selectedCatalog.city, selectedCatalog.country]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag size={16} />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Price
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatPrice(selectedCatalog)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Quantity
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedCatalog.quantity !== undefined
                      ? `${selectedCatalog.quantity.toLocaleString()} ${
                          selectedCatalog.unit || ""
                        }`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Catalog ID
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-slate-700">
                    {selectedCatalog.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedCatalog(null)}
                className="rounded-lg bg-[#0F3952] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0b2e42]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
