"use client";

import React, { useState } from "react";
import { Farm, Plot } from "@/types";
import {
  Sprout,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  X,
  Droplets,
  CheckCircle2,
} from "lucide-react";

interface FarmsPlotsTabProps {
  farms: Farm[];
  plots: Plot[];
  onFarmCreated: (farm: Farm) => void;
  onFarmUpdated: (farm: Farm) => void;
  onFarmDeleted: (farmId: number) => void;
  onPlotCreated: (plot: Plot) => void;
  onPlotUpdated: (plot: Plot) => void;
  onPlotDeleted: (plotId: number) => void;
}

export function FarmsPlotsTab({
  farms,
  plots,
  onFarmCreated,
  onFarmUpdated,
  onFarmDeleted,
  onPlotCreated,
  onPlotUpdated,
  onPlotDeleted,
}: FarmsPlotsTabProps) {
  const [selectedFarmId, setSelectedFarmId] = useState<number | "all">("all");

  // Modals state
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);

  // Add Farm Form
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmAcreage, setFarmAcreage] = useState("100");
  const [climateZone, setClimateZone] = useState("Mediterranean Coastal (Zone 9b)");
  const [waterSource, setWaterSource] = useState("Subsurface Drip & Well");
  const [submittingFarm, setSubmittingFarm] = useState(false);

  // Add Plot Form
  const [plotFarmId, setPlotFarmId] = useState<number>(farms[0]?.id || 1);
  const [plotName, setPlotName] = useState("");
  const [plotAcreage, setPlotAcreage] = useState("20");
  const [cropType, setCropType] = useState("Roma Tomatoes");
  const [variety, setVariety] = useState("San Marzano");
  const [plantingDate, setPlantingDate] = useState("2025-03-01");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("2025-07-01");
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [healthStatus, setHealthStatus] = useState<Plot["healthStatus"]>("Good");
  const [soilType, setSoilType] = useState("Loamy");
  const [submittingPlot, setSubmittingPlot] = useState(false);

  // Filtered plots
  const filteredPlots =
    selectedFarmId === "all" ? plots : plots.filter((p) => p.farmId === selectedFarmId);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !farmLocation) return;
    setSubmittingFarm(true);
    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          name: farmName,
          location: farmLocation,
          totalAcreage: Number(farmAcreage),
          climateZone,
          waterSource,
        }),
      });
      const data = await res.json();
      if (data.farm) {
        onFarmCreated(data.farm);
        setShowAddFarmModal(false);
        setFarmName("");
        setFarmLocation("");
      }
    } catch (err) {
      console.error("Failed to create farm:", err);
    } finally {
      setSubmittingFarm(false);
    }
  };

  const handleDeleteFarm = async (id: number) => {
    if (!confirm("Are you sure you want to remove this farm and associated plots?")) return;
    try {
      const res = await fetch(`/api/farms/${id}`, { method: "DELETE" });
      if (res.ok) {
        onFarmDeleted(id);
      }
    } catch (err) {
      console.error("Failed to delete farm:", err);
    }
  };

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName || !cropType) return;
    setSubmittingPlot(true);
    try {
      const res = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: plotFarmId,
          name: plotName,
          acreage: Number(plotAcreage),
          cropType,
          variety,
          plantingDate,
          expectedHarvestDate,
          growthStage,
          healthStatus,
          soilType,
        }),
      });
      const data = await res.json();
      if (data.plot) {
        onPlotCreated(data.plot);
        setShowAddPlotModal(false);
        setPlotName("");
      }
    } catch (err) {
      console.error("Failed to create plot:", err);
    } finally {
      setSubmittingPlot(false);
    }
  };

  const handleUpdatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlot) return;
    try {
      const res = await fetch(`/api/plots/${editingPlot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingPlot.name,
          acreage: Number(editingPlot.acreage),
          cropType: editingPlot.cropType,
          variety: editingPlot.variety,
          growthStage: editingPlot.growthStage,
          healthStatus: editingPlot.healthStatus,
          expectedHarvestDate: editingPlot.expectedHarvestDate,
        }),
      });
      const data = await res.json();
      if (data.plot) {
        onPlotUpdated(data.plot);
        setEditingPlot(null);
      }
    } catch (err) {
      console.error("Failed to update plot:", err);
    }
  };

  const handleDeletePlot = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plot?")) return;
    try {
      const res = await fetch(`/api/plots/${id}`, { method: "DELETE" });
      if (res.ok) {
        onPlotDeleted(id);
      }
    } catch (err) {
      console.error("Failed to delete plot:", err);
    }
  };

  const getHealthBadge = (status: Plot["healthStatus"]) => {
    switch (status) {
      case "Excellent":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "Good":
        return "bg-teal-500/20 text-teal-300 border-teal-500/40";
      case "Needs Attention":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "Critical":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-stone-700 text-stone-300 border-stone-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Agricultural Sites & Plot Registry</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage agricultural zones, field boundaries, crop rotation, and physiological stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFarmModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-stone-700 transition"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" /> Add Farm Site
          </button>
          <button
            onClick={() => {
              if (farms.length > 0) setPlotFarmId(farms[0].id);
              setShowAddPlotModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/40"
          >
            <Plus className="h-3.5 w-3.5" /> Add Plot Sector
          </button>
        </div>
      </div>

      {/* Farm Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedFarmId("all")}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            selectedFarmId === "all"
              ? "bg-emerald-600 text-white"
              : "bg-stone-800/80 text-stone-300 hover:bg-stone-800"
          }`}
        >
          All Farms ({plots.length} Plots)
        </button>
        {farms.map((f) => {
          const farmPlotCount = plots.filter((p) => p.farmId === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFarmId(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                selectedFarmId === f.id
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-800/80 text-stone-300 hover:bg-stone-800"
              }`}
            >
              <MapPin className="h-3 w-3" />
              <span>{f.name}</span>
              <span className="text-[10px] opacity-75">({farmPlotCount})</span>
            </button>
          );
        })}
      </div>

      {/* Farms Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.map((farm) => {
          const farmPlots = plots.filter((p) => p.farmId === farm.id);
          const cultivated = farmPlots.reduce((acc, p) => acc + p.acreage, 0);

          return (
            <div
              key={farm.id}
              className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 hover:border-stone-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{farm.name}</h3>
                      <p className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-400" /> {farm.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {farm.status}
                    </span>
                    <button
                      onClick={() => handleDeleteFarm(farm.id)}
                      className="text-stone-500 hover:text-rose-400 p-1 rounded transition"
                      title="Delete Farm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 text-xs bg-stone-950/40 p-3 rounded-xl border border-stone-800/60">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Area</span>
                    <span className="font-semibold text-stone-200">{farm.totalAcreage} ac</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Cultivated</span>
                    <span className="font-semibold text-emerald-400">{cultivated.toFixed(1)} ac</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Plots</span>
                    <span className="font-semibold text-stone-200">{farmPlots.length} Sectors</span>
                  </div>
                </div>

                <div className="text-xs text-stone-400 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Climate Zone:</span>
                    <span className="text-stone-300">{farm.climateZone}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Water Infrastructure:</span>
                    <span className="text-stone-300">{farm.waterSource}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  Crops: {Array.from(new Set(farmPlots.map((p) => p.cropType))).join(", ") || "None"}
                </span>
                <button
                  onClick={() => setSelectedFarmId(farm.id)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium text-xs"
                >
                  View Plots ({farmPlots.length}) →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plots Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">
            Plots & Crop Sectors ({filteredPlots.length})
          </h3>
          <span className="text-xs text-stone-400">
            Showing {filteredPlots.length} of {plots.length} total plots
          </span>
        </div>

        {filteredPlots.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-8 text-center">
            <Sprout className="h-10 w-10 text-stone-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-300">No Plots Found</p>
            <p className="text-xs text-stone-500 mt-1">
              Add your first agricultural sector or plot for this farm site.
            </p>
            <button
              onClick={() => setShowAddPlotModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Create Plot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlots.map((plot) => (
              <div
                key={plot.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 hover:border-stone-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{plot.name}</h4>
                      <p className="text-xs text-stone-400">{plot.farmName || "Farm Plot"}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getHealthBadge(
                          plot.healthStatus
                        )}`}
                      >
                        {plot.healthStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 my-3 text-xs">
                    <div className="flex items-center justify-between bg-stone-950/40 px-2.5 py-1.5 rounded-lg">
                      <span className="text-stone-400">Crop / Variety:</span>
                      <span className="font-semibold text-white">
                        {plot.cropType} ({plot.variety})
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-stone-950/40 px-2.5 py-1.5 rounded-lg">
                      <span className="text-stone-400">Acreage & Soil:</span>
                      <span className="font-semibold text-emerald-400">
                        {plot.acreage} ac • {plot.soilType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-stone-950/40 px-2.5 py-1.5 rounded-lg">
                      <span className="text-stone-400">Growth Stage:</span>
                      <span className="font-semibold text-cyan-400">{plot.growthStage}</span>
                    </div>
                    <div className="flex items-center justify-between bg-stone-950/40 px-2.5 py-1.5 rounded-lg">
                      <span className="text-stone-400">Expected Harvest:</span>
                      <span className="font-mono text-stone-300">{plot.expectedHarvestDate}</span>
                    </div>
                  </div>

                  {plot.latestSoil && (
                    <div className="text-[11px] text-stone-400 bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-lg mb-3">
                      <div className="flex justify-between items-center text-emerald-400 font-medium mb-0.5">
                        <span>Latest Soil Profile</span>
                        <span>{plot.latestSoil.moisture}% Moisture</span>
                      </div>
                      <div>
                        N: {plot.latestSoil.nitrogen} ppm • P: {plot.latestSoil.phosphorus} ppm • K: {plot.latestSoil.potassium} ppm • pH {plot.latestSoil.ph}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Planted {plot.plantingDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPlot(plot)}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition"
                      title="Edit Plot"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlot(plot.id)}
                      className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition"
                      title="Delete Plot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Farm Modal */}
      {showAddFarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-white">Add New Farm Site</h3>
              <button
                onClick={() => setShowAddFarmModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFarm} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Farm Name *</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Salinas Organic River Valley Farm"
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Location *</label>
                  <input
                    type="text"
                    required
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="Salinas, Monterey County, CA"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Total Acreage *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={farmAcreage}
                    onChange={(e) => setFarmAcreage(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Climate Zone</label>
                  <input
                    type="text"
                    value={climateZone}
                    onChange={(e) => setClimateZone(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Water System</label>
                  <input
                    type="text"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
                  className="rounded-lg px-4 py-2 text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFarm}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {submittingFarm ? "Saving..." : "Create Farm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plot Modal */}
      {showAddPlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-white">Add New Plot Sector</h3>
              <button
                onClick={() => setShowAddPlotModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlot} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Farm Site *</label>
                <select
                  value={plotFarmId}
                  onChange={(e) => setPlotFarmId(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Plot Name *</label>
                  <input
                    type="text"
                    required
                    value={plotName}
                    onChange={(e) => setPlotName(e.target.value)}
                    placeholder="e.g. Sector 3B Roma North"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Acreage *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={plotAcreage}
                    onChange={(e) => setPlotAcreage(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Crop Type *</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Roma Tomatoes">Roma Tomatoes</option>
                    <option value="Corn (Maize)">Corn (Maize)</option>
                    <option value="Winter Wheat">Winter Wheat</option>
                    <option value="Soybeans">Soybeans</option>
                    <option value="Bell Peppers">Bell Peppers</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Cultivar / Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Hybrid San Marzano"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Germination">Germination</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruit Formation">Fruit Formation</option>
                    <option value="Maturity">Maturity</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Health Status</label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value as Plot["healthStatus"])}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Silt Loam">Silt Loam</option>
                    <option value="Black Soil">Black Soil</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Planting Date</label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Harvest Target</label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddPlotModal(false)}
                  className="rounded-lg px-4 py-2 text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPlot}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {submittingPlot ? "Saving..." : "Create Plot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plot Modal */}
      {editingPlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-semibold text-white">Edit Plot: {editingPlot.name}</h3>
              <button onClick={() => setEditingPlot(null)} className="text-stone-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePlot} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Plot Name</label>
                <input
                  type="text"
                  value={editingPlot.name}
                  onChange={(e) => setEditingPlot({ ...editingPlot, name: e.target.value })}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Growth Stage</label>
                  <select
                    value={editingPlot.growthStage}
                    onChange={(e) => setEditingPlot({ ...editingPlot, growthStage: e.target.value })}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
                  >
                    <option value="Germination">Germination</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruit Formation">Fruit Formation</option>
                    <option value="Maturity">Maturity</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 mb-1 font-medium">Health Status</label>
                  <select
                    value={editingPlot.healthStatus}
                    onChange={(e) =>
                      setEditingPlot({
                        ...editingPlot,
                        healthStatus: e.target.value as Plot["healthStatus"],
                      })
                    }
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Expected Harvest Date</label>
                <input
                  type="date"
                  value={editingPlot.expectedHarvestDate}
                  onChange={(e) =>
                    setEditingPlot({ ...editingPlot, expectedHarvestDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingPlot(null)}
                  className="rounded-lg px-4 py-2 text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
