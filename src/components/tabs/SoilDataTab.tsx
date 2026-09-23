"use client";

import React, { useState } from "react";
import { Plot, SoilRecord } from "@/types";
import {
  FlaskConical,
  Plus,
  Droplets,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface SoilDataTabProps {
  plots: Plot[];
  soilRecords: SoilRecord[];
  onSoilRecordAdded: (record: SoilRecord) => void;
}

export function SoilDataTab({ plots, soilRecords, onSoilRecordAdded }: SoilDataTabProps) {
  const [plotId, setPlotId] = useState<number>(plots[0]?.id || 1);
  const [nitrogen, setNitrogen] = useState("95");
  const [phosphorus, setPhosphorus] = useState("65");
  const [potassium, setPotassium] = useState("120");
  const [ph, setPh] = useState("6.5");
  const [moisture, setMoisture] = useState("24.5");
  const [organicMatter, setOrganicMatter] = useState("3.8");
  const [electricalConductivity, setElectricalConductivity] = useState("1.2");
  const [temperature, setTemperature] = useState("21.5");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const selectedPlot = plots.find((p) => p.id === plotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/soil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotId,
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          ph: Number(ph),
          moisture: Number(moisture),
          organicMatter: Number(organicMatter),
          electricalConductivity: Number(electricalConductivity),
          temperature: Number(temperature),
          notes,
        }),
      });
      const data = await res.json();
      if (data.soilRecord) {
        onSoilRecordAdded(data.soilRecord);
        setSuccessMsg("Soil record added successfully! Real-time alerts evaluated.");
        setNotes("");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to add soil test record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Preset quick fill for fast agronomy testing
  const applyPreset = (type: "balanced" | "nitrogenDeficient" | "lowMoisture" | "alkaline") => {
    if (type === "balanced") {
      setNitrogen("110");
      setPhosphorus("65");
      setPotassium("130");
      setPh("6.5");
      setMoisture("27.5");
      setOrganicMatter("4.0");
      setNotes("Optimal post-compost foliar balance.");
    } else if (type === "nitrogenDeficient") {
      setNitrogen("42");
      setPhosphorus("55");
      setPotassium("115");
      setPh("6.3");
      setMoisture("23.0");
      setOrganicMatter("3.1");
      setNotes("Yellowing lower canopy leaves observed. Rapid nitrogen depletion.");
    } else if (type === "lowMoisture") {
      setNitrogen("88");
      setPhosphorus("60");
      setPotassium("95");
      setPh("6.6");
      setMoisture("17.5");
      setOrganicMatter("3.4");
      setNotes("Sensor probe threshold triggered (<18% moisture). Heat wave impact.");
    } else {
      setNitrogen("80");
      setPhosphorus("40");
      setPotassium("85");
      setPh("7.8");
      setMoisture("22.0");
      setOrganicMatter("2.7");
      setNotes("Alkaline soil patch. Potential micronutrient lockup.");
    }
  };

  // NPK visual benchmarks
  const nVal = Number(nitrogen) || 0;
  const pVal = Number(phosphorus) || 0;
  const kVal = Number(potassium) || 0;
  const phVal = Number(ph) || 6.5;
  const moistVal = Number(moisture) || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Soil Chemistry & Sensor Data Input</h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Laboratory spectrophotometry and connected IoT root-zone probes data management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Record New Soil Analysis</h3>
                <p className="text-xs text-stone-400">Nutrients in ppm (mg/kg) & physical properties</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-stone-500 hidden sm:inline">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("balanced")}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => applyPreset("nitrogenDeficient")}
                className="px-2 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/40 transition"
              >
                Low N
              </button>
              <button
                type="button"
                onClick={() => applyPreset("lowMoisture")}
                className="px-2 py-1 rounded bg-sky-950/40 text-sky-300 border border-sky-800/50 hover:bg-sky-900/40 transition"
              >
                Dry Soil
              </button>
              <button
                type="button"
                onClick={() => applyPreset("alkaline")}
                className="px-2 py-1 rounded bg-purple-950/40 text-purple-300 border border-purple-800/50 hover:bg-purple-900/40 transition"
              >
                pH 7.8
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="mt-4 p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Plot Select */}
            <div>
              <label className="block text-stone-300 font-medium mb-1">Target Plot Sector *</label>
              <select
                value={plotId}
                onChange={(e) => setPlotId(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cropType} • {p.acreage} ac)
                  </option>
                ))}
              </select>
            </div>

            {/* Primary N-P-K */}
            <div className="grid grid-cols-3 gap-3 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Nitrogen (N) <span className="text-stone-500 text-[10px]">ppm</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Phosphorus (P) <span className="text-stone-500 text-[10px]">ppm</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Potassium (K) <span className="text-stone-500 text-[10px]">ppm</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* pH & Moisture & Organic Matter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Soil pH <span className="text-stone-500 text-[10px]">(0-14)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="10.0"
                  required
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Moisture <span className="text-stone-500 text-[10px]">%</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="100"
                  required
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Organic Matter <span className="text-stone-500 text-[10px]">%</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={organicMatter}
                  onChange={(e) => setOrganicMatter(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  EC <span className="text-stone-500 text-[10px]">dS/m</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={electricalConductivity}
                  onChange={(e) => setElectricalConductivity(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-medium mb-1">
                Agronomist Field Notes & Sample Depth
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Core sample at 0-30 cm depth. Good crumb structure, active microbial respiration..."
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-stone-400">
                Automated threshold engine checks for low moisture (&lt;20%) and pH drift.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 transition disabled:opacity-50 text-xs shadow-md shadow-emerald-950/40"
              >
                <Plus className="h-3.5 w-3.5" />
                {submitting ? "Analyzing..." : "Record Soil Test"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Soil Chemistry Gauge Panel */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Real-Time Soil Health Metric</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Target crop: <span className="text-emerald-400">{selectedPlot?.cropType || "Crop"}</span>
            </p>

            {/* N-P-K Bar visualizer */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">Nitrogen (N)</span>
                  <span className={`font-mono ${nVal < 60 ? "text-amber-400" : "text-emerald-400"}`}>
                    {nVal} ppm {nVal < 60 ? "(Deficient)" : nVal > 140 ? "(Excess)" : "(Optimal)"}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      nVal < 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (nVal / 160) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">Phosphorus (P)</span>
                  <span className={`font-mono ${pVal < 40 ? "text-amber-400" : "text-emerald-400"}`}>
                    {pVal} ppm {pVal < 40 ? "(Low)" : "(Optimal)"}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      pVal < 40 ? "bg-amber-500" : "bg-teal-500"
                    }`}
                    style={{ width: `${Math.min(100, (pVal / 100) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 font-medium">Potassium (K)</span>
                  <span className={`font-mono ${kVal < 70 ? "text-amber-400" : "text-emerald-400"}`}>
                    {kVal} ppm {kVal < 70 ? "(Low)" : "(Optimal)"}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      kVal < 70 ? "bg-amber-500" : "bg-cyan-500"
                    }`}
                    style={{ width: `${Math.min(100, (kVal / 180) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* pH Meter */}
            <div className="mt-6 p-3 rounded-xl border border-stone-800 bg-stone-950/40">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-stone-300 font-medium">Soil Acidity / Alkalinity (pH)</span>
                <span
                  className={`font-bold font-mono ${
                    phVal < 5.8
                      ? "text-rose-400"
                      : phVal > 7.4
                      ? "text-purple-400"
                      : "text-emerald-400"
                  }`}
                >
                  {phVal} {phVal < 5.8 ? "Acidic" : phVal > 7.4 ? "Alkaline" : "Ideal Neutral"}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-rose-500 via-emerald-500 to-purple-600 relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white border border-black shadow"
                  style={{
                    left: `${Math.max(0, Math.min(95, ((phVal - 4.5) / 5) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                <span>4.5 Acidic</span>
                <span>6.5 Optimal</span>
                <span>9.0 Alkaline</span>
              </div>
            </div>

            {/* Moisture Indicator */}
            <div className="mt-4 p-3 rounded-xl border border-stone-800 bg-stone-950/40">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-stone-300 font-medium flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-sky-400" /> Root-Zone Moisture
                </span>
                <span
                  className={`font-bold font-mono ${
                    moistVal < 20 ? "text-amber-400" : "text-sky-400"
                  }`}
                >
                  {moistVal}%
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {moistVal < 20
                  ? "Water stress imminent. Precision drip activation recommended."
                  : "Field moisture in safe transpiration buffer zone."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-500">
            Calculated EC: {electricalConductivity} dS/m • Temp: {temperature}°C • Organic: {organicMatter}%
          </div>
        </div>
      </div>

      {/* Historical Soil Records Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h3 className="text-base font-semibold text-white">Soil Test Logs & Sensor History</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Consolidated registry of {soilRecords.length} soil lab tests across all plots
            </p>
          </div>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Synced with PostgreSQL
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5 font-medium">Plot Name</th>
                <th className="pb-2.5 font-medium">Nitrogen</th>
                <th className="pb-2.5 font-medium">Phosphorus</th>
                <th className="pb-2.5 font-medium">Potassium</th>
                <th className="pb-2.5 font-medium">pH</th>
                <th className="pb-2.5 font-medium">Moisture</th>
                <th className="pb-2.5 font-medium">Organic %</th>
                <th className="pb-2.5 font-medium">EC (dS/m)</th>
                <th className="pb-2.5 font-medium">Tested Date</th>
                <th className="pb-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {soilRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-stone-800/30 transition">
                  <td className="py-2.5 font-medium text-white">{rec.plotName || `Plot #${rec.plotId}`}</td>
                  <td className="py-2.5 font-mono text-emerald-400">{rec.nitrogen} ppm</td>
                  <td className="py-2.5 font-mono text-teal-400">{rec.phosphorus} ppm</td>
                  <td className="py-2.5 font-mono text-cyan-400">{rec.potassium} ppm</td>
                  <td className="py-2.5 font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        rec.ph < 6.0
                          ? "bg-rose-500/20 text-rose-300"
                          : rec.ph > 7.3
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {rec.ph}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-sky-400">{rec.moisture}%</td>
                  <td className="py-2.5 font-mono">{rec.organicMatter}%</td>
                  <td className="py-2.5 font-mono">{rec.electricalConductivity}</td>
                  <td className="py-2.5 text-stone-400 font-mono text-[11px]">
                    {new Date(rec.testedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 text-stone-400 max-w-xs truncate">{rec.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
