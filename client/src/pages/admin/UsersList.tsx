import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getUsersRequest, updateUserRequest, deleteUserRequest } from "../../api/usersApi";
import { ApiError } from "../../api/client";
import { SkeletonRow } from "../../components/Skeleton";
import type { User, UserRole } from "../../types/auth";

const PAGE_SIZE = 8;

const roleBadgeColor: Record<User["role"], string> = {
  admin: "bg-coral/20 text-coral",
  teacher: "bg-sky-teal/20 text-sky-teal",
  student: "bg-marigold/20 text-ink",
  parent: "bg-leaf/20 text-leaf",
};

const roleFilterOptions: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
];

type SortKey = "fullName" | "email" | "role";

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; direction: "asc" | "desc" };
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort.key === sortKey;
  return (
    <th className="px-6 py-3">
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 font-body text-sm font-semibold text-ink/60 hover:text-ink"
      >
        {label}
        <span className="text-xs">{isActive ? (currentSort.direction === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
}

interface UserRowProps {
  user: User;
  token: string;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onUpdated: (user: User) => void;
  onDeleted: (id: number) => void;
}

function UserRow({ user, token, isSelected, onToggleSelect, onUpdated, onDeleted }: UserRowProps) {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = password
        ? { fullName, email, password }
        : { fullName, email };
      const { user: updated } = await updateUserRequest(user.id, payload, token);
      onUpdated(updated);
      setIsEditing(false);
      setPassword("");
      showToast(`${updated.fullName} was updated.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete ${user.fullName}? This can't be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteUserRequest(user.id, token);
      onDeleted(user.id);
      showToast(`${user.fullName} was deleted.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <tr className="border-t border-ink/5 bg-sun-cream/50">
        <td className="px-6 py-3" colSpan={5}>
          <div className="grid gap-3 md:grid-cols-4 md:items-end">
            <div>
              <label className="font-body text-xs font-semibold text-ink/60">Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-ink/60">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-ink/60">
                New password (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="mt-1 w-full rounded-xl border border-ink/10 bg-white px-3 py-1.5 font-body text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-marigold px-4 py-1.5 font-body text-sm font-bold text-ink disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user.fullName);
                  setEmail(user.email);
                  setPassword("");
                }}
                className="rounded-full border-2 border-ink/10 px-4 py-1.5 font-body text-sm font-bold text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-t border-ink/5 ${isSelected ? "bg-marigold/10" : ""}`}>
      <td className="px-6 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          className="h-4 w-4 rounded border-ink/20"
        />
      </td>
      <td className="px-6 py-3 text-ink">{user.fullName}</td>
      <td className="px-6 py-3 text-ink/70">{user.email}</td>
      <td className="px-6 py-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${roleBadgeColor[user.role]}`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-6 py-3 text-right">
        <button
          onClick={() => setIsEditing(true)}
          className="font-body text-sm font-bold text-sky-teal hover:underline"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-4 font-body text-sm font-bold text-coral hover:underline disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}

export default function UsersList() {
  const { token, user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "fullName",
    direction: "asc",
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1);
  }

  useEffect(() => {
    if (!token) return;

    getUsersRequest(token)
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [token]);

  function handleUpdated(updated: User) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleDeleted(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const filteredUsers = users
    .filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const result = a[sort.key].localeCompare(b[sort.key]);
      return sort.direction === "asc" ? result : -result;
    });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // reset to page 1 whenever the search or role filter changes
  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateRoleFilter(value: UserRole | "all") {
    setRoleFilter(value);
    setPage(1);
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // "select all" only applies to the users selectable on the current page
  const selectableIds = pagedUsers.filter((u) => u.id !== currentUser?.id).map((u) => u.id);
  const allOnPageSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        selectableIds.forEach((id) => next.delete(id));
      } else {
        selectableIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function handleBulkDelete() {
    if (!token || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const confirmed = window.confirm(
      `Delete ${ids.length} selected user${ids.length > 1 ? "s" : ""}? This can't be undone.`
    );
    if (!confirmed) return;

    setIsBulkDeleting(true);
    const results = await Promise.allSettled(ids.map((id) => deleteUserRequest(id, token)));

    const succeededIds = ids.filter((_, i) => results[i].status === "fulfilled");
    const failedCount = results.length - succeededIds.length;

    setUsers((prev) => prev.filter((u) => !succeededIds.includes(u.id)));
    setSelectedIds(new Set());
    setIsBulkDeleting(false);

    if (failedCount === 0) {
      showToast(`${succeededIds.length} user${succeededIds.length > 1 ? "s" : ""} deleted.`);
    } else {
      showToast(
        `${succeededIds.length} deleted, ${failedCount} failed (maybe your own account?).`,
        "error"
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="font-body text-sm text-ink/60 hover:text-ink">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">All users</h1>
        </div>
        <Link
          to="/admin/users/new"
          className="rounded-full bg-marigold px-5 py-2 font-body font-bold text-ink transition-transform hover:scale-105"
        >
          + Add user
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body sm:w-80"
        />
        <select
          value={roleFilter}
          onChange={(e) => updateRoleFilter(e.target.value as UserRole | "all")}
          className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2 font-body sm:w-44"
        >
          {roleFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk action bar - only shown once something is selected */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink px-5 py-3">
          <p className="font-body text-sm font-semibold text-white">
            {selectedIds.size} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="font-body text-sm font-semibold text-white/70 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="rounded-full bg-coral px-4 py-1.5 font-body text-sm font-bold text-white disabled:opacity-60"
            >
              {isBulkDeleting ? "Deleting..." : "Delete selected"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading && (
          <table className="w-full text-left font-body">
            <thead className="bg-sun-cream text-sm text-ink/60">
              <tr>
                <th className="px-6 py-3"></th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} columns={5} />
              ))}
            </tbody>
          </table>
        )}
        {error && <p className="p-6 font-body text-coral">{error}</p>}

        {!isLoading && !error && filteredUsers.length === 0 && (
          <p className="p-6 font-body text-ink/60">
            {users.length === 0 ? "No users yet." : "No users match your search."}
          </p>
        )}

        {!isLoading && !error && pagedUsers.length > 0 && token && (
          <table className="w-full text-left font-body">
            <thead className="bg-sun-cream text-sm text-ink/60">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    className="h-4 w-4 rounded border-ink/20"
                  />
                </th>
                <SortableHeader label="Name" sortKey="fullName" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Email" sortKey="email" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Role" sortKey="role" currentSort={sort} onSort={handleSort} />
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  token={token}
                  isSelected={selectedIds.has(user.id)}
                  onToggleSelect={toggleSelect}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && !error && filteredUsers.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-body text-sm text-ink/60">
            Page {currentPage} of {totalPages} ({filteredUsers.length} users)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full border-2 border-ink/10 bg-white px-4 py-1.5 font-body text-sm font-bold text-ink disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border-2 border-ink/10 bg-white px-4 py-1.5 font-body text-sm font-bold text-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
