"use client";

import React, { useState } from "react";
import { User, UserRole } from "@/types";
import { Shield, UserCheck, Briefcase, Leaf, Sparkles, X, Plus } from "lucide-react";

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onUserCreated: (newUser: User) => void;
}

export function RoleSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onUserCreated,
}: RoleSwitcherModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("farmer");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const roleMeta: Record<
    UserRole,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string; desc: string }
  > = {
    farmer: {
      label: "Farmer / Producer",
      icon: Leaf,
      color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
      desc: "Full farm, plot, soil tests, vision scan, and irrigation control.",
    },
    agronomist: {
      label: "Agronomist / Consultant",
      icon: Sparkles,
      color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
      desc: "Deep pathological diagnostics, fertilizer formulas & soil analytics.",
    },
    agribusiness: {
      label: "Agricultural Business",
      icon: Briefcase,
      color: "border-amber-500/50 bg-amber-500/10 text-amber-400",
      desc: "Acreage-wide yield aggregation, market value forecasting & supply chain.",
    },
    admin: {
      label: "Administrator / MLOps",
      icon: Shield,
      color: "border-purple-500/50 bg-purple-500/10 text-purple-400",
      desc: "AI model monitoring, drift metrics, inference latency & platform configs.",
    },
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, organization, location }),
      });
      const data = await res.json();
      if (data.user) {
        onUserCreated(data.user);
        onSelectUser(data.user);
        setShowAddForm(false);
        setName("");
        setEmail("");
        onClose();
      }
    } catch (err) {
      console.error("Failed to create user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Switch Agricultural Profile & Role</h2>
              <p className="text-xs text-stone-400">
                Experience role-tailored farm intelligence, MLOps telemetry, or agronomic advisory
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

        {!showAddForm ? (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allUsers.map((u) => {
                const meta = roleMeta[u.role] || roleMeta.farmer;
                const Icon = meta.icon;
                const isCurrent = currentUser?.id === u.id;

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`flex flex-col text-left p-4 rounded-xl border transition group ${
                      isCurrent
                        ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                        : "border-stone-800 bg-stone-800/40 hover:border-stone-700 hover:bg-stone-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          Active Now
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition">
                      {u.name}
                    </span>
                    <span className="text-xs text-stone-400">{u.email}</span>
                    <span className="text-[11px] text-stone-500 mt-1">{u.organization || "Independent Agriculture"}</span>
                    <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 border-t border-stone-800/80 pt-1.5">
                      {meta.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-800">
              <span className="text-xs text-stone-400">Want to test with a customized agricultural persona?</span>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
              >
                <Plus className="h-4 w-4" /> Add Custom Persona
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arthur@cropresearch.org"
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="farmer">Farmer / Grower</option>
                  <option value="agronomist">Agronomist / Consultant</option>
                  <option value="agribusiness">Agribusiness / Commercial</option>
                  <option value="admin">Administrator / MLOps</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Valley Soil Analytics Inc."
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Salinas Valley, CA"
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-stone-300 hover:bg-stone-800 transition"
              >
                Back to Personas
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Save & Switch Role"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
