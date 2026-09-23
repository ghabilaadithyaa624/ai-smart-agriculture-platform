"use client";

import React, { useState } from "react";
import { Farm, Plot, FertilizerPlan } from "@/types";
import { FertilizerRecommendationResult } from "@/lib/ml-models";
import {
  Layers,
  Leaf,
  DollarSign,
  Calendar,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";

interface FertilizerPrescriptionTabProps {
  farms: Farm[];
  plots: Plot[];
  fertilizerPlans: FertilizerPlan[];
  onPlanCreated: (plan: FertilizerPlan) => void;
}

export function FertilizerPrescriptionTab({
  farms,
  plots,
  fertilizerPlans,
  onPlanCreated,
}: FertilizerPrescriptionTabProps) {
  const [selectedPlotId, setSelectedPlotId] = useState<number>(plots[0]?.id || 1);
  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];

  const [crop, setCrop] = useState(selectedPlot?.cropType || "Roma Tomatoes");
  const [growthStage, setGrowthStage] = useState(selectedPlot?.growthStage || "Fruit Formation");
  const [nitrogen, setNitrogen] = useState(
    selectedPlot?.latestSoil ? String(selectedPlot.latestSoil.nitrogen) : "94"
  );
  const [phosphorus, setPhosphorus] = useState(
    selectedPlot?.latestSoil ? String(selectedPlot.latestSoil.phosphorus) : "68"
  );
  const [potassium, setPotassium] = useState(
    selectedPlot?.latestSoil ? String(selectedPlot.latestSoil.potassium) : "135"
  );
  const [ph, setPh] = useState(
    selectedPlot?.latestSoil ? String(selectedPlot.latestSoil.ph) : "6.4"
  );
  const [scheduledDate, setScheduledDate] = useState("2025-05-20");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerRecommendationResult | null>(null);

  const handleSelectPlot = (id: number) => {
    setSelectedPlotId(id);
    const p = plots.find((item) => item.id === id);
    if (p) {
      setCrop(p.cropType);
      setGrowthStage(p.growthStage);
      if (p.latestSoil) {
        setNitrogen(String(p.latestSoil.nitrogen));
        setPhosphorus(String(p.latestSoil.phosphorus));
        setPotassium(String(p.latestSoil.potassium));
        setPh(String(p.latestSoil.ph));
      }
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/predictions/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: selectedPlot?.farmId || 1,
          plotId: selectedPlotId,
          crop,
          growthStage,
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          ph: Number(ph),
          scheduledDate,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      }
      if (data.plan) {
        onPlanCreated(data.plan);
      }
    } catch (err) {
      console.error("Fertilizer prescription failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Fertilizer Prescription & Nutrient Balancer</h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Calculate nutrient deficits, custom synthetic NPK ratios, and certified organic alternatives
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
            <h3 className="text-sm font-semibold text-white">Nutrient Baseline Input</h3>
            <span className="text-[11px] text-emerald-400">NutriBalance Engine</span>
          </div>

          <form onSubmit={handlePrescribe} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-medium mb-1">Target Plot Sector</label>
              <select
                value={selectedPlotId}
                onChange={(e) => handleSelectPlot(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cropType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Crop</label>
                <input
                  type="text"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Germination">Germination</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Flowering">Flowering</option>
                  <option value="Fruit Formation">Fruit Formation</option>
                  <option value="Maturity">Maturity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Current N (ppm)</label>
                <input
                  type="number"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Current P (ppm)</label>
                <input
                  type="number"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Current K (ppm)</label>
                <input
                  type="number"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Target Application Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-950/40 text-xs disabled:opacity-50"
            >
              <Layers className="h-4 w-4" />
              {loading ? "Computing Nutrient Formula..." : "Generate Fertilizer Prescription"}
            </button>
          </form>
        </div>

        {/* Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <span className="text-xs uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {result.crop} • {result.growthStage}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {result.recommendedNPKRatio}
                  </h3>
                </div>
                <div className="text-right sm:border-l sm:border-stone-800 sm:pl-4">
                  <span className="text-[10px] text-stone-500 block uppercase">Estimated Material Cost</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    ${result.syntheticBlend.costEstimateUSD} <span className="text-xs text-stone-400 font-normal">/ac</span>
                  </span>
                </div>
              </div>

              {/* Deficit metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-500 block">N Deficit</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {result.nitrogenDeficit} ppm
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-500 block">P Deficit</span>
                  <span className="text-base font-bold text-teal-400 font-mono">
                    {result.phosphorusDeficit} ppm
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-500 block">K Deficit</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {result.potassiumDeficit} ppm
                  </span>
                </div>
              </div>

              {/* Synthetic & Organic side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Synthetic Blend */}
                <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4 space-y-2">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Layers className="h-4 w-4" /> Synthetic Precision Formula
                  </span>
                  <p className="font-medium text-white text-[11px] leading-relaxed">
                    {result.syntheticBlend.name}
                  </p>
                  <div className="text-stone-300 text-[11px] pt-1 border-t border-cyan-900/40">
                    <b>Dosage:</b> {result.syntheticBlend.dosageKgPerAcre} kg / acre
                  </div>
                  <div className="text-stone-400 text-[10px]">
                    {result.syntheticBlend.frequency}
                  </div>
                </div>

                {/* Organic Alternative */}
                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 space-y-2">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Leaf className="h-4 w-4" /> Certified Organic Alternative
                  </span>
                  <p className="font-medium text-white text-[11px] leading-relaxed">
                    {result.organicAlternative.name}
                  </p>
                  <div className="text-stone-300 text-[11px] pt-1 border-t border-emerald-900/40">
                    <b>Dosage:</b> {result.organicAlternative.dosageKgPerAcre} kg / acre
                  </div>
                  <div className="text-stone-400 text-[10px]">
                    {result.organicAlternative.method}
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-3.5 text-xs">
                <span className="font-semibold text-stone-200 block mb-1">
                  Agronomic Delivery Best Practices
                </span>
                <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px]">
                  {result.bestPractices.map((bp, idx) => (
                    <li key={idx}>{bp}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <Layers className="h-14 w-14 text-stone-600 mb-3" />
              <h3 className="text-base font-semibold text-stone-200">No Fertilizer Prescription Run</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">
                Select a plot and run the NutriBalance model to calculate custom synthetic and organic nutrient plans.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Plans Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <h3 className="text-base font-semibold text-white mb-3">
          Fertilizer Application Plans Registry ({fertilizerPlans.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                <th className="pb-2.5 font-medium">Crop</th>
                <th className="pb-2.5 font-medium">Growth Stage</th>
                <th className="pb-2.5 font-medium">Formula / Ratio</th>
                <th className="pb-2.5 font-medium">Dosage</th>
                <th className="pb-2.5 font-medium">Method</th>
                <th className="pb-2.5 font-medium">Scheduled Date</th>
                <th className="pb-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {fertilizerPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-stone-800/30">
                  <td className="py-2.5 font-semibold text-white">{plan.crop}</td>
                  <td className="py-2.5 text-stone-300">{plan.growthStage}</td>
                  <td className="py-2.5 font-bold font-mono text-emerald-400">
                    {plan.recommendedNPKRatio}
                  </td>
                  <td className="py-2.5 font-mono">{plan.dosageKgPerAcre} kg/ac</td>
                  <td className="py-2.5 text-stone-400 text-[11px]">{plan.applicationMethod}</td>
                  <td className="py-2.5 font-mono text-stone-400 text-[11px]">{plan.scheduledDate}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      {plan.status}
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
