"use client";

import React, { useState } from "react";
import { DiseaseScan, CropRecommendation, YieldPrediction, FertilizerPlan } from "@/types";
import {
  History,
  Search,
  Download,
  ScanEye,
  Sparkles,
  TrendingUp,
  Layers,
  Calendar,
  Filter,
} from "lucide-react";

interface PredictionHistoryTabProps {
  diseaseScans: DiseaseScan[];
  cropRecommendations: CropRecommendation[];
  yieldPredictions: YieldPrediction[];
  fertilizerPlans: FertilizerPlan[];
}

export function PredictionHistoryTab({
  diseaseScans,
  cropRecommendations,
  yieldPredictions,
  fertilizerPlans,
}: PredictionHistoryTabProps) {
  const [filterType, setFilterType] = useState<
    "all" | "disease" | "crop" | "yield" | "fertilizer"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize all predictions into a uniform timeline
  const allEvents = [
    ...diseaseScans.map((d) => ({
      id: `disease-${d.id}`,
      type: "disease" as const,
      title: `${d.cropName}: ${d.detectedDisease}`,
      subtitle: `Confidence: ${(d.confidence * 100).toFixed(1)}% • Severity: ${d.severity}`,
      details: d.symptoms,
      createdAt: d.createdAt,
      status: d.status,
    })),
    ...cropRecommendations.map((c) => ({
      id: `crop-${c.id}`,
      type: "crop" as const,
      title: `Recommended: ${c.topRecommendation}`,
      subtitle: `Match: ${Math.round(c.confidenceScore * 100)}% • Projected ROI: +${c.estimatedRoi}%`,
      details: `Soil N:${c.nitrogen} P:${c.phosphorus} K:${c.potassium} pH:${c.ph} Rain:${c.rainfall}mm`,
      createdAt: c.createdAt,
      status: "Optimal",
    })),
    ...yieldPredictions.map((y) => ({
      id: `yield-${y.id}`,
      type: "yield" as const,
      title: `${y.crop} Forecast (${y.acreage} ac)`,
      subtitle: `${y.predictedYieldTons.toLocaleString()} Tons • $${y.marketValueEstimate.toLocaleString()} Est.`,
      details: `Soil Index: ${y.soilHealthFactorScore}/100 • Window: ${y.harvestWindow}`,
      createdAt: y.createdAt,
      status: "Calculated",
    })),
    ...fertilizerPlans.map((f) => ({
      id: `fert-${f.id}`,
      type: "fertilizer" as const,
      title: `${f.crop} Fertilizer Plan`,
      subtitle: `${f.recommendedNPKRatio} • ${f.dosageKgPerAcre} kg/ac`,
      details: `Application: ${f.applicationMethod} on ${f.scheduledDate}`,
      createdAt: f.createdAt,
      status: f.status,
    })),
  ];

  // Sort by date descending
  allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter & search
  const filtered = allEvents.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "disease":
        return <ScanEye className="h-4 w-4 text-amber-400" />;
      case "crop":
        return <Sparkles className="h-4 w-4 text-emerald-400" />;
      case "yield":
        return <TrendingUp className="h-4 w-4 text-purple-400" />;
      default:
        return <Layers className="h-4 w-4 text-cyan-400" />;
    }
  };

  const getTag = (type: string) => {
    switch (type) {
      case "disease":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "crop":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "yield":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Type", "Title", "Subtitle", "Details", "Date", "Status"];
    const rows = filtered.map((e) => [
      e.id,
      e.type,
      `"${e.title}"`,
      `"${e.subtitle}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      e.createdAt,
      e.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agripulse-historical-predictions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Historical Prediction & Inference Registry</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Audit trail of all ML vision scans, crop suitabilities, yield models, and nutrient formulations
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-stone-700 transition"
        >
          <Download className="h-3.5 w-3.5 text-emerald-400" /> Export CSV ({filtered.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === "all"
                ? "bg-emerald-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            All Logs ({allEvents.length})
          </button>
          <button
            onClick={() => setFilterType("disease")}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === "disease"
                ? "bg-amber-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            Disease Scans ({diseaseScans.length})
          </button>
          <button
            onClick={() => setFilterType("crop")}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === "crop"
                ? "bg-emerald-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            Crop Suitability ({cropRecommendations.length})
          </button>
          <button
            onClick={() => setFilterType("yield")}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === "yield"
                ? "bg-purple-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            Yield Forecasts ({yieldPredictions.length})
          </button>
          <button
            onClick={() => setFilterType("fertilizer")}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === "fertilizer"
                ? "bg-cyan-600 text-white"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
          >
            Fertilizer Plans ({fertilizerPlans.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full rounded-xl border border-stone-700 bg-stone-800 pl-8 pr-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-12 text-center">
            <History className="h-10 w-10 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-300">No Historical Records Found</p>
            <p className="text-xs text-stone-500 mt-1">Try clearing filters or search keywords.</p>
          </div>
        ) : (
          filtered.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 hover:border-stone-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-800/80 border border-stone-700 mt-0.5">
                  {getIcon(event.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getTag(event.type)}`}>
                      {event.type}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                  </div>
                  <p className="text-xs text-stone-300 font-medium">{event.subtitle}</p>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{event.details}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-stone-500" />
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                  {event.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
