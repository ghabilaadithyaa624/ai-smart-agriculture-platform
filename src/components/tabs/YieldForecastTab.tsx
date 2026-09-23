"use client";

import React, { useState } from "react";
import { Farm, Plot, YieldPrediction } from "@/types";
import { YieldPredictionResult } from "@/lib/ml-models";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Layers,
  Sparkles,
  Calendar,
} from "lucide-react";

interface YieldForecastTabProps {
  farms: Farm[];
  plots: Plot[];
  yieldPredictions: YieldPrediction[];
  onYieldPredicted: (prediction: YieldPrediction) => void;
}

export function YieldForecastTab({
  farms,
  plots,
  yieldPredictions,
  onYieldPredicted,
}: YieldForecastTabProps) {
  const [selectedPlotId, setSelectedPlotId] = useState<number>(plots[0]?.id || 1);
  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];

  const [crop, setCrop] = useState(selectedPlot?.cropType || "Corn (Maize)");
  const [acreage, setAcreage] = useState(selectedPlot ? String(selectedPlot.acreage) : "40");
  const [nitrogen, setNitrogen] = useState("95");
  const [phosphorus, setPhosphorus] = useState("60");
  const [potassium, setPotassium] = useState("85");
  const [ph, setPh] = useState("6.5");
  const [moisture, setMoisture] = useState("24");
  const [temperature, setTemperature] = useState("23");
  const [rainfall, setRainfall] = useState("550");

  const [loading, setLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<YieldPredictionResult | null>(null);

  const handleSelectPlotChange = (id: number) => {
    setSelectedPlotId(id);
    const plot = plots.find((p) => p.id === id);
    if (plot) {
      setCrop(plot.cropType);
      setAcreage(String(plot.acreage));
      if (plot.latestSoil) {
        setNitrogen(String(plot.latestSoil.nitrogen));
        setPhosphorus(String(plot.latestSoil.phosphorus));
        setPotassium(String(plot.latestSoil.potassium));
        setPh(String(plot.latestSoil.ph));
        setMoisture(String(plot.latestSoil.moisture));
      }
    }
  };

  const handleForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/predictions/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: selectedPlot?.farmId || 1,
          plotId: selectedPlotId,
          crop,
          acreage: Number(acreage),
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          ph: Number(ph),
          moisture: Number(moisture),
          temperature: Number(temperature),
          rainfall: Number(rainfall),
        }),
      });
      const data = await res.json();
      if (data.result) {
        setForecastResult(data.result);
      }
      if (data.record) {
        onYieldPredicted(data.record);
      }
    } catch (err) {
      console.error("Yield forecast failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Crop Yield Forecasting & Revenue Modeling</h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Predict total tons, bushels per acre, market gross, and yield limiting factors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
            <h3 className="text-sm font-semibold text-white">Forecast Parameters</h3>
            <span className="text-[11px] text-stone-400">XGBoost Regression Model</span>
          </div>

          <form onSubmit={handleForecast} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-medium mb-1">Target Farm Plot</label>
              <select
                value={selectedPlotId}
                onChange={(e) => handleSelectPlotChange(Number(e.target.value))}
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
                <label className="block text-stone-300 font-medium mb-1">Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Corn (Maize)">Corn (Maize)</option>
                  <option value="Roma Tomatoes">Roma Tomatoes</option>
                  <option value="Winter Wheat">Winter Wheat</option>
                  <option value="Soybeans">Soybeans</option>
                  <option value="Bell Peppers">Bell Peppers</option>
                  <option value="Potatoes">Potatoes</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Cultivated Acreage</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800">
              <div>
                <label className="block text-stone-300 font-medium mb-1">N (ppm)</label>
                <input
                  type="number"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">P (ppm)</label>
                <input
                  type="number"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">K (ppm)</label>
                <input
                  type="number"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-stone-300 font-medium mb-1">pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Moisture %</label>
                <input
                  type="number"
                  step="0.5"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Temp °C</label>
                <input
                  type="number"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-white text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 font-semibold text-white hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-950/40 text-xs disabled:opacity-50"
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? "Forecasting Crop Yield..." : "Run ML Yield Forecast"}
            </button>
          </form>
        </div>

        {/* Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {forecastResult ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <span className="text-xs uppercase font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {forecastResult.crop} • {forecastResult.acreage} Acres
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">
                    {forecastResult.predictedYieldTons.toLocaleString()} Metric Tons
                  </h3>
                </div>
                <div className="text-right sm:border-l sm:border-stone-800 sm:pl-4">
                  <span className="text-[10px] text-stone-500 block uppercase">Projected Market Gross</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ${forecastResult.marketValueEstimate.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Yield / Acre</span>
                  <span className="text-base font-bold text-white font-mono">
                    {forecastResult.yieldPerAcreTons} <span className="text-xs text-stone-400 font-normal">t/ac</span>
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Baseline Delta</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      forecastResult.deltaPercentage >= 0 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {forecastResult.deltaPercentage >= 0 ? "+" : ""}
                    {forecastResult.deltaPercentage}%
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Soil Health Index</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {forecastResult.soilHealthFactorScore}/100
                  </span>
                </div>
                <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-500 block">Weather Index</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {forecastResult.weatherFactorScore}/100
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs">
                <h4 className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Detected Agronomic Yield Risk Factors
                </h4>
                <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
                  {forecastResult.riskFactors.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs">
                <h4 className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" /> AI Yield Maximization Actions (+8-15% Potential)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
                  {forecastResult.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-stone-400 flex items-center justify-between pt-2 border-t border-stone-800">
                <span>Harvest Window: <b className="text-white">{forecastResult.harvestWindow}</b></span>
                <span className="text-stone-500">Predicted via SHAP XGBoost Regressor</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
              <TrendingUp className="h-14 w-14 text-stone-600 mb-3" />
              <h3 className="text-base font-semibold text-stone-200">No Yield Prediction Run</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">
                Select a plot and run the XGBoost yield model to estimate total tonnage and projected market value.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Yield Forecasts Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <h3 className="text-base font-semibold text-white mb-3">
          Historical Yield Forecast Log ({yieldPredictions.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                <th className="pb-2.5 font-medium">Crop</th>
                <th className="pb-2.5 font-medium">Acreage</th>
                <th className="pb-2.5 font-medium">Predicted Tons</th>
                <th className="pb-2.5 font-medium">Yield / Acre</th>
                <th className="pb-2.5 font-medium">Market Est.</th>
                <th className="pb-2.5 font-medium">Soil Score</th>
                <th className="pb-2.5 font-medium">Harvest Window</th>
                <th className="pb-2.5 font-medium">Date Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {yieldPredictions.map((pred) => (
                <tr key={pred.id} className="hover:bg-stone-800/30">
                  <td className="py-2.5 font-semibold text-white">{pred.crop}</td>
                  <td className="py-2.5 font-mono">{pred.acreage} ac</td>
                  <td className="py-2.5 font-bold font-mono text-purple-400">
                    {pred.predictedYieldTons} Tons
                  </td>
                  <td className="py-2.5 font-mono">{pred.yieldPerAcreTons} t/ac</td>
                  <td className="py-2.5 font-mono text-emerald-400 font-semibold">
                    ${pred.marketValueEstimate.toLocaleString()}
                  </td>
                  <td className="py-2.5 font-mono text-cyan-400">{pred.soilHealthFactorScore}/100</td>
                  <td className="py-2.5 text-stone-400 text-[11px]">{pred.harvestWindow}</td>
                  <td className="py-2.5 font-mono text-[11px] text-stone-500">
                    {new Date(pred.createdAt).toLocaleDateString()}
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
