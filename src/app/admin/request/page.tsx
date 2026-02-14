"use client";

import { useState } from "react";

const API_BASE =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/admin/request-link`
    : "/api/admin/request-link";

export default function AdminRequestPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (res.ok) {
        setStatus("success");
        setMessage(data.message ?? "If your email is authorized, you will receive the admin link shortly.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to send request.");
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-slate-50">
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Admin Access</h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your email to receive an admin configuration link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={status === "loading"}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            {status === "loading" ? "Sending…" : "Send Admin Link"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "success" ? "text-emerald-600" : status === "error" ? "text-red-600" : "text-slate-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
