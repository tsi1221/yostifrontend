
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Factory,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  ""
);

type SupplierStatus = "ACTIVE" | "INACTIVE" | "PENDING";

interface Supplier {
  id: string | number;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  factoryName?: string;
  category?: string;
  status?: SupplierStatus | string;
  createdAt?: string;
}

interface SupplierApiResponse {
  data?: Supplier[];
  items?: Supplier[];
  results?: Supplier[];
}

const getToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

const getStatusConfig = (status?: string) => {
  switch (String(status || "PENDING").toUpperCase()) {
    case "ACTIVE":
      return {
        label: "Active",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };

    case "INACTIVE":
      return {
        label: "Inactive",
        className:
          "bg-slate-100 text-slate-600 border-slate-200",
        icon: XCircle,
      };

    default:
      return {
        label: "Pending",
        className:
          "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock3,
      };
  }
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);
  const [error, setError] = useState("");

  const fetchSuppliers = useCallback(async () => {
    if (!API_BASE_URL) {
      setError("VITE_API_URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/suppliers`,
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
          `Unable to load suppliers (${response.status})`
        );
      }

      const result: Supplier[] | SupplierApiResponse =
        await response.json();

      let data: Supplier[] = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (Array.isArray(result.data)) {
        data = result.data;
      } else if (Array.isArray(result.items)) {
        data = result.items;
      } else if (Array.isArray(result.results)) {
        data = result.results;
      }

      setSuppliers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load suppliers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        [
          supplier.companyName,
          supplier.contactPerson,
          supplier.email,
          supplier.phone,
          supplier.country,
          supplier.city,
          supplier.factoryName,
          supplier.category,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const matchesStatus =
        status === "ALL" ||
        String(supplier.status || "PENDING").toUpperCase() ===
          status;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, status]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-6 pt-0 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F3952] text-white">
              <Building2 size={19} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Suppliers & Factories
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage supplier and factory information.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search suppliers..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0F3952] focus:bg-white focus:ring-2 focus:ring-[#0F3952]/10"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0F3952]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supplier
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Factory
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <LoadingRows />
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Building2
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No suppliers found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const statusConfig = getStatusConfig(
                      supplier.status
                    );

                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={supplier.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                              <Building2 size={17} />
                            </div>

                            <div>
                              <p className="font-medium text-slate-900">
                                {supplier.companyName ||
                                  "Unnamed Supplier"}
                              </p>

                              {supplier.category && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {supplier.category}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Factory
                              size={15}
                              className="text-slate-400"
                            />

                            {supplier.factoryName ||
                              "Not specified"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {supplier.contactPerson && (
                              <p className="text-sm font-medium text-slate-700">
                                {supplier.contactPerson}
                              </p>
                            )}

                            {supplier.email && (
                              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail size={13} />
                                {supplier.email}
                              </p>
                            )}

                            {supplier.phone && (
                              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone size={13} />
                                {supplier.phone}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin
                              size={15}
                              className="mt-0.5 text-slate-400"
                            />

                            <div>
                              <p>
                                {supplier.city || "Unknown"}
                              </p>

                              <p className="text-xs text-slate-400">
                                {supplier.country || "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
                          >
                            <StatusIcon size={13} />
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSupplier(supplier)
                            }
                            className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:border-[#0F3952] hover:text-[#0F3952]"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {loading ? (
              <MobileLoading />
            ) : filteredSuppliers.length === 0 ? (
              <div className="py-12 text-center">
                <Building2
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No suppliers found
                </p>
              </div>
            ) : (
              filteredSuppliers.map((supplier) => {
                const statusConfig = getStatusConfig(
                  supplier.status
                );

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={supplier.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                          <Building2 size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {supplier.companyName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {supplier.factoryName ||
                              "Factory not specified"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${statusConfig.className}`}
                      >
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      {supplier.contactPerson && (
                        <p className="text-sm text-slate-700">
                          {supplier.contactPerson}
                        </p>
                      )}

                      {supplier.email && (
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={13} />
                          {supplier.email}
                        </p>
                      )}

                      {supplier.phone && (
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={13} />
                          {supplier.phone}
                        </p>
                      )}

                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={13} />
                        {supplier.city || "Unknown"},{" "}
                        {supplier.country || "Unknown"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSupplier(supplier)
                      }
                      className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      View Supplier
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {!loading && suppliers.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {filteredSuppliers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {suppliers.length}
                </span>{" "}
                suppliers
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedSupplier && (
        <SupplierDetails
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
}

function SupplierDetails({
  supplier,
  onClose,
}: {
  supplier: Supplier;
  onClose: () => void;
}) {
  const statusConfig = getStatusConfig(supplier.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Supplier Details
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Supplier and factory information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F3952]/10 text-[#0F3952]">
              <Building2 size={25} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {supplier.companyName}
              </h3>

              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
              >
                <StatusIcon size={13} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="Contact Person"
              value={supplier.contactPerson}
              icon={Building2}
            />

            <InfoItem
              label="Factory"
              value={supplier.factoryName}
              icon={Factory}
            />

            <InfoItem
              label="Email"
              value={supplier.email}
              icon={Mail}
            />

            <InfoItem
              label="Phone"
              value={supplier.phone}
              icon={Phone}
            />

            <InfoItem
              label="City"
              value={supplier.city}
              icon={MapPin}
            />

            <InfoItem
              label="Country"
              value={supplier.country}
              icon={MapPin}
            />

            <InfoItem
              label="Category"
              value={supplier.category}
              icon={Building2}
            />

            <InfoItem
              label="Address"
              value={supplier.address}
              icon={MapPin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon: typeof Building2;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-[#0F3952]" />

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr
          key={index}
          className="border-b border-slate-100"
        >
          {Array.from({ length: 6 }).map((_, cell) => (
            <td key={cell} className="px-5 py-5">
              <div className="h-4 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function MobileLoading() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </>
  );
}

