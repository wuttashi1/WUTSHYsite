"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const isLogin = usePathname() === "/admin/login";
  return <div className="admin-shell min-h-screen bg-[#0c0c0f] text-white"><AdminSidebar /><div className={isLogin ? "" : "min-w-0 md:ml-60"}>{children}</div></div>;
}
