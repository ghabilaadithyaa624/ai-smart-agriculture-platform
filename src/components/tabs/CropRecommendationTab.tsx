"use client";

import React, { useState } from "react";
import { CropRecommendation, SoilRecord } from "@/types";
import { CropRecommendationResult } from "@/lib/ml-models";
import {
  Sparkles,
  Sprout,
  DollarSign,
  Droplets,
  Calendar,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface CropRecommendationTabProps {
  soilRecords: SoilRecord[];
  recommendations: CropRecommendation[];
  onRecommendationSaved: (rec: CropRecommendation) => void;
}

export function CropRecommendationTab({
  soilRecords,
  recommendations,
  onRecommendationSaved,
}: CropRecommendationTabProps) {
  const latestSoil = soilRecords[0];

  const [soilType, setSoilType] = useState("Loamy");
  const [nitrogen, setNitrogen] = useState(latestSoil ? String(latestSoil.nitrogen) : "95");
  const [phosphorus, setPhosphorus] = useState(latestSoil ? String(latestSoil.phosphorus) : "65");
  const [potassium, setPotassium] = useState(latestSoil ? String(latestSoil.potassium) : "130");
  const [ph, setPh] = useState(latestSoil ? String(latestSoil.ph) : "6.5");
  const [rainfall, setRainfall] = useState("550");
  const [temperature, setTemperature] = useState("23.5");
  const [humidity, setHumidity] = useState("60");

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<CropRecommendationResult | null>(null);

  const loadFromLatestSoil = () => {
    if (latestSoil) {
      setNitrogen(String(latestSoil.nitrogen));
      setPhosphorus(String(latestSoil.phosphorus));
      setPotassium(String(latestSoil.potassium));
      setPh(String(latestSoil.ph));
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/predictions/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          farmId: 1,
          soilType,
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          ph: Number(ph),
          rainfall: Number(rainfall),
          temperature: Number(temperature),
          humidity: Number(humidity),
        }),
      });
      const data = await res.json();
      if (data.result) {
        setPrediction(data.result);
      }
      if (data.record) {
        onRecommendationSaved(data.record);
      }
    } catch (err) {
      console.error("Crop recommendation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">AI Crop Suitability & Recommendation Model</h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Algorithmic multi-factor suitability inference based on soil nutrients, pH, water balance, and thermal climate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
            <h3 className="text-sm font-semibold text-white">Input Agronomic Parameters</h3>
            {latestSoil && (
              <button
                type="button"
                onClick={loadFromLatestSoil}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
              >
                <RefreshCw className="h-3 w-3" /> Pull Latest Sensor Data
              </button>
            )}
          </div>

          <form onSubmit={handlePredict} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-medium mb-1">Soil Texture / Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="Loamy">Rich Loam (Deep & Well-Drained)</option>
                <option value="Sandy Loam">Sandy Loam (Warm & Rapid Drainage)</option>
                <option value="Clay Loam">Clay Loam (High Nutrient Retention)</option>
                <option value="Silt Loam">Silt Loam (High Water Holding)</option>
                <option value="Black Soil">Black Vertisol (Heavy Organic)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800">
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  N <span className="text-stone-500 text-[10px]">ppm</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-1.5 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  P <span className="text-stone-500 text-[10px]">ppm</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-1.5 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  K <span className="text-stone-500 text-[10px]">ppm</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-1.5 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Soil pH (0 - 14)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Rainfall (mm/yr)</label>
                <input
                  type="number"
                  step="10"
                  required
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Mean Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Humidity (%)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2.5 font-semibold text-white hover:from-emerald-500 hover:to-green-500 transition shadow-lg shadow-emerald-950/40 text-xs disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Simulating Crop Suitability..." : "Run AI Suitability Prediction"}
            </button>
          </form>
        </div>

        {/* Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase mb-1">
                    <Sparkles className="h-3.5 w-3.5" /> Best Agronomic Match
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    {prediction.topRecommendation}
                  </h3>
                </div>
                <div className="text-right sm:border-l sm:border-stone-800 sm:pl-4">
                  <span className="text-[10px] text-stone-500 block uppercase">Match Confidence</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {Math.round(prediction.confidenceScore * 100)}%
                  </span>
                </div>
              </div>

              {/* KPI highlight row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Expected Yield</span>
                  <span className="text-base font-bold text-white">
                    {prediction.expectedYieldPerAcre} <span className="text-xs text-stone-400">Tons/ac</span>
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Projected ROI</span>
                  <span className="text-base font-bold text-emerald-400">
                    +{prediction.estimatedRoi}%
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Growth Cycle</span>
                  <span className="text-base font-bold text-white">
                    {prediction.growingDurationDays} <span className="text-xs text-stone-400">Days</span>
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Optimal pH</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {prediction.optimalSoilPh}
                  </span>
                </div>
              </div>

              {/* Suitability factor pills */}
              <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 text-xs">
                <span className="text-stone-400 font-medium block mb-2">
                  Agronomic Parameter Evaluation
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <span className="text-stone-500 block text-[10px]">Nitrogen</span>
                    <span className="font-semibold text-emerald-400">
                      {prediction.suitabilityFactors.nitrogen}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <span className="text-stone-500 block text-[10px]">Phosphorus</span>
                    <span className="font-semibold text-emerald-400">
                      {prediction.suitabilityFactors.phosphorus}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <span className="text-stone-500 block text-[10px]">Potassium</span>
                    <span className="font-semibold text-emerald-400">
                      {prediction.suitabilityFactors.potassium}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <span className="text-stone-500 block text-[10px]">Soil pH</span>
                    <span className="font-semibold text-emerald-400">
                      {prediction.suitabilityFactors.ph}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <span className="text-stone-500 block text-[10px]">Climate</span>
                    <span className="font-semibold text-emerald-400">
                      {prediction.suitabilityFactors.climate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ranked Alternatives Table */}
              <div>
                <h4 className="text-xs font-semibold text-stone-300 mb-2">
                  Alternative Candidate Crops (Ranked by Multi-factor Suitability)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-500 uppercase text-[10px]">
                        <th className="pb-2 font-medium">Crop</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">Suitability Match</th>
                        <th className="pb-2 font-medium">Est. Yield</th>
                        <th className="pb-2 font-medium">Est. Gross / Acre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 text-stone-300">
                      {prediction.rankedAlternatives.slice(0, 5).map((alt, idx) => (
                        <tr key={idx} className="hover:bg-stone-800/30">
                          <td className="py-2 font-medium text-white flex items-center gap-1.5">
                            <span className="text-emerald-400 font-mono text-[10px]">#{idx + 1}</span>
                            {alt.crop}
                          </td>
                          <td className="py-2 text-stone-400 text-[11px]">{alt.category}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${alt.matchScore}%` }}
                                />
                              </div>
                              <span className="font-mono text-emerald-400 text-[11px]">
                                {alt.matchScore}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2 font-mono">{alt.expectedYieldPerAcre} t/ac</td>
                          <td className="py-2 font-mono text-emerald-400">
                            ${alt.estimatedRevenuePerAcre.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <Sprout className="h-14 w-14 text-stone-600 mb-3" />
              <h3 className="text-base font-semibold text-stone-200">No Crop Recommendation Run</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">
                Enter your field soil test parameters or click "Pull Latest Sensor Data" to run the algorithmic multi-factor suitability model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
