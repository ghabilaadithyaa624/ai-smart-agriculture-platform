"use client";

import React, { useState } from "react";
import { DiseaseScan, Plot } from "@/types";
import { DiseaseDetectionResult } from "@/lib/ml-models";
import {
  ScanEye,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Layers,
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";

interface DiseaseScannerTabProps {
  plots: Plot[];
  diseaseScans: DiseaseScan[];
  onScanSaved: (scan: DiseaseScan) => void;
}

export function DiseaseScannerTab({ plots, diseaseScans, onScanSaved }: DiseaseScannerTabProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    "/images/diseases/tomato-early-blight.jpg"
  );
  const [cropHint, setCropHint] = useState("Roma Tomato");
  const [plotId, setPlotId] = useState<number>(plots[0]?.id || 1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DiseaseDetectionResult | null>(null);
  const [latestSavedScan, setLatestSavedScan] = useState<DiseaseScan | null>(null);

  // Preset sample diseased and healthy leaves
  const sampleLeaves = [
    {
      title: "Tomato Early Blight",
      path: "/images/diseases/tomato-early-blight.jpg",
      crop: "Roma Tomato",
      pathogen: "Alternaria solani",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Northern Corn Leaf Blight",
      path: "/images/diseases/corn-leaf-blight.jpg",
      crop: "Sweet Corn (Maize)",
      pathogen: "Exserohilum turcicum",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      title: "Apple Scab Lesions",
      path: "/images/diseases/apple-scab.jpg",
      crop: "Apple Tree Foliage",
      pathogen: "Venturia inaequalis",
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    {
      title: "Healthy Pristine Leaf",
      path: "/images/diseases/healthy-crop.jpg",
      crop: "Healthy Bell Pepper",
      pathogen: "No Pathogen (Healthy)",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
  ];

  const handleSelectSample = (sample: (typeof sampleLeaves)[0]) => {
    setSelectedImage(sample.path);
    setCropHint(sample.crop);
    setScanResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setScanResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const runDiseaseVisionScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/predictions/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedImage,
          cropHint,
          plotId,
          farmId: 1,
          userId: 1,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setScanResult(data.result);
      }
      if (data.scan) {
        setLatestSavedScan(data.scan);
        onScanSaved(data.scan);
      }
    } catch (err) {
      console.error("Vision scan failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">
          AI Vision Plant Pathology & Disease Classification
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Deep learning vision transformer (ViT) trained on 50,000+ agricultural plant pathology images
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Specimen Leaf Image</h3>

            {/* Image Preview Container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-stone-700 bg-black flex items-center justify-center">
              {/* Image preview */}
              <img
                src={selectedImage}
                alt="Plant Leaf Specimen"
                className="w-full h-full object-cover"
              />

              {/* Scanning Laser Line Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-lg shadow-emerald-400" />
                  <span className="bg-stone-950/90 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-emerald-500/40 font-mono flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" /> ViT-B/16 Vision Neural Scan...
                  </span>
                </div>
              )}
            </div>

            {/* Form Controls */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Crop Type Hint</label>
                  <input
                    type="text"
                    value={cropHint}
                    onChange={(e) => setCropHint(e.target.value)}
                    placeholder="e.g. Roma Tomato"
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Associate Plot</label>
                  <select
                    value={plotId}
                    onChange={(e) => setPlotId(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {plots.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Button */}
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-stone-700 hover:border-emerald-500/60 bg-stone-800/40 px-3 py-2.5 text-stone-300 hover:text-white cursor-pointer transition">
                  <UploadCloud className="h-4 w-4 text-emerald-400" />
                  <span>Upload Custom Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Run Scan Button */}
              <button
                type="button"
                onClick={runDiseaseVisionScan}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-950/50 disabled:opacity-50 text-xs"
              >
                <ScanEye className="h-4 w-4" />
                {isScanning ? "Processing Vision Neural Network..." : "Analyze Specimen & Classify Pathogen"}
              </button>
            </div>
          </div>

          {/* Preset Sample Gallery */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4">
            <h4 className="text-xs font-semibold text-stone-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Quick-Test Leaf Specimen Library
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {sampleLeaves.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`flex flex-col text-left p-2 rounded-xl border transition ${
                    selectedImage === sample.path
                      ? "border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/40"
                      : "border-stone-800 bg-stone-950/40 hover:border-stone-700"
                  }`}
                >
                  <div className="h-16 w-full rounded-lg overflow-hidden mb-1.5 bg-black">
                    <img
                      src={sample.path}
                      alt={sample.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-white line-clamp-1">
                    {sample.title}
                  </span>
                  <span className="text-[10px] text-stone-400 line-clamp-1">{sample.pathogen}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Diagnostic Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {scanResult ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 space-y-5 animate-in fade-in duration-300">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {scanResult.cropName}
                    </span>
                    <span
                      className={`text-xs uppercase font-semibold px-2 py-0.5 rounded border ${
                        scanResult.severity === "Severe"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : scanResult.severity === "Moderate"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : scanResult.severity === "Mild"
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      Severity: {scanResult.severity}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {scanResult.pathogenType === "Healthy" ? (
                      <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-400" />
                    )}
                    {scanResult.detectedDisease}
                  </h3>
                </div>

                <div className="text-right sm:border-l sm:border-stone-800 sm:pl-4">
                  <span className="text-[10px] text-stone-500 block uppercase font-medium">
                    Diagnostic Confidence
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {(scanResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Confidence breakdown bar */}
              <div className="bg-stone-950/40 p-3 rounded-xl border border-stone-800/60 text-xs">
                <span className="text-stone-400 font-medium block mb-2">
                  Candidate Differential Diagnoses Breakdown
                </span>
                <div className="space-y-1.5">
                  {scanResult.diagnosticConfidenceBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="text-stone-300 w-48 truncate">{item.label}</span>
                      <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            idx === 0 ? "bg-emerald-500" : "bg-stone-600"
                          }`}
                          style={{ width: `${item.probability * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-stone-400 w-12 text-right">
                        {(item.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathological Symptoms */}
              <div className="rounded-xl border border-stone-800/80 bg-stone-950/40 p-3.5 text-xs">
                <h4 className="font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-sky-400" /> Pathological Symptoms & Etiology
                </h4>
                <p className="text-stone-400 leading-relaxed">{scanResult.symptoms}</p>
                <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-4">
                  <span>Pathogen Class: <b className="text-stone-300">{scanResult.pathogenType}</b></span>
                  <span>Estimated Leaf Damage: <b className="text-amber-400">{scanResult.affectedArea}%</b></span>
                </div>
              </div>

              {/* Remediation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Organic Prescription */}
                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                    <Leaf className="h-4 w-4" /> Organic & Biological Remedy
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {scanResult.organicRemedy}
                  </p>
                </div>

                {/* Chemical Prescription */}
                <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-3.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                    <Layers className="h-4 w-4" /> Chemical / Synthetic Control
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {scanResult.chemicalRemedy}
                  </p>
                </div>
              </div>

              {/* Preventative Cultural Practices */}
              <div className="rounded-xl border border-stone-800 bg-stone-950/40 p-3.5 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                  <ShieldCheck className="h-4 w-4" /> Preventive & Cultural Agronomic Control
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {scanResult.preventiveAction}
                </p>
              </div>

              {latestSavedScan && (
                <div className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Diagnosis permanently saved to Farm Plot records (Scan #{latestSavedScan.id}).
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800/60 text-emerald-400 mb-3 border border-stone-700/60">
                <ScanEye className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-stone-200">
                Ready to Classify Leaf Specimen
              </h3>
              <p className="text-xs text-stone-400 mt-1 max-w-md">
                Select a test leaf from the preset library or upload your own leaf image from the field, then click Analyze.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-stone-500">
                <span>Identifies Fungal, Bacterial & Viral Pathologies with 97.4% precision</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Disease Scans Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
        <h3 className="text-base font-semibold text-white mb-3">
          Field Pathology Scans Registry ({diseaseScans.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {diseaseScans.slice(0, 8).map((scan) => (
            <div
              key={scan.id}
              className="rounded-xl border border-stone-800 bg-stone-950/50 p-3 hover:border-stone-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="h-28 w-full rounded-lg overflow-hidden bg-black mb-2 relative">
                  <img
                    src={scan.imageUrl}
                    alt={scan.detectedDisease}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-emerald-400 border border-emerald-500/30 font-mono">
                    {(scan.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold">
                  {scan.cropName}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                  {scan.detectedDisease}
                </h4>
                <p className="text-[11px] text-stone-400 line-clamp-2">{scan.symptoms}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px]">
                <span className="text-stone-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(scan.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    scan.status === "Resolved"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {scan.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
