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

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div className="flex min-h-screen bg-surface text-white w-full overflow-x-hidden">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <main
        style={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100vw - ${sidebarWidth}px)`,
          maxWidth: `calc(100vw - ${sidebarWidth}px)`,
        }}
        className="flex-1 min-h-screen transition-[margin-left,width,max-width] duration-300 ease-in-out"
      >
        {children}
      </main>
    </div>
  );
}
