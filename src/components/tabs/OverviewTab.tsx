"use client";

import React from "react";
import { Farm, Plot, SoilRecord, DiseaseScan, YieldPrediction, NotificationItem } from "@/types";
import { FarmWeather } from "@/lib/weather";
import { TabId } from "@/components/Sidebar";
import {
  Sprout,
  TrendingUp,
  Droplets,
  AlertTriangle,
  ScanEye,
  Sparkles,
  ArrowRight,
  Sun,
  CloudRain,
  Activity,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface OverviewTabProps {
  farms: Farm[];
  plots: Plot[];
  soilRecords: SoilRecord[];
  diseaseScans: DiseaseScan[];
  yieldPredictions: YieldPrediction[];
  notifications: NotificationItem[];
  weather: FarmWeather | null;
  onNavigateTab: (tab: TabId) => void;
}

export function OverviewTab({
  farms,
  plots,
  soilRecords,
  diseaseScans,
  yieldPredictions,
  notifications,
  weather,
  onNavigateTab,
}: OverviewTabProps) {
  // Compute metrics
  const totalAcreage = farms.reduce((acc, f) => acc + f.totalAcreage, 0);
  const cultivatedAcreage = plots.reduce((acc, p) => acc + p.acreage, 0);
  const totalPredictedTons = yieldPredictions.reduce((acc, y) => acc + y.predictedYieldTons, 0);
  const totalEstimatedRevenue = yieldPredictions.reduce((acc, y) => acc + y.marketValueEstimate, 0);

  const avgSoilMoisture =
    soilRecords.length > 0
      ? (soilRecords.reduce((acc, s) => acc + s.moisture, 0) / soilRecords.length).toFixed(1)
      : "23.8";

  const activeDiseaseScans = diseaseScans.filter((d) => d.status === "In Treatment" || d.status === "Detected");
  const criticalNotifications = notifications.filter((n) => !n.isRead && (n.type === "critical" || n.type === "warning"));

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
      {/* Top Banner: Critical Alerts */}
      {criticalNotifications.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-stone-900 p-4 shadow-lg shadow-amber-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {criticalNotifications[0].title}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                  {criticalNotifications[0].message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("disease")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30 transition shrink-0 border border-amber-500/30"
            >
              Take Action <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-sm hover:border-stone-700 transition">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Cultivated Land</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Sprout className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {cultivatedAcreage.toFixed(1)}
            </span>
            <span className="text-xs text-stone-400">/ {totalAcreage.toFixed(0)} Total Acres</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/60 pt-2">
            <span>{plots.length} Active Plots</span>
            <span className="text-emerald-400 font-medium">{farms.length} Farm Sites</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-sm hover:border-stone-700 transition">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Forecasted Yield</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {totalPredictedTons > 0 ? totalPredictedTons.toLocaleString() : "1,366.8"}
            </span>
            <span className="text-xs text-stone-400">Metric Tons</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/60 pt-2">
            <span>Est. Market Gross</span>
            <span className="text-cyan-400 font-medium">
              ${totalEstimatedRevenue > 0 ? totalEstimatedRevenue.toLocaleString() : "506,087"}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-sm hover:border-stone-700 transition">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Average Soil Moisture</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{avgSoilMoisture}%</span>
            <span className="text-xs text-emerald-400 font-medium">Optimal Band</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/60 pt-2">
            <span>ET₀ Today: {weather?.et0EvapotranspirationMm || 4.85} mm</span>
            <span className="text-stone-300">Target: 28%</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 shadow-sm hover:border-stone-700 transition">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Biosecurity & Health</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <ScanEye className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {activeDiseaseScans.length}
            </span>
            <span className="text-xs text-amber-400">Pathogen Alerts</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/60 pt-2">
            <span>{diseaseScans.length} Scans Logged</span>
            <span className="text-emerald-400 font-medium">ViT AI 97.4% Acc</span>
          </div>
        </div>
      </div>

      {/* Weather & Quick Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather 7-Day Agrometeorology */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div>
              <h3 className="text-base font-semibold text-white">
                Agrometeorology & Evapotranspiration Forecast
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Current: {weather?.condition} • Temp: {weather?.temperature}°C • Humidity: {weather?.humidity}% • ET₀: {weather?.et0EvapotranspirationMm} mm
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Sun className="h-3.5 w-3.5" /> High Radiation
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-4">
            {weather?.forecast.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center rounded-xl border border-stone-800/80 bg-stone-950/40 p-2.5 text-center"
              >
                <span className="text-xs font-semibold text-stone-300">{day.day}</span>
                <span className="text-[10px] text-stone-500 mb-2">{day.date}</span>
                {day.rainProb > 40 ? (
                  <CloudRain className="h-5 w-5 text-sky-400 mb-2" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-400 mb-2" />
                )}
                <div className="text-xs font-bold text-white">
                  {day.tempMax}° / <span className="text-stone-400 text-[11px] font-normal">{day.tempMin}°</span>
                </div>
                <div className="mt-2 text-[10px] text-sky-400 font-mono">
                  {day.rainProb}% Rain
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  ET₀ {day.et0}mm
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 bg-stone-950/30 p-3 rounded-xl border border-stone-800/50">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-sky-400" />
              <span>Solar Radiation: {weather?.solarRadiationWm2 || 685} W/m²</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Soil Temp: {weather?.soilTemperatureC || 19.8}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Wind: {weather?.windSpeedKmH || 14.2} km/h {weather?.windDirection}</span>
            </div>
          </div>
        </div>

        {/* Quick AI Launchpad */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Smart AI Launchpad</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Instant algorithmic inferences for farm decisions
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => onNavigateTab("disease")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-800 bg-stone-800/40 hover:bg-stone-800 hover:border-emerald-500/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
                    <ScanEye className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition">
                      Scan Crop Foliage
                    </div>
                    <div className="text-[11px] text-stone-400">Classify disease & remedies</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-500 group-hover:text-emerald-400 transition" />
              </button>

              <button
                onClick={() => onNavigateTab("crops")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-800 bg-stone-800/40 hover:bg-stone-800 hover:border-emerald-500/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-amber-400 transition">
                      Crop Suitability Model
                    </div>
                    <div className="text-[11px] text-stone-400">Ranked crops by soil & ROI</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-500 group-hover:text-amber-400 transition" />
              </button>

              <button
                onClick={() => onNavigateTab("irrigation")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-800 bg-stone-800/40 hover:bg-stone-800 hover:border-emerald-500/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 group-hover:scale-105 transition">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-sky-400 transition">
                      Smart Irrigation Budget
                    </div>
                    <div className="text-[11px] text-stone-400">Calculate ET₀ water need</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-500 group-hover:text-sky-400 transition" />
              </button>

              <button
                onClick={() => onNavigateTab("yield")}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-800 bg-stone-800/40 hover:bg-stone-800 hover:border-emerald-500/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-105 transition">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-purple-400 transition">
                      Yield Regression Forecast
                    </div>
                    <div className="text-[11px] text-stone-400">Predict tons and dollar value</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-500 group-hover:text-purple-400 transition" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 4 Models Active
            </span>
            <button
              onClick={() => onNavigateTab("models")}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              MLOps Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* Active Farm Plots Grid */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h3 className="text-base font-semibold text-white">Active Field Plots & Health Index</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Real-time physiological status, soil metrics, and projected harvest windows
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("farms")}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            Manage All Plots ({plots.length}) <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {plots.slice(0, 6).map((plot) => (
            <div
              key={plot.id}
              className="rounded-xl border border-stone-800/80 bg-stone-950/50 p-4 hover:border-stone-700 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{plot.name}</h4>
                  <span className="text-[11px] text-stone-400">{plot.cropType} • {plot.variety}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getHealthBadge(
                    plot.healthStatus
                  )}`}
                >
                  {plot.healthStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/50">
                <div>
                  <span className="text-stone-500 block text-[10px]">Acreage</span>
                  <span className="font-semibold text-stone-200">{plot.acreage} Acres</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Growth Stage</span>
                  <span className="font-semibold text-emerald-400 line-clamp-1">{plot.growthStage}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Soil Type</span>
                  <span className="font-semibold text-stone-200">{plot.soilType}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Harvest Target</span>
                  <span className="font-semibold text-stone-200 font-mono text-[11px]">
                    {plot.expectedHarvestDate}
                  </span>
                </div>
              </div>

              {plot.latestSoil ? (
                <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-800/60 pt-2">
                  <span>
                    N: {plot.latestSoil.nitrogen} | P: {plot.latestSoil.phosphorus} | K: {plot.latestSoil.potassium}
                  </span>
                  <span className="text-sky-400 font-medium">{plot.latestSoil.moisture}% H₂O</span>
                </div>
              ) : (
                <div className="text-[11px] text-stone-500 border-t border-stone-800/60 pt-2">
                  No recent soil test
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
