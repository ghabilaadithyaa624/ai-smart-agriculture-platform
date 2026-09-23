"use client";

import React from "react";
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  ScanEye,
  Sparkles,
  TrendingUp,
  Droplets,
  Layers,
  History,
  Activity,
  X,
  Wheat,
} from "lucide-react";
import { UserRole } from "@/types";

export type TabId =
  | "overview"
  | "farms"
  | "soil"
  | "disease"
  | "crops"
  | "yield"
  | "irrigation"
  | "fertilizer"
  | "history"
  | "models";

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userRole?: UserRole;
  farmCount: number;
  totalAcreage: number;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userRole = "farmer",
  farmCount,
  totalAcreage,
}: SidebarProps) {
  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    highlightRole?: UserRole;
  }> = [
    { id: "overview", label: "Farm Overview", icon: LayoutDashboard, category: "Core Operations" },
    { id: "farms", label: "Farms & Plots", icon: Sprout, category: "Core Operations" },
    { id: "soil", label: "Soil Testing & NPK", icon: FlaskConical, category: "Agronomy & Sensors" },
    { id: "disease", label: "AI Disease Scanner", icon: ScanEye, category: "AI Models & Analytics", highlightRole: "farmer" },
    { id: "crops", label: "Crop Suitability AI", icon: Sparkles, category: "AI Models & Analytics" },
    { id: "yield", label: "Yield Forecasting", icon: TrendingUp, category: "AI Models & Analytics", highlightRole: "agribusiness" },
    { id: "irrigation", label: "Smart Irrigation & ET₀", icon: Droplets, category: "Field Prescriptions" },
    { id: "fertilizer", label: "Fertilizer Prescription", icon: Layers, category: "Field Prescriptions", highlightRole: "agronomist" },
    { id: "history", label: "Prediction History", icon: History, category: "Intelligence Log" },
    { id: "models", label: "Model Monitoring", icon: Activity, category: "MLOps & Telemetry", highlightRole: "admin" },
  ];

  const handleNavClick = (tabId: TabId) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-stone-950 p-4 border-r border-stone-800 text-stone-200">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 pt-2 px-2 border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 shadow-lg shadow-emerald-950/50 text-white font-bold">
              <Wheat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">AgriPulse</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Precision Smart Agriculture</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Farm Stats Widget */}
        <div className="mt-4 rounded-xl border border-stone-800/80 bg-stone-900/60 p-3 text-xs">
          <div className="flex justify-between items-center text-stone-400 mb-1">
            <span>Managed Acreage</span>
            <span className="text-emerald-400 font-semibold">{totalAcreage.toFixed(0)} ac</span>
          </div>
          <div className="flex justify-between items-center text-stone-400">
            <span>Active Farms</span>
            <span className="text-white font-medium">{farmCount} Sites</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-5 space-y-1 overflow-y-auto max-h-[calc(100vh-290px)] pr-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isRoleRecommended = item.highlightRole === userRole;

            return (
              <React.Fragment key={item.id}>
                {/* Category Header if first of category */}
                {(idx === 0 || navItems[idx - 1].category !== item.category) && (
                  <div className="pt-3 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                      : "text-stone-400 hover:bg-stone-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-stone-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isRoleRecommended && !isActive && (
                    <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Role Focus
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Health */}
      <div className="pt-4 border-t border-stone-800/80">
        <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Inference Engine</span>
          </div>
          <span className="font-mono text-emerald-400 text-[10px]">v2.4.2</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 overflow-y-auto z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col h-full bg-stone-950 z-50 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
