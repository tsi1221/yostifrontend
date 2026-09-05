import { useState } from "react";

import ActionButton from "../components/ActionButton";
import DataTable from "../components/DataTable";
import {
  CheckboxRow,
  Field,
  SelectInput,
  TextInput,
} from "../components/FormField";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import { ROLE_LABEL } from "../roles";
import { useDashboard } from "../store";
import type { AccountType, UserAccount, UserRole } from "../types";

const ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "STAFF",
  "BUYER",
  "SUPPLIER",
  "LOGISTICS_PARTNER",
];

const ACCOUNT_TYPES: AccountType[] = [
  "individual",
  "business",
  "supplier",
  "logistics",
];

const emptyUser = (): UserAccount => ({
  id: `u-${Date.now()}`,
  full_name: "",
  company_name: "",
  country: "",
  phone: "",
  email: "",
  account_type: "business",
  language_preference: "en",
  role: "BUYER",
  active: true,
});

export default function UsersPage() {
  const { snapshot, actions } = useDashboard();
  const [editing, setEditing] = useState<UserAccount | null>(null);

  return (
    <div>
      <PageHeader
        title="User Account Management"
        description="CRUD for global accounts, authorization flags, and sub-roles."
        actions={
          <ActionButton tone="gold" onClick={() => setEditing(emptyUser())}>
            New account
          </ActionButton>
        }
      />

      <DataTable<UserAccount>
        rows={snapshot.users}
        rowKey={(row) => row.id}
        empty="No users in this workspace."
        columns={[
          { header: "Name", render: (row) => row.full_name },
          { header: "Company", render: (row) => row.company_name },
          { header: "Email", render: (row) => row.email },
          { header: "Country", render: (row) => row.country },
          { header: "Account", render: (row) => row.account_type },
          {
            header: "Role",
            render: (row) => (
              <SelectInput
                value={row.role}
                onChange={(event) =>
                  actions.assignUserRole(row.id, event.target.value as UserRole)
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </SelectInput>
            ),
          },
          {
            header: "Authorization",
            render: (row) => (
              <button
                type="button"
                onClick={() => actions.toggleUserActive(row.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  row.active
                    ? "bg-[#0F3952] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {row.active ? "Active" : "Disabled"}
              </button>
            ),
          },
          {
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <ActionButton tone="ghost" onClick={() => setEditing(row)}>
                  Edit
                </ActionButton>
                <ActionButton
                  tone="ghost"
                  onClick={() => actions.deleteUser(row.id)}
                >
                  Remove
                </ActionButton>
              </div>
            ),
          },
        ]}
      />

      <SideDrawer
        open={Boolean(editing)}
        title={editing && snapshot.users.some((row) => row.id === editing.id) ? "Edit account" : "Create account"}
        onClose={() => setEditing(null)}
        footer={
          editing ? (
            <ActionButton
              className="w-full"
              onClick={() => {
                actions.upsertUser(editing);
                setEditing(null);
              }}
            >
              Save account
            </ActionButton>
          ) : null
        }
      >
        {editing ? (
          <div className="space-y-4">
            <Field label="Full name">
              <TextInput
                value={editing.full_name}
                onChange={(event) =>
                  setEditing({ ...editing, full_name: event.target.value })
                }
              />
            </Field>
            <Field label="Company">
              <TextInput
                value={editing.company_name}
                onChange={(event) =>
                  setEditing({ ...editing, company_name: event.target.value })
                }
              />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                value={editing.email}
                onChange={(event) =>
                  setEditing({ ...editing, email: event.target.value })
                }
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={editing.phone}
                onChange={(event) =>
                  setEditing({ ...editing, phone: event.target.value })
                }
              />
            </Field>
            <Field label="Country">
              <TextInput
                value={editing.country}
                onChange={(event) =>
                  setEditing({ ...editing, country: event.target.value })
                }
              />
            </Field>
            <Field label="Account type">
              <SelectInput
                value={editing.account_type}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    account_type: event.target.value as AccountType,
                  })
                }
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Language">
              <SelectInput
                value={editing.language_preference}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    language_preference: event.target.value,
                  })
                }
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="zh">Chinese</option>
              </SelectInput>
            </Field>
            <Field label="Sub-role">
              <SelectInput
                value={editing.role}
                onChange={(event) =>
                  setEditing({ ...editing, role: event.target.value as UserRole })
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <CheckboxRow
              label="Authorization flag active"
              checked={editing.active}
              onChange={(value) => setEditing({ ...editing, active: value })}
            />
          </div>
        ) : null}
      </SideDrawer>
    </div>
  );
}
