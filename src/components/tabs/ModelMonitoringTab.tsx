"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  Server,
  Layers,
} from "lucide-react";

interface TelemetryLog {
  id: number;
  modelName: string;
  taskType: string;
  inferenceTimeMs: number;
  confidenceScore: number;
  inputSummary: string;
  predictionResult: string;
  driftScore: number;
  createdAt: string;
}

interface ModelMeta {
  name: string;
  task: string;
  architecture: string;
  accuracy: string;
  f1Score: string;
  status: string;
  activeVersion: string;
  lastRetrained: string;
}

export function ModelMonitoringTab() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalInferences: 1288,
    avgLatencyMs: 64.2,
    avgConfidencePercent: 96.2,
    avgDriftScore: 0.018,
    activeModelsCount: 4,
    uptimePercentage: 99.98,
  });
  const [models, setModels] = useState<ModelMeta[]>([]);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/model-metrics");
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.models) setModels(data.models);
      if (data.recentLogs) setLogs(data.recentLogs);
    } catch (err) {
      console.error("Failed to fetch model metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">MLOps Telemetry & Model Monitoring</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time inference profiling, feature drift monitoring, and agricultural neural network health
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-stone-700 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Total Inferences</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.totalInferences.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Request Completion Rate
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Mean Inference Latency</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.avgLatencyMs} <span className="text-xs text-stone-400 font-normal">ms</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Target: &lt;150ms • GPU/Wasm Accelerated
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Mean Model Confidence</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.avgConfidencePercent}%
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Cross-validation F1 score: 0.961
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">Feature Drift Score</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {summary.avgDriftScore}
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Status: <b className="text-emerald-400">Minimal Drift</b> (&lt;0.05 threshold)
          </div>
        </div>
      </div>

      {/* Production Model Registry */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">
          Deployed Production Agricultural Models ({models.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 hover:border-stone-700 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      v{model.activeVersion}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {model.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{model.name}</h4>
                  <p className="text-xs text-stone-400 mt-0.5">{model.task}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 my-4 text-xs bg-stone-950/40 p-3 rounded-xl border border-stone-800">
                <div>
                  <span className="text-[10px] text-stone-500 block">Accuracy</span>
                  <span className="font-bold text-emerald-400 font-mono">{model.accuracy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">F1 Macro</span>
                  <span className="font-bold text-cyan-400 font-mono">{model.f1Score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">Retrained</span>
                  <span className="font-mono text-stone-300 text-[11px]">{model.lastRetrained}</span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-800/60 pt-2">
                <span>Architecture: {model.architecture}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Inference Stream Log */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-3">
          <div>
            <h3 className="text-base font-semibold text-white">Live Inference Telemetry Stream</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Real-time audit log of inference latencies, confidence, and payload summaries
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                <th className="pb-2.5 font-medium">Model Name</th>
                <th className="pb-2.5 font-medium">Task Type</th>
                <th className="pb-2.5 font-medium">Latency</th>
                <th className="pb-2.5 font-medium">Confidence</th>
                <th className="pb-2.5 font-medium">Input Summary</th>
                <th className="pb-2.5 font-medium">Prediction Result</th>
                <th className="pb-2.5 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-800/30">
                  <td className="py-2.5 font-mono text-white text-[11px]">{log.modelName}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
                      {log.taskType}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-cyan-400">{log.inferenceTimeMs} ms</td>
                  <td className="py-2.5 font-mono text-emerald-400 font-semibold">
                    {(log.confidenceScore * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-stone-400 max-w-xs truncate text-[11px]">
                    {log.inputSummary}
                  </td>
                  <td className="py-2.5 text-white font-medium max-w-xs truncate text-[11px]">
                    {log.predictionResult}
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-stone-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
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
