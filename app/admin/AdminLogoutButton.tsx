"use client";

import { useRouter } from "next/navigation";

import { ADMIN_AUTH_STORAGE_KEY } from "@/lib/admin-auth";

export default function AdminLogoutButton() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    router.replace("/admin/login");
  }

  return (
    <button className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-[#d7ff3f]" type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}
