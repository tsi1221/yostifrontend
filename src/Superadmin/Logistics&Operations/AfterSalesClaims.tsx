
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  FileWarning,
  Eye,
  X,
  CalendarDays,
  Package,
  User,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  ""
);

type ClaimStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RESOLVED"
  | string;

type ClaimPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;

interface AfterSalesClaim {
  id: string | number;
  claimNumber?: string;
  title?: string;
  subject?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productName?: string;
  productId?: string | number;
  orderNumber?: string;
  supplierName?: string;
  country?: string;
  city?: string;
  status?: ClaimStatus;
  priority?: ClaimPriority;
  amount?: number;
  currency?: string;
  resolution?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ClaimsApiResponse {
  data?: AfterSalesClaim[];
  items?: AfterSalesClaim[];
  results?: AfterSalesClaim[];
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
  OPEN: {
    label: "Open",
    icon: AlertCircle,
    className: "bg-blue-50 text-blue-700",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-50 text-red-700",
  },
};

const priorityConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  LOW: {
    label: "Low",
    className: "bg-slate-100 text-slate-600",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-blue-50 text-blue-700",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-50 text-orange-700",
  },
  URGENT: {
    label: "Urgent",
    className: "bg-red-50 text-red-700",
  },
};

function AfterSalesClaims() {
  const [claims, setClaims] = useState<AfterSalesClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [selectedClaim, setSelectedClaim] =
    useState<AfterSalesClaim | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/after-sales-claims`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load after-sales claims (${response.status})`
        );
      }

      const result: ClaimsApiResponse | AfterSalesClaim[] =
        await response.json();

      if (Array.isArray(result)) {
        setClaims(result);
      } else {
        setClaims(
          result.data || result.items || result.results || []
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load after-sales claims."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const filteredClaims = useMemo(() => {
    const query = search.trim().toLowerCase();

    return claims.filter((claim) => {
      const matchesSearch =
        !query ||
        claim.claimNumber?.toLowerCase().includes(query) ||
        claim.title?.toLowerCase().includes(query) ||
        claim.subject?.toLowerCase().includes(query) ||
        claim.customerName?.toLowerCase().includes(query) ||
        claim.customerEmail?.toLowerCase().includes(query) ||
        claim.productName?.toLowerCase().includes(query) ||
        claim.orderNumber?.toLowerCase().includes(query) ||
        claim.supplierName?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        claim.status?.toUpperCase() === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        claim.priority?.toUpperCase() === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [claims, search, statusFilter, priorityFilter]);

  const getStatus = (status?: string) => {
    const normalized = status?.toUpperCase() || "OPEN";

    return (
      statusConfig[normalized] || {
        label: status || "Unknown",
        icon: Clock3,
        className: "bg-slate-100 text-slate-600",
      }
    );
  };

  const getPriority = (priority?: string) => {
    const normalized = priority?.toUpperCase() || "MEDIUM";

    return (
      priorityConfig[normalized] || {
        label: priority || "Unknown",
        className: "bg-slate-100 text-slate-600",
      }
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  };

  const formatAmount = (claim: AfterSalesClaim) => {
    if (
      claim.amount === undefined ||
      claim.amount === null
    ) {
      return "N/A";
    }

    return `${claim.currency || "ETB"} ${claim.amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-6 pt-0 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F3952] text-white">
              <FileWarning size={21} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#0F3952]">
                After Sales & Claims
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage customer claims, issues, and after-sales cases.
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
                  placeholder="Search claims..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0F3952] focus:ring-2 focus:ring-[#0F3952]/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0F3952]"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_REVIEW">
                    In Review
                  </option>
                  <option value="APPROVED">Approved</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value)
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0F3952]"
                >
                  <option value="ALL">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
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
          ) : filteredClaims.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileWarning size={26} />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No claims found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                No after-sales claim matches your current
                search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Claim
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredClaims.map((claim) => {
                      const status = getStatus(claim.status);
                      const StatusIcon = status.icon;

                      const priority = getPriority(
                        claim.priority
                      );

                      return (
                        <tr
                          key={claim.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                                <FileWarning size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium text-slate-800">
                                  {claim.claimNumber ||
                                    `Claim #${claim.id}`}
                                </p>

                                <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                                  {claim.title ||
                                    claim.subject ||
                                    "After-sales claim"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <User
                                size={15}
                                className="text-slate-400"
                              />

                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {claim.customerName ||
                                    "N/A"}
                                </p>

                                {claim.customerEmail && (
                                  <p className="text-xs text-slate-400">
                                    {claim.customerEmail}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[180px] truncate text-sm text-slate-600">
                              {claim.productName || "N/A"}
                            </p>

                            {claim.orderNumber && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                Order: {claim.orderNumber}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                            >
                              {priority.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />

                              {formatDate(claim.createdAt)}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedClaim(claim)
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
                {filteredClaims.map((claim) => {
                  const status = getStatus(claim.status);
                  const StatusIcon = status.icon;

                  const priority = getPriority(
                    claim.priority
                  );

                  return (
                    <div
                      key={claim.id}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                          <FileWarning size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-medium text-slate-800">
                                {claim.claimNumber ||
                                  `Claim #${claim.id}`}
                              </h3>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {claim.title ||
                                  claim.subject ||
                                  "After-sales claim"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                            >
                              {priority.label}
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User
                                size={15}
                                className="text-slate-400"
                              />

                              {claim.customerName || "N/A"}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Package
                                size={15}
                                className="text-slate-400"
                              />

                              {claim.productName || "N/A"}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />

                              {formatDate(claim.createdAt)}
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
                                setSelectedClaim(claim)
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

      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0F3952]">
                  Claim Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  After-sales claim information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0F3952]/10 text-[#0F3952]">
                  <FileWarning size={27} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedClaim.claimNumber ||
                      `Claim #${selectedClaim.id}`}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedClaim.title ||
                      selectedClaim.subject ||
                      "After-sales claim"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(() => {
                      const status = getStatus(
                        selectedClaim.status
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

                    {(() => {
                      const priority = getPriority(
                        selectedClaim.priority
                      );

                      return (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                        >
                          {priority.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {selectedClaim.description && (
                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedClaim.description}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Customer
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedClaim.customerName || "N/A"}
                  </p>

                  {selectedClaim.customerEmail && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedClaim.customerEmail}
                    </p>
                  )}

                  {selectedClaim.customerPhone && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedClaim.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Product
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedClaim.productName || "N/A"}
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
                    {[
                      selectedClaim.city,
                      selectedClaim.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Submitted
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatDate(selectedClaim.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Number
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedClaim.orderNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Claim Amount
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatAmount(selectedClaim)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Supplier
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedClaim.supplierName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Claim ID
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-slate-700">
                    {selectedClaim.id}
                  </p>
                </div>
              </div>

              {selectedClaim.resolution && (
                <div className="mt-6 rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Resolution
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedClaim.resolution}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
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

export default AfterSalesClaims;

