
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Eye,
  X,
  MapPin,
  CalendarDays,
  Truck,
  User,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  Hash,
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  ""
);

type ShipmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "DELAYED"
  | string;

interface Shipment {
  id: string | number;

  shipmentNumber?: string;
  trackingNumber?: string;

  title?: string;
  description?: string;

  status?: ShipmentStatus;

  cargoName?: string;
  productName?: string;
  productId?: string | number;

  quantity?: number;
  weight?: number;
  weightUnit?: string;

  origin?: string;
  destination?: string;

  originCountry?: string;
  destinationCountry?: string;

  originCity?: string;
  destinationCity?: string;

  supplierName?: string;
  customerName?: string;

  carrier?: string;
  vehicleNumber?: string;

  driverName?: string;
  driverPhone?: string;

  estimatedDelivery?: string;
  expectedDelivery?: string;
  deliveryDate?: string;

  shippedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  notes?: string;
}

interface ShipmentApiResponse {
  data?: Shipment[];
  items?: Shipment[];
  results?: Shipment[];
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

  PROCESSING: {
    label: "Processing",
    icon: AlertCircle,
    className: "bg-blue-50 text-blue-700",
  },

  IN_TRANSIT: {
    label: "In Transit",
    icon: Truck,
    className: "bg-blue-50 text-blue-700",
  },

  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700",
  },

  DELAYED: {
    label: "Delayed",
    icon: AlertCircle,
    className: "bg-orange-50 text-orange-700",
  },
};

function CargoandTracking() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedShipment, setSelectedShipment] =
    useState<Shipment | null>(null);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/shipments`, {
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
          `Failed to load shipments (${response.status})`
        );
      }

      const result: ShipmentApiResponse | Shipment[] =
        await response.json();

      if (Array.isArray(result)) {
        setShipments(result);
      } else {
        setShipments(
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
          : "Unable to load shipments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const matchesSearch =
        !query ||
        shipment.shipmentNumber
          ?.toLowerCase()
          .includes(query) ||
        shipment.trackingNumber
          ?.toLowerCase()
          .includes(query) ||
        shipment.title
          ?.toLowerCase()
          .includes(query) ||
        shipment.cargoName
          ?.toLowerCase()
          .includes(query) ||
        shipment.productName
          ?.toLowerCase()
          .includes(query) ||
        shipment.origin
          ?.toLowerCase()
          .includes(query) ||
        shipment.destination
          ?.toLowerCase()
          .includes(query) ||
        shipment.originCity
          ?.toLowerCase()
          .includes(query) ||
        shipment.destinationCity
          ?.toLowerCase()
          .includes(query) ||
        shipment.originCountry
          ?.toLowerCase()
          .includes(query) ||
        shipment.destinationCountry
          ?.toLowerCase()
          .includes(query) ||
        shipment.supplierName
          ?.toLowerCase()
          .includes(query) ||
        shipment.customerName
          ?.toLowerCase()
          .includes(query) ||
        shipment.carrier
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        shipment.status?.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

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

  const getLocation = (
    city?: string,
    country?: string,
    fallback?: string
  ) => {
    const location = [city, country]
      .filter(Boolean)
      .join(", ");

    return location || fallback || "N/A";
  };

  const getCargoName = (shipment: Shipment) =>
    shipment.cargoName ||
    shipment.productName ||
    shipment.title ||
    "Unnamed Cargo";

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-6 pt-0 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="border-b border-slate-200 bg-white px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F3952] text-white">
              <Truck size={21} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#0F3952]">
                Cargo & Tracking
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor shipments, cargo movement, and delivery
                status.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
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
                  placeholder="Search shipments..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0F3952] focus:ring-2 focus:ring-[#0F3952]/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#0F3952] sm:w-auto"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">
                  Processing
                </option>
                <option value="IN_TRANSIT">
                  In Transit
                </option>
                <option value="DELIVERED">Delivered</option>
                <option value="DELAYED">Delayed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
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
                      <div className="h-3 w-36 rounded bg-slate-100" />
                    </div>

                    <div className="hidden h-4 w-24 rounded bg-slate-100 md:block" />
                    <div className="hidden h-4 w-20 rounded bg-slate-100 lg:block" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Truck size={26} />
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                No shipments found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                No shipment matches your current search or
                status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Shipment
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cargo
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Route
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Carrier
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Delivery
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredShipments.map((shipment) => {
                      const status = getStatus(
                        shipment.status
                      );

                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={shipment.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                                <Package size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium text-slate-800">
                                  {shipment.shipmentNumber ||
                                    `Shipment #${shipment.id}`}
                                </p>

                                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                  <Hash size={12} />

                                  {shipment.trackingNumber ||
                                    "No tracking number"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                              {getCargoName(shipment)}
                            </p>

                            {shipment.quantity !==
                              undefined && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                Quantity:{" "}
                                {shipment.quantity.toLocaleString()}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-[230px]">
                              <p className="truncate text-sm text-slate-700">
                                {getLocation(
                                  shipment.originCity,
                                  shipment.originCountry,
                                  shipment.origin
                                )}
                              </p>

                              <div className="my-1 h-px w-8 bg-slate-200" />

                              <p className="truncate text-sm text-slate-500">
                                {getLocation(
                                  shipment.destinationCity,
                                  shipment.destinationCountry,
                                  shipment.destination
                                )}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm text-slate-600">
                              {shipment.carrier || "N/A"}
                            </p>

                            {shipment.vehicleNumber && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {shipment.vehicleNumber}
                              </p>
                            )}
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
                                shipment.estimatedDelivery ||
                                  shipment.expectedDelivery ||
                                  shipment.deliveryDate
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedShipment(
                                  shipment
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
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredShipments.map((shipment) => {
                  const status = getStatus(
                    shipment.status
                  );

                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={shipment.id}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/10 text-[#0F3952]">
                          <Truck size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-medium text-slate-800">
                                {shipment.shipmentNumber ||
                                  `Shipment #${shipment.id}`}
                              </h3>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                <Hash size={12} />

                                {shipment.trackingNumber ||
                                  "No tracking number"}
                              </div>
                            </div>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                            >
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Package
                                size={15}
                                className="text-slate-400"
                              />

                              {getCargoName(shipment)}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin
                                size={15}
                                className="text-slate-400"
                              />

                              <span className="truncate">
                                {getLocation(
                                  shipment.originCity,
                                  shipment.originCountry,
                                  shipment.origin
                                )}
                                {" → "}
                                {getLocation(
                                  shipment.destinationCity,
                                  shipment.destinationCountry,
                                  shipment.destination
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />

                              {formatDate(
                                shipment.estimatedDelivery ||
                                  shipment.expectedDelivery ||
                                  shipment.deliveryDate
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedShipment(
                                  shipment
                                )
                              }
                              className="inline-flex items-center gap-2 text-sm font-medium text-[#0F3952]"
                            >
                              <Eye size={16} />
                              View Details
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

      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0F3952]">
                  Shipment Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cargo and tracking information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedShipment(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0F3952]/10 text-[#0F3952]">
                  <Truck size={27} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selectedShipment.shipmentNumber ||
                      `Shipment #${selectedShipment.id}`}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {selectedShipment.trackingNumber && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Hash size={12} />

                        {selectedShipment.trackingNumber}
                      </span>
                    )}

                    {(() => {
                      const status = getStatus(
                        selectedShipment.status
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

              {selectedShipment.description && (
                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedShipment.description}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Cargo
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {getCargoName(selectedShipment)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Hash size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Tracking Number
                    </span>
                  </div>

                  <p className="mt-2 break-all text-sm font-medium text-slate-700">
                    {selectedShipment.trackingNumber ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Origin
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {getLocation(
                      selectedShipment.originCity,
                      selectedShipment.originCountry,
                      selectedShipment.origin
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Destination
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {getLocation(
                      selectedShipment.destinationCity,
                      selectedShipment.destinationCountry,
                      selectedShipment.destination
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Truck size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Carrier
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedShipment.carrier || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Truck size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Vehicle
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedShipment.vehicleNumber ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Driver
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedShipment.driverName || "N/A"}
                  </p>

                  {selectedShipment.driverPhone && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedShipment.driverPhone}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Customer
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedShipment.customerName ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Quantity
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedShipment.quantity !==
                    undefined
                      ? selectedShipment.quantity.toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Weight
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedShipment.weight !==
                    undefined
                      ? `${selectedShipment.weight.toLocaleString()} ${
                          selectedShipment.weightUnit ||
                          ""
                        }`
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Shipped
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatDate(
                      selectedShipment.shippedAt
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={16} />

                    <span className="text-xs font-medium uppercase tracking-wide">
                      Expected Delivery
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatDate(
                      selectedShipment.estimatedDelivery ||
                        selectedShipment.expectedDelivery ||
                        selectedShipment.deliveryDate
                    )}
                  </p>
                </div>
              </div>

              {selectedShipment.notes && (
                <div className="mt-6 rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedShipment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedShipment(null)
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

export default CargoandTracking;
