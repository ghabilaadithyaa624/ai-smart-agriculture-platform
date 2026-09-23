"use client";

import React, { useState } from "react";
import { NotificationItem } from "@/types";
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, AlertOctagon, X } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id?: number) => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
}: NotificationModalProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "critical") return n.type === "critical" || n.type === "warning";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "critical":
        return <AlertOctagon className="h-5 w-5 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      default:
        return <Info className="h-5 w-5 text-sky-400" />;
    }
  };

  const getBorderColor = (type: NotificationItem["type"], isRead: boolean) => {
    if (isRead) return "border-stone-800 bg-stone-800/30 text-stone-400";
    switch (type) {
      case "critical":
        return "border-rose-500/40 bg-rose-950/20";
      case "warning":
        return "border-amber-500/40 bg-amber-950/20";
      case "success":
        return "border-emerald-500/40 bg-emerald-950/20";
      default:
        return "border-sky-500/40 bg-sky-950/20";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Agricultural Alerts & Dispatches</h2>
              <p className="text-xs text-stone-400">
                Live alerts for plant diseases, soil moisture, ET0 heat spikes, and weather anomalies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mt-4 pb-2 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === "all" ? "bg-stone-800 text-white font-medium" : "text-stone-400 hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === "unread" ? "bg-stone-800 text-white font-medium" : "text-stone-400 hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("critical")}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === "critical" ? "bg-stone-800 text-white font-medium" : "text-stone-400 hover:text-white"
              }`}
            >
              Critical / Warnings
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => onMarkAsRead(undefined)}
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Notification items */}
        <div className="mt-4 space-y-3 overflow-y-auto pr-1 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="h-10 w-10 text-emerald-400/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-300">All Clear on Farm Sectors</p>
              <p className="text-xs text-stone-500 mt-1">No unread alerts in this category.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition flex items-start gap-3 ${getBorderColor(
                  n.type,
                  n.isRead
                )}`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${n.isRead ? "text-stone-300" : "text-white"}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-stone-500 shrink-0 uppercase tracking-wider">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-800/60">
                    <span className="text-[10px] text-stone-500">
                      {new Date(n.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {!n.isRead && (
                      <button
                        onClick={() => onMarkAsRead(n.id)}
                        className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
