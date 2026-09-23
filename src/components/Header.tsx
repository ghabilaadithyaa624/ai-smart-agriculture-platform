"use client";

import React from "react";
import { User, NotificationItem } from "@/types";
import { FarmWeather } from "@/lib/weather";
import { Sun, CloudSun, CloudRain, Bell, RefreshCw, UserCheck, Menu } from "lucide-react";

interface HeaderProps {
  currentUser: User | null;
  weather: FarmWeather | null;
  notifications: NotificationItem[];
  onOpenRoleModal: () => void;
  onOpenNotifications: () => void;
  onRefreshData: () => void;
  onToggleSidebarMobile: () => void;
  refreshing: boolean;
}

export function Header({
  currentUser,
  weather,
  notifications,
  onOpenRoleModal,
  onOpenNotifications,
  onRefreshData,
  onToggleSidebarMobile,
  refreshing,
}: HeaderProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleColors: Record<string, string> = {
    farmer: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    agronomist: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    agribusiness: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    admin: "border-purple-500/50 bg-purple-500/10 text-purple-400",
  };

  const getWeatherIcon = (icon?: string) => {
    switch (icon) {
      case "sun":
        return <Sun className="h-4 w-4 text-amber-400 animate-pulse" />;
      case "rain":
      case "cloud-rain":
        return <CloudRain className="h-4 w-4 text-sky-400" />;
      default:
        return <CloudSun className="h-4 w-4 text-amber-300" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-800 bg-stone-900/90 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Live Weather Indicator */}
        {weather && (
          <div className="hidden sm:flex items-center gap-3 rounded-full border border-stone-800 bg-stone-950/60 px-3.5 py-1.5 text-xs text-stone-300">
            <div className="flex items-center gap-1.5 font-medium text-white">
              {getWeatherIcon(weather.conditionIcon)}
              <span>{weather.temperature}°C</span>
            </div>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400 font-mono text-[11px]">ET₀ {weather.et0EvapotranspirationMm} mm</span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:inline text-stone-400 text-[11px] truncate max-w-[130px]">
              {weather.locationName}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Seed Refresh Button */}
        <button
          onClick={onRefreshData}
          disabled={refreshing}
          title="Refresh & sync agricultural telemetry"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-800/60 text-stone-300 hover:border-stone-700 hover:text-white hover:bg-stone-800 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-800 bg-stone-800/60 text-stone-300 hover:border-stone-700 hover:text-white hover:bg-stone-800 transition"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Role Switcher */}
        <button
          onClick={onOpenRoleModal}
          className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-800/60 p-1.5 pr-3 text-left hover:border-stone-700 hover:bg-stone-800 transition group"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30">
            {currentUser?.name ? currentUser.name.charAt(0) : "U"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition leading-none">
              {currentUser?.name || "Elena Vance"}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded border ${
                  roleColors[currentUser?.role || "farmer"]
                }`}
              >
                {currentUser?.role || "farmer"}
              </span>
            </div>
          </div>
          <UserCheck className="h-3.5 w-3.5 text-stone-500 group-hover:text-stone-300 transition ml-1" />
        </button>
      </div>
    </header>
  );
}
