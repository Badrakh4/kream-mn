"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { ADMIN_AUTH_STORAGE_KEY } from "@/lib/admin-auth";

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [authenticated, setAuthenticated] = useState(isLoginPage);
  const [checked, setChecked] = useState(isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    const checkAuth = window.setTimeout(() => {
      const isAuthenticated = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true";
      if (!isAuthenticated) {
        router.replace("/admin/login");
        return;
      }

      setAuthenticated(true);
      setChecked(true);
    }, 0);

    return () => window.clearTimeout(checkAuth);
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return children;
  }

  if (!checked || !authenticated) {
    return <main className="min-h-screen bg-[#050505]" />;
  }

  return children;
}
