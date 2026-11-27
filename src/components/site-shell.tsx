
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Registered Users", href: "/users" },
  { label: "Contact Us", href: "/contact" },
  { label: "AI Chatbot", href: "/chat" },
];

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth, gender")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        setError("Unable to load your profile: " + profileError.message);
      } else if (profile) {
        setProfileName(profile.full_name || "");
        setDateOfBirth(profile.date_of_birth || "");
        setGender(profile.gender || "");
      }

      const { data: privateDetails, error: addressError } = await supabase
        .from("user_private_details")
        .select("address")
        .eq("user_id", user.id)
        .maybeSingle();

      if (addressError) {
        setError(
          "Unable to load your private address: " + addressError.message
        );
      } else {
        setAddress(privateDetails?.address || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  function calculateAge(dob: string) {
    if (!dob) return "";

    const birthDate = new Date(dob + "T00:00:00");
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const birthdayNotReached =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());

    if (birthdayNotReached) age--;

    return age >= 0 ? age : "";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) return;

    setSaving(true);
    setMessage("");
    setError("");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: profileName.trim(),
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
      })
      .eq("user_id", userId);

    if (profileError) {
      setError("Unable to update profile: " + profileError.message);
      setSaving(false);
      return;
    }

    const { error: addressError } = await supabase
      .from("user_private_details")
      .upsert(
        {
          user_id: userId,
          address: address.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (addressError) {
      setError("Profile saved, but address could not be saved: " + addressError.message);
      setSaving(false);
      return;
    }

    setMessage("Your profile has been updated successfully.");
    setSaving(false);
    setEditOpen(false);
    setMenuOpen(false);
    router.refresh();
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to delete your account.");
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Something went wrong while deleting your account.");
    }
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          INTRIX
        </Link>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${
                pathname === item.href ? "active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <span className="topbar-label">INTRIX WORKSPACE</span>

          <div className="profile-menu-container">
            <button
              className="profile-icon-button"
              onClick={() => {
                setMenuOpen(!menuOpen);
                setEditOpen(false);
              }}
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
            >
              <span className="profile-avatar">
                {profileName.trim().charAt(0).toUpperCase() || "U"}
              </span>
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-heading">
                  <span className="profile-avatar">
                    {profileName.trim().charAt(0).toUpperCase() || "U"}
                  </span>
                  <div>
                    <strong>{profileName || "My Account"}</strong>
                    <span>My Profile</span>
                  </div>
                </div>

                <button
                  className="profile-dropdown-item"
                  onClick={() => {
                    setEditOpen(true);
                    setMenuOpen(false);
                    setMessage("");
                    setError("");
                  }}
                >
                  Edit Profile
                </button>

                <button
                  className="profile-dropdown-item"
                  onClick={handleLogout}
                >
                  Log out
                </button>

                <button
                  className="profile-dropdown-item delete-profile-item"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="workspace-content">{children}</main>
      </div>

      {editOpen && (
        <div
          className="profile-modal-backdrop"
          onClick={() => setEditOpen(false)}
        >
          <section
            className="profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-modal-heading">
              <div>
                <p className="eyebrow">MY ACCOUNT</p>
                <h2>Edit Profile</h2>
                <p className="muted">
                  Update your personal information.
                </p>
              </div>

              <button
                className="profile-modal-close"
                onClick={() => setEditOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {loading ? (
              <p>Loading profile...</p>
            ) : (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  required
                />

                <label htmlFor="profile-dob">Date of Birth</label>
                <input
                  id="profile-dob"
                  type="date"
                  value={dateOfBirth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                />

                <label>Age</label>
                <input
                  type="text"
                  value={
                    dateOfBirth ? `${calculateAge(dateOfBirth)} years` : ""
                  }
                  readOnly
                  placeholder="Calculated from date of birth"
                />

                <label htmlFor="profile-gender">Gender</label>
                <select
                  id="profile-gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>

                <label htmlFor="profile-address">Private Address</label>
                <textarea
                  id="profile-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={3}
                  placeholder="Enter your address"
                />

                <p className="profile-private-note">
                  Your address is private and only you can view it.
                </p>

                {error && <p className="profile-error">{error}</p>}
                {message && <p className="profile-success">{message}</p>}

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
