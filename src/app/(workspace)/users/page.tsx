
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  user_id: string;
  public_id: number;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
};

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return "—";

  const birth = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birth.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "—";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default function UsersPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/login");
      return;
    }

    const { data, error: usersError } = await supabase
      .from("profiles")
      .select(
        "user_id, public_id, full_name, date_of_birth, gender, created_at"
      )
      .order("public_id", { ascending: true });

    if (usersError) {
      setError(`Unable to load users: ${usersError.message}`);
      setLoading(false);
      return;
    }

    setUsers((data || []) as Profile[]);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return true;

    return (
      String(user.public_id).includes(searchValue) ||
      (user.full_name || "").toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="page-container users-page">
      <div className="users-heading">
        <div>
          <p className="eyebrow">DIRECTORY</p>
          <h1>Registered Users</h1>
          <p className="muted">
            View the members registered with INTRIX.
          </p>
        </div>

        <div className="users-count-card">
          <span>Total Members</span>
          <strong>{users.length}</strong>
        </div>
      </div>

      <section className="users-directory-card">
        <div className="users-directory-toolbar">
          <div>
            <h2>Member Directory</h2>
            <p className="muted">
              Browse registered INTRIX members.
            </p>
          </div>

          <div className="users-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by name or user ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search registered users"
            />
          </div>
        </div>

        {error && (
          <p className="users-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="users-empty-state">
            Loading registered users...
          </div>
        ) : (
          <div className="users-table">
            <div className="users-table-header">
              <span>User ID</span>
              <span>Full Name</span>
              <span>Date of Birth</span>
              <span>Age</span>
              <span>Gender</span>
              <span>Registration Date</span>
            </div>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div className="users-table-row" key={user.user_id}>
                  <span className="users-id">
                    #{user.public_id}
                  </span>

                  <span className="users-name">
                    {user.full_name || "Unnamed User"}
                  </span>

                  <span>{formatDate(user.date_of_birth)}</span>

                  <span>{calculateAge(user.date_of_birth)}</span>

                  <span>
                    {user.gender ? (
                      <span className="users-gender">
                        {user.gender}
                      </span>
                    ) : (
                      "—"
                    )}
                  </span>

                  <span>{formatDate(user.created_at)}</span>
                </div>
              ))
            ) : (
              <div className="users-empty-state">
                {search
                  ? "No users match your search."
                  : "No registered users found."}
              </div>
            )}
          </div>
        )}

        <div className="users-directory-footer">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> members
          </span>

          <button
            type="button"
            className="users-refresh-button"
            onClick={loadUsers}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Directory"}
          </button>
        </div>
      </section>
    </div>
  );
}
