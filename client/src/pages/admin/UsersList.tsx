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

interface UserRowProps {
  user: User;
  token: string;
  onUpdated: (user: User) => void;
  onDeleted: (id: number) => void;
}

function UserRow({ user, token, onUpdated, onDeleted }: UserRowProps) {
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
        <td className="px-6 py-3" colSpan={4}>
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
    <tr className="border-t border-ink/5">
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
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [page, setPage] = useState(1);

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
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
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

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        {isLoading && (
          <table className="w-full text-left font-body">
            <thead className="bg-sun-cream text-sm text-ink/60">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} columns={4} />
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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  token={token}
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
