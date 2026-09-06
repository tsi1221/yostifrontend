import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { isSuperAdminRoleRecord, isSuperAdminSession } from "../auth/superAdminAccess";
import ActionButton from "../components/ActionButton";
import GrantSuperAdminButton from "../components/GrantSuperAdminButton";
import PageHeader from "../components/PageHeader";
import SuperAdminAccessBanner from "../components/SuperAdminAccessBanner";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import EditRoleForm from "./EditRoleForm";
import { ROLE_NOT_FOUND_MESSAGE } from "./api";
import { useRoleDetail } from "./useRoleDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function RoleDetailView() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/roles`;
  const { role: record, loading, notFound, serverError, retry } = useRoleDetail(roleId);
  const editing = searchParams.get("edit") === "1";

  return (
    <div>
      <PageHeader
        title={record?.name || "Role"}
        description="Review assigned permission IDs, then sync updates without a full refresh."
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
              Back to roles
            </ActionButton>
            {record ? (
              <ActionButton onClick={() => setSearchParams({ edit: "1" })}>Edit</ActionButton>
            ) : null}
            {record && isSuperAdminRoleRecord(record) ? (
              <GrantSuperAdminButton onGranted={retry} />
            ) : null}
          </div>
        }
      />

      {loading ? <DetailSkeleton /> : null}

      {!loading && notFound ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">Role Not Found</h2>
          <p className="mt-2 text-sm text-red-700">{ROLE_NOT_FOUND_MESSAGE}</p>
          <div className="mt-4">
            <ActionButton onClick={() => navigate(listPath)}>Back to roles</ActionButton>
          </div>
        </div>
      ) : null}

      {!loading && serverError && !notFound ? (
        isSuperAdminSession() ? (
          <SuperAdminAccessBanner message={serverError} onRetry={retry} />
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-amber-900">{serverError}</p>
            <ActionButton onClick={retry}>Retry</ActionButton>
          </div>
        )
      ) : null}

      {!loading && record ? (
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Role #{record.id}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F3952]">{record.name}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {record.description || "No description provided."}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Permission IDs
            </h3>
            {record.permissionIds.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No permissions assigned.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {record.permissionIds.map((id) => {
                  const permission = record.permissions.find((item) => item.id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-[#0F3952]/5 px-3 py-1 text-xs font-medium text-[#0F3952]"
                    >
                      {permission?.name || `Permission #${id}`}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </article>
      ) : null}

      <SideDrawer
        open={Boolean(record) && editing}
        title={record ? `Edit role #${record.id}` : "Edit role"}
        description="Update the name, description, and assigned permission IDs."
        onClose={() => setSearchParams({})}
      >
        {record ? (
          <EditRoleForm
            role={record}
            onCancel={() => setSearchParams({})}
            onSaved={() => setSearchParams({})}
          />
        ) : null}
      </SideDrawer>
    </div>
  );
}
