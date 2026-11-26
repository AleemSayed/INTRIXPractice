
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default async function UsersPage() {
  await connection();

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("public_id, full_name, created_at")
    .order("public_id", { ascending: true });

  if (error) {
    return (
      <div className="page-container">
        <h1>Registered Users</h1>
        <p>Unable to load users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <p className="eyebrow">DIRECTORY</p>
        <h1>Registered Users</h1>
        <p className="muted">
          View the members registered with INTRIX.
        </p>
      </div>

      <div className="users-table">
        <div className="users-table-header">
          <span>User ID</span>
          <span>Full Name</span>
          <span>Registration Date</span>
        </div>

        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              className="users-table-row"
              key={user.public_id}
            >
              <span>#{user.public_id}</span>

              <span>
                {user.full_name || "Unnamed User"}
              </span>

              <span>
                {formatDate(user.created_at)}
              </span>
            </div>
          ))
        ) : (
          <p className="muted">
            No registered users found.
          </p>
        )}
      </div>

      <div className="users-total">
        Total registered users:{" "}
        <strong>{users?.length ?? 0}</strong>
      </div>
    </div>
  );
}
