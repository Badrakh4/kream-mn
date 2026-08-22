"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ADMIN_AUTH_STORAGE_KEY,
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true") {
      router.replace("/admin");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
      router.replace("/admin");
      return;
    }

    setError("Invalid username or password.");
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f5f0]">
      <header className="border-b border-white/10 bg-[#050505]">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
          <Link className="flex items-center gap-3 text-[17px] font-extrabold tracking-[0.16em]" href="/" aria-label="KREAM.MN home">
            <span className="grid h-9 w-9 place-items-center border border-[#d7ff3f] text-[#d7ff3f]">K</span>
            <span>KREAM<span className="text-[#d7ff3f]">.</span>MN</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[1440px] items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <form className="w-full max-w-[420px] border border-white/10 bg-[#0c0c0c] p-6 sm:p-8" onSubmit={handleSubmit}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">KREAM.MN / Admin</p>
          <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Admin login</h1>
          <p className="mt-3 text-sm text-white/45">Sign in to manage KREAM.MN.</p>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Username</span>
              <input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} type="text" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Password</span>
              <input autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#d7ff3f]" />
            </label>
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <button className="flex h-12 w-full items-center justify-center bg-[#d7ff3f] text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white" type="submit">Login</button>
          </div>
        </form>
      </div>
    </main>
  );
}
