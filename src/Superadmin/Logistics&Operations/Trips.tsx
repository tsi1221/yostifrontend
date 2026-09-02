
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  Eye,
  X,
  Loader2,
} from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const getToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

type Trip = {
  id?: string | number;
  _id?: string;
  title?: string;
  name?: string;
  status?: string;
  origin?: string;
  destination?: string;
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  departureDate?: string;
  arrivalDate?: string;
  driver?: string;
  vehicle?: string;
  description?: string;
  [key: string]: unknown;
};

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/trips`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load trips (${response.status})`);
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : data?.data || data?.items || data?.trips || [];

      setTrips(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return trips;

    return trips.filter((trip) =>
      Object.values(trip).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [trips, search]);

  const getId = (trip: Trip) => trip.id ?? trip._id ?? "-";

  const getRoute = (trip: Trip) => {
    const origin = trip.origin ?? trip.from ?? "";
    const destination = trip.destination ?? trip.to ?? "";

    if (!origin && !destination) return "-";

    return `${origin || "-"} → ${destination || "-"}`;
  };

  const getDate = (trip: Trip) =>
    trip.startDate ??
    trip.departureDate ??
    trip.endDate ??
    trip.arrivalDate ??
    "";

  const formatDate = (value: unknown) => {
    if (!value) return "-";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString();
  };

  const getStatusClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700";
      case "in_progress":
      case "in-progress":
      case "ongoing":
        return "bg-blue-50 text-blue-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="pt-0">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-[#0F3952]">
          Trips
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage registered trips.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0F3952] focus:ring-1 focus:ring-[#0F3952]"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2
              size={24}
              className="animate-spin text-[#0F3952]"
            />
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-gray-500">
            No trips found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trip
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Route
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTrips.map((trip) => {
                  const status = trip.status || "Unknown";

                  return (
                    <tr
                      key={String(getId(trip))}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {trip.title || trip.name || `Trip #${getId(trip)}`}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          ID: {getId(trip)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-gray-400" />
                          {getRoute(trip)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays
                            size={16}
                            className="text-gray-400"
                          />
                          {formatDate(getDate(trip))}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            trip.status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTrip(trip)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#0F3952] transition hover:bg-gray-100"
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
        )}
      </div>

      {/* Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#0F3952]">
                  Trip Details
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  ID: {getId(selectedTrip)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <div className="space-y-3">
                {Object.entries(selectedTrip).map(([key, value]) => {
                  if (
                    value === null ||
                    value === undefined ||
                    typeof value === "object"
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3"
                    >
                      <span className="text-sm font-medium capitalize text-gray-500">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>

                      <span className="max-w-[60%] break-words text-right text-sm text-gray-800">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
