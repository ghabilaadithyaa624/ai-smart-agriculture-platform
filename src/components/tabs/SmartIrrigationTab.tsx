"use client";

import React, { useState } from "react";
import { Farm, Plot, IrrigationSchedule } from "@/types";
import { IrrigationRecommendationResult } from "@/lib/ml-models";
import { FarmWeather } from "@/lib/weather";
import {
  Droplets,
  Clock,
  CloudRain,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface SmartIrrigationTabProps {
  farms: Farm[];
  plots: Plot[];
  weather: FarmWeather | null;
  schedules: IrrigationSchedule[];
  onScheduleCreated: (schedule: IrrigationSchedule) => void;
}

export function SmartIrrigationTab({
  farms,
  plots,
  weather,
  schedules,
  onScheduleCreated,
}: SmartIrrigationTabProps) {
  const [selectedPlotId, setSelectedPlotId] = useState<number>(plots[0]?.id || 1);
  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];

  const [plotAcreage, setPlotAcreage] = useState(selectedPlot ? String(selectedPlot.acreage) : "25");
  const [soilMoisture, setSoilMoisture] = useState(
    selectedPlot?.latestSoil ? String(selectedPlot.latestSoil.moisture) : "22.5"
  );
  const [loading, setLoading] = useState(false);
  const [irrigationResult, setIrrigationResult] = useState<IrrigationRecommendationResult | null>(
    null
  );

  const handleSelectPlot = (id: number) => {
    setSelectedPlotId(id);
    const p = plots.find((item) => item.id === id);
    if (p) {
      setPlotAcreage(String(p.acreage));
      if (p.latestSoil) {
        setSoilMoisture(String(p.latestSoil.moisture));
      }
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/predictions/irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: selectedPlot?.farmId || 1,
          plotId: selectedPlotId,
          plotAcreage: Number(plotAcreage),
          soilMoisture: Number(soilMoisture),
          locationName: weather?.locationName || "Salinas Valley, CA",
        }),
      });
      const data = await res.json();
      if (data.result) {
        setIrrigationResult(data.result);
      }
      if (data.schedule) {
        onScheduleCreated(data.schedule);
      }
    } catch (err) {
      console.error("Irrigation calculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">
          Smart Irrigation & Evapotranspiration (ET₀) Water Budgeting
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Penman-Monteith biophysical water requirement modeling with 7-day precipitation integration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
            <h3 className="text-sm font-semibold text-white">Irrigation Zone Setup</h3>
            <span className="text-[11px] text-sky-400 font-mono">ET₀ {weather?.et0EvapotranspirationMm} mm</span>
          </div>

          <form onSubmit={handleCalculate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-medium mb-1">Target Sector / Plot</label>
              <select
                value={selectedPlotId}
                onChange={(e) => handleSelectPlot(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cropType} • {p.acreage} ac)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Acreage</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={plotAcreage}
                  onChange={(e) => setPlotAcreage(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Current Soil Moisture %
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Weather sync summary */}
            <div className="bg-stone-950/40 p-3 rounded-xl border border-stone-800 text-[11px] space-y-1.5">
              <span className="text-stone-400 font-medium block">
                Agrometeorology Telemetry
              </span>
              <div className="flex justify-between text-stone-300">
                <span>Daily ET₀ Evaporation:</span>
                <span className="font-mono text-sky-400 font-semibold">
                  {weather?.et0EvapotranspirationMm || 4.85} mm/day
                </span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Forecast Rain (Next 24h):</span>
                <span className="font-mono text-stone-200">
                  {weather?.rainfallMm || 0.0} mm
                </span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Solar Radiation:</span>
                <span className="font-mono text-amber-400">
                  {weather?.solarRadiationWm2 || 685} W/m²
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 font-semibold text-white hover:from-sky-500 hover:to-cyan-500 transition shadow-lg shadow-sky-950/40 text-xs disabled:opacity-50"
            >
              <Droplets className="h-4 w-4" />
              {loading ? "Calculating ET₀ Water Budget..." : "Optimize Water Schedule"}
            </button>
          </form>
        </div>

        {/* Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {irrigationResult ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <span className="text-xs uppercase font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {irrigationResult.method}
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">
                    {irrigationResult.waterVolumeLiters.toLocaleString()} Liters
                  </h3>
                  <p className="text-xs text-stone-400">
                    ≈ {Math.round(irrigationResult.waterVolumeLiters * 0.264172).toLocaleString()} Gallons
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-stone-800 sm:pl-4">
                  <span className="text-[10px] text-stone-500 block uppercase">Recommended Duration</span>
                  <span className="text-2xl font-extrabold text-sky-400 font-mono">
                    {irrigationResult.durationMinutes} Minutes
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Optimal Window</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    {irrigationResult.recommendedTime}
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Water Savings</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {irrigationResult.waterSavingsPercent}%
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Crop Kc Coeff</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {irrigationResult.cropKc}
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Target Moisture</span>
                  <span className="text-base font-bold text-stone-200 font-mono">
                    {irrigationResult.targetMoisture}%
                  </span>
                </div>
              </div>

              {/* 24-Hour Projected Moisture Curve */}
              <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 text-xs">
                <span className="text-stone-300 font-medium block mb-2">
                  24-Hour Soil Moisture Dynamics Simulation
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  {irrigationResult.moistureProjection.map((pt, idx) => (
                    <div key={idx} className="p-2 rounded bg-stone-900 border border-stone-800">
                      <span className="text-stone-500 block text-[10px]">{pt.time}</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {pt.projectedMoisture.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-stone-400 flex items-center justify-between pt-2 border-t border-stone-800">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cycle synced with automated valve controller
                </span>
                <span className="text-stone-500">Scheduled Status: {irrigationResult.status}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <Droplets className="h-14 w-14 text-stone-600 mb-3" />
              <h3 className="text-base font-semibold text-stone-200">No Irrigation Cycle Calculated</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">
                Select a plot and execute the Penman-Monteith ET₀ model to calculate precision irrigation volume.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedules Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <h3 className="text-base font-semibold text-white mb-3">
          Irrigation Cycles & Water Dispatch Registry ({schedules.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                <th className="pb-2.5 font-medium">Plot ID</th>
                <th className="pb-2.5 font-medium">Water Volume</th>
                <th className="pb-2.5 font-medium">Duration</th>
                <th className="pb-2.5 font-medium">Method</th>
                <th className="pb-2.5 font-medium">Pre-Moisture</th>
                <th className="pb-2.5 font-medium">ET₀ Ref</th>
                <th className="pb-2.5 font-medium">Window</th>
                <th className="pb-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-stone-800/30">
                  <td className="py-2.5 font-semibold text-white">Plot #{s.plotId}</td>
                  <td className="py-2.5 font-bold font-mono text-sky-400">
                    {s.waterVolumeLiters.toLocaleString()} L
                  </td>
                  <td className="py-2.5 font-mono">{s.durationMinutes} min</td>
                  <td className="py-2.5 text-stone-300">{s.method}</td>
                  <td className="py-2.5 font-mono">{s.soilMoistureBefore}%</td>
                  <td className="py-2.5 font-mono text-amber-400">{s.et0Reference} mm</td>
                  <td className="py-2.5 font-mono text-[11px] text-stone-400">{s.recommendedTime}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
