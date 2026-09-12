import React from 'react';

export default function SuperAdminDashboard({
  currentUser,
  onLogout,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050914] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-500 text-sm font-black">
          BF
        </div>

        <h1 className="mt-5 text-2xl font-black">
          Buddy Fleets Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Dashboard is currently under development.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          {currentUser?.email}
        </p>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold hover:bg-white/10"
        >
          Logout
        </button>
      </div>
    </div>
  );
}