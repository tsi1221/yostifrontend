
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Tag,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  Building2,
  CircleUserRound,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://yosti.nedhigibe.com/api"
).replace(/\/+$/, "");

type User = {
  id: string | number;
  fullname?: string;
  fullName?: string;
  name?: string;
  email?: string;
  companyName?: string;
  country?: string;
  phoneWhatsapp?: string;
  phone?: string;
  role?: string;
  roleId?: number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
};

type UsersResponse = {
  data?:
    | User[]
    | {
        data?: User[];
        items?: User[];
        users?: User[];
        results?: User[];
        total?: number;
      };
  users?: User[];
  items?: User[];
  results?: User[];
  total?: number;
};

const getToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("accessToken") ||
  sessionStorage.getItem("access_token") ||
  sessionStorage.getItem("token") ||
  "";

const getUserName = (user: User) =>
  user.fullname ||
  user.fullName ||
  user.name ||
  "Unnamed User";

const getInitials = (user: User) => {
  const name = getUserName(user).trim();

  if (!name) {
    return "U";
  }

  const parts = name.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const normalizeRole = (role?: string) => {
  if (!role) {
    return "Unknown";
  }

  switch (role.toUpperCase()) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "STAFF":
      return "Staff";
    case "BUYER":
      return "Buyer";
    case "SUPPLIER":
      return "Supplier";
    case "LOGISTICS_PARTNER":
      return "Logistics Partner";
    default:
      return role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

const getRoleClass = (role?: string) => {
  switch (role?.toUpperCase()) {
    case "SUPER_ADMIN":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "STAFF":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "BUYER":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "SUPPLIER":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "LOGISTICS_PARTNER":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const getStatus = (user: User) => {
  if (user.status) {
    return user.status;
  }

  if (typeof user.isActive === "boolean") {
    return user.isActive ? "ACTIVE" : "INACTIVE";
  }

  return "ACTIVE";
};

const getStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "SUSPENDED":
      return "border-red-200 bg-red-50 text-red-700";
    case "INACTIVE":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const formatDate = (date?: string) => {
  if (!date) {
    return "N/A";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const extractUsers = (response: UsersResponse) => {
  if (Array.isArray(response.data)) {
    return {
      users: response.data,
      total: response.total ?? response.data.length,
    };
  }

  if (response.data && typeof response.data === "object") {
    const users =
      response.data.data ||
      response.data.items ||
      response.data.users ||
      response.data.results ||
      [];

    return {
      users,
      total:
        response.data.total ??
        response.total ??
        users.length,
    };
  }

  const users =
    response.users ||
    response.items ||
    response.results ||
    [];

  return {
    users,
    total: response.total ?? users.length,
  };
};

function UsersManagment() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const token = getToken();

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (roleFilter !== "ALL") {
        params.set("role", roleFilter);
      }

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `${API_BASE_URL}/users?${params.toString()}`,
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

      let data: UsersResponse | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load users. Server returned ${response.status}.`
        );
      }

      const result = extractUsers(data || {});

      setUsers(result.users);
      setTotal(result.total);
    } catch (error) {
      console.error("Users error:", error);

      message.error(
        error instanceof Error
          ? error.message
          : "Unable to load users."
      );

      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    roleFilter,
    statusFilter,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const statistics = useMemo(() => {
    const active = users.filter(
      (user) =>
        getStatus(user).toUpperCase() === "ACTIVE"
    ).length;

    const buyers = users.filter(
      (user) =>
        user.role?.toUpperCase() === "BUYER"
    ).length;

    const suppliers = users.filter(
      (user) =>
        user.role?.toUpperCase() === "SUPPLIER"
    ).length;

    return {
      active,
      buyers,
      suppliers,
    };
  }, [users]);

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL";

  const openDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleStatusChange = (user: User) => {
    const status = getStatus(user).toUpperCase();

    message.info(
      status === "ACTIVE"
        ? "Deactivate API needs to be connected to the Users endpoint."
        : "Activate API needs to be connected to the Users endpoint."
    );
  };

  const handleDelete = () => {
    if (!deleteUser) {
      return;
    }

    message.info(
      "Delete API needs to be connected to the Users endpoint."
    );

    setDeleteUser(null);
  };

  const getUserMenu = (
    user: User
  ): MenuProps["items"] => {
    const status = getStatus(user).toUpperCase();

    return [
      {
        key: "view",
        icon: <Eye size={15} />,
        label: "View details",
        onClick: () => openDetails(user),
      },
      {
        key: "status",
        icon:
          status === "ACTIVE" ? (
            <UserX size={15} />
          ) : (
            <UserCheck size={15} />
          ),
        label:
          status === "ACTIVE"
            ? "Deactivate"
            : "Activate",
        onClick: () => handleStatusChange(user),
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        danger: true,
        icon: <X size={15} />,
        label: "Delete user",
        onClick: () => setDeleteUser(user),
      },
    ];
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-5 pt-0 sm:px-5">
      <div className="mx-auto max-w-[1600px]">

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#0F3952]">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage users, roles, accounts, and access.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total Users
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F3952]">
                  {total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Active
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {statistics.active}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Buyers
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F3952]">
                  {statistics.buyers}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#0F3952]">
                <CircleUserRound size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Suppliers
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {statistics.suppliers}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Building2 size={20} />
              </div>
            </div>
          </div>

        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="w-full lg:max-w-md">
                <Input
                  allowClear
                  size="large"
                  placeholder="Search users..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  prefix={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-400"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  }
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                <Select
                  size="large"
                  value={roleFilter}
                  onChange={(value) => {
                    setRoleFilter(value);
                    setPage(1);
                  }}
                  className="min-w-[160px]"
                  options={[
                    {
                      value: "ALL",
                      label: "All roles",
                    },
                    {
                      value: "SUPER_ADMIN",
                      label: "Super Admin",
                    },
                    {
                      value: "STAFF",
                      label: "Staff",
                    },
                    {
                      value: "BUYER",
                      label: "Buyer",
                    },
                    {
                      value: "SUPPLIER",
                      label: "Supplier",
                    },
                    {
                      value: "LOGISTICS_PARTNER",
                      label: "Logistics Partner",
                    },
                  ]}
                />

                <Select
                  size="large"
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  className="min-w-[150px]"
                  options={[
                    {
                      value: "ALL",
                      label: "All statuses",
                    },
                    {
                      value: "ACTIVE",
                      label: "Active",
                    },
                    {
                      value: "INACTIVE",
                      label: "Inactive",
                    },
                    {
                      value: "PENDING",
                      label: "Pending",
                    },
                    {
                      value: "SUSPENDED",
                      label: "Suspended",
                    },
                  ]}
                />

                {hasFilters && (
                  <Button
                    size="large"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                )}

              </div>
            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Country
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100"
                    >
                      {Array.from({ length: 7 }).map(
                        (_, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-5 py-4"
                          >
                            <Skeleton
                              active
                              title={false}
                              paragraph={{ rows: 1 }}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14"
                    >
                      <Empty description="No users found" />
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const status = getStatus(user);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <Avatar
                              size={42}
                              className="bg-[#0F3952] text-sm font-semibold"
                            >
                              {getInitials(user)}
                            </Avatar>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-800">
                                {getUserName(user)}
                              </p>

                              <p className="truncate text-sm text-slate-500">
                                {user.email || "No email"}
                              </p>
                            </div>

                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Building2
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-700">
                              {user.companyName || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <Tag
                            className={`rounded-md px-2 py-1 text-xs font-medium ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {normalizeRole(user.role)}
                          </Tag>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">
                            {user.country || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <Tag
                            className={`rounded-md px-2 py-1 text-xs font-medium ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </Tag>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Dropdown
                            menu={{
                              items: getUserMenu(user),
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <Button
                              type="text"
                              icon={
                                <MoreHorizontal size={18} />
                              }
                            />
                          </Dropdown>
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>

          {!loading && users.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {total}
                </span>{" "}
                users
              </p>

              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[10, 20, 50, 100]}
                onChange={(nextPage, nextPageSize) => {
                  setPage(nextPage);

                  if (nextPageSize !== pageSize) {
                    setPageSize(nextPageSize);
                    setPage(1);
                  }
                }}
              />

            </div>
          )}

        </div>
      </div>

      <Drawer
        title="User Details"
        placement="right"
        width={440}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedUser(null);
        }}
      >
        {selectedUser && (
          <div className="space-y-6">

            <div className="flex flex-col items-center border-b border-slate-200 pb-6 text-center">

              <Avatar
                size={80}
                className="mb-3 bg-[#0F3952] text-2xl font-semibold"
              >
                {getInitials(selectedUser)}
              </Avatar>

              <h2 className="text-xl font-bold text-slate-800">
                {getUserName(selectedUser)}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedUser.email || "No email"}
              </p>

              <div className="mt-3 flex gap-2">

                <Tag
                  className={`rounded-md px-2 py-1 text-xs font-medium ${getRoleClass(
                    selectedUser.role
                  )}`}
                >
                  {normalizeRole(selectedUser.role)}
                </Tag>

                <Tag
                  className={`rounded-md px-2 py-1 text-xs font-medium ${getStatusClass(
                    getStatus(selectedUser)
                  )}`}
                >
                  {getStatus(selectedUser)}
                </Tag>

              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Account Information
              </h3>

              <div className="space-y-3">

                <div className="flex items-start gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Email
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {selectedUser.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Phone / WhatsApp
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {selectedUser.phoneWhatsapp ||
                        selectedUser.phone ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2
                    size={18}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Company
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {selectedUser.companyName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 text-slate-400"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Role
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {normalizeRole(selectedUser.role)}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Additional Information
              </h3>

              <div className="rounded-lg bg-slate-50 p-4">

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      Country
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedUser.country || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Role ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedUser.roleId ?? "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      User ID
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-700">
                      {selectedUser.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Joined
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}
      </Drawer>

      <Modal
        title="Delete User"
        open={Boolean(deleteUser)}
        onCancel={() => setDeleteUser(null)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{
          danger: true,
        }}
      >
        <p className="text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {deleteUser
              ? getUserName(deleteUser)
              : ""}
          </span>
          ?
        </p>

        <p className="mt-2 text-sm text-slate-500">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default UsersManagment;
