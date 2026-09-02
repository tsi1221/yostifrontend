
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ClipboardCheck,
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

type InspectionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED"
  | "COMPLETED"
  | string;

type InspectionPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT"
  | string;

interface InspectionRequest {
  id: string | number;
  requestNumber?: string;
  inspectionNumber?: string;
  title?: string;
  subject?: string;
  description?: string;

  productName?: string;
  productId?: string | number;
  orderNumber?: string;

  supplierName?: string;
  customerName?: string;
  customerEmail?: string;

  inspectorName?: string;
  inspectorEmail?: string;

  country?: string;
  city?: string;
  location?: string;

  status?: InspectionStatus;
  priority?: InspectionPriority;

  inspectionDate?: string;
  scheduledDate?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  result?: string;
  remarks?: string;
}

interface InspectionApiResponse {
  data?: InspectionRequest[];
  items?: InspectionRequest[];
  results?: InspectionRequest[];
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
  PENDING: {
    label: "Pending",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700",
  },

  IN_PROGRESS: {
    label: "In Progress",
    icon: AlertCircle,
    className: "bg-blue-50 text-blue-700",
  },

  PASSED: {
    label: "Passed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },

  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },

  FAILED: {
    label: "Failed",
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

function QualityControl() {
  const [inspections, setInspections] = useState<
    InspectionRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [selectedInspection, setSelectedInspection] =
    useState<InspectionRequest | null>(null);

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/inspection-requests`,
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
          `Failed to load inspection requests (${response.status})`
        );
      }

      const result:
        | InspectionApiResponse
        | InspectionRequest[] = await response.json();

      if (Array.isArray(result)) {
        setInspections(result);
      } else {
        setInspections(
          result.data ||
            result.items ||
            result.results ||
            []
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load quality control records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const filteredInspections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const matchesSearch =
        !query ||
        inspection.requestNumber
          ?.toLowerCase()
          .includes(query) ||
        inspection.inspectionNumber
          ?.toLowerCase()
          .includes(query) ||
        inspection.title
          ?.toLowerCase()
          .includes(query) ||
        inspection.subject
          ?.toLowerCase()
          .includes(query) ||
        inspection.productName
          ?.toLowerCase()
          .includes(query) ||
        inspection.orderNumber
          ?.toLowerCase()
          .includes(query) ||
        inspection.supplierName
          ?.toLowerCase()
          .includes(query) ||
        inspection.customerName
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        inspection.status?.toUpperCase() ===
          statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        inspection.priority?.toUpperCase() ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    inspections,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const getStatus = (status?: string) => {
    const normalized = status?.toUpperCase() || "PENDING";

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
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-6 pt-0 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F3952] text-white">
              <ClipboardCheck size={21} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#0F3952]">
                Quality Control
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage product inspections and quality control
                requests.
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
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search inspections..."
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
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="PASSED">Passed</option>
                  <option value="COMPLETED">
                    Completed
                  </option>
                  <option value="FAILED">Failed</option>
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
          ) : filteredInspections.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ClipboardCheck size={26} />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No inspections found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                No quality control request matches your
                current search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Inspection
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Supplier
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
                    {filteredInspections.map(
                      (inspection) => {
                        const status = getStatus(
                          inspection.status
                        );

                        const StatusIcon = status.icon;

                        const priority = getPriority(
                          inspection.priority
                        );

                        return (
                          <tr
                            key={inspection.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                                  <ClipboardCheck
                                    size={19}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium text-slate-800">
                                    {inspection.requestNumber ||
                                      inspection.inspectionNumber ||
                                      `Inspection #${inspection.id}`}
                                  </p>

                                  <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                                    {inspection.title ||
                                      inspection.subject ||
                                      "Quality inspection"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[180px] truncate text-sm text-slate-600">
                                {inspection.productName ||
                                  "N/A"}
                              </p>

                              {inspection.orderNumber && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Order:{" "}
                                  {inspection.orderNumber}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {inspection.supplierName ||
                                "N/A"}
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

                                {formatDate(
                                  inspection.inspectionDate ||
                                    inspection.scheduledDate ||
                                    inspection.createdAt
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedInspection(
                                    inspection
                                  )
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-[#0F3952] hover:text-[#0F3952]"
                              >
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredInspections.map(
                  (inspection) => {
                    const status = getStatus(
                      inspection.status
                    );

                    const StatusIcon = status.icon;

                    const priority = getPriority(
                      inspection.priority
                    );

                    return (
                      <div
                        key={inspection.id}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                            <ClipboardCheck size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate font-medium text-slate-800">
                                  {inspection.requestNumber ||
                                    inspection.inspectionNumber ||
                                    `Inspection #${inspection.id}`}
                                </h3>

                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {inspection.title ||
                                    inspection.subject ||
                                    "Quality inspection"}
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
                                <Package
                                  size={15}
                                  className="text-slate-400"
                                />

                                {inspection.productName ||
                                  "N/A"}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User
                                  size={15}
                                  className="text-slate-400"
                                />

                                {inspection.supplierName ||
                                  "N/A"}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarDays
                                  size={15}
                                  className="text-slate-400"
                                />

                                {formatDate(
                                  inspection.inspectionDate ||
                                    inspection.scheduledDate ||
                                    inspection.createdAt
                                )}
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
                                  setSelectedInspection(
                                    inspection
                                  )
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
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0F3952]">
                  Inspection Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quality control request information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedInspection(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0F3952]/10 text-[#0F3952]">
                  <ClipboardCheck size={27} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedInspection.requestNumber ||
                      selectedInspection.inspectionNumber ||
                      `Inspection #${selectedInspection.id}`}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedInspection.title ||
                      selectedInspection.subject ||
                      "Quality inspection"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(() => {
                      const status = getStatus(
                        selectedInspection.status
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
                        selectedInspection.priority
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

              {selectedInspection.description && (
                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedInspection.description}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Product
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedInspection.productName ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Supplier
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedInspection.supplierName ||
                      "N/A"}
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
                    {selectedInspection.location ||
                      [
                        selectedInspection.city,
                        selectedInspection.country,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Inspection Date
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatDate(
                      selectedInspection.inspectionDate ||
                        selectedInspection.scheduledDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Number
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedInspection.orderNumber ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Inspector
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedInspection.inspectorName ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Result
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedInspection.result || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Inspection ID
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-slate-700">
                    {selectedInspection.id}
                  </p>
                </div>
              </div>

              {selectedInspection.remarks && (
                <div className="mt-6 rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Remarks
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedInspection.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedInspection(null)
                }
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

export default QualityControl;
