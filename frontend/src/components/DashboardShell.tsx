"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("kratos_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("kratos_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-surface text-white">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "ml-[72px]" : "ml-[240px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
