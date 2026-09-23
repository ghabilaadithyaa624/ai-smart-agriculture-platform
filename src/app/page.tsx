"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Farm,
  Plot,
  SoilRecord,
  DiseaseScan,
  CropRecommendation,
  YieldPrediction,
  FertilizerPlan,
  IrrigationSchedule,
  NotificationItem,
} from "@/types";
import { FarmWeather, getFarmWeatherData } from "@/lib/weather";
import { Header } from "@/components/Header";
import { Sidebar, TabId } from "@/components/Sidebar";
import { RoleSwitcherModal } from "@/components/RoleSwitcherModal";
import { NotificationModal } from "@/components/NotificationModal";
import { OverviewTab } from "@/components/tabs/OverviewTab";
import { FarmsPlotsTab } from "@/components/tabs/FarmsPlotsTab";
import { SoilDataTab } from "@/components/tabs/SoilDataTab";
import { DiseaseScannerTab } from "@/components/tabs/DiseaseScannerTab";
import { CropRecommendationTab } from "@/components/tabs/CropRecommendationTab";
import { YieldForecastTab } from "@/components/tabs/YieldForecastTab";
import { SmartIrrigationTab } from "@/components/tabs/SmartIrrigationTab";
import { FertilizerPrescriptionTab } from "@/components/tabs/FertilizerPrescriptionTab";
import { PredictionHistoryTab } from "@/components/tabs/PredictionHistoryTab";
import { ModelMonitoringTab } from "@/components/tabs/ModelMonitoringTab";
import { RefreshCw, Wheat } from "lucide-react";

export default function SmartAgricultureApp() {
  const [currentTab, setCurrentTab] = useState<TabId>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core entities state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [diseaseScans, setDiseaseScans] = useState<DiseaseScan[]>([]);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [yieldPredictions, setYieldPredictions] = useState<YieldPrediction[]>([]);
  const [fertilizerPlans, setFertilizerPlans] = useState<FertilizerPlan[]>([]);
  const [irrigationSchedules, setIrrigationSchedules] = useState<IrrigationSchedule[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [weather, setWeather] = useState<FarmWeather | null>(null);

  const loadAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Initial seed check & user fetch
      const [
        usersRes,
        farmsRes,
        plotsRes,
        soilRes,
        diseaseRes,
        cropsRes,
        yieldRes,
        fertRes,
        irrigRes,
        notifRes,
        weatherRes,
      ] = await Promise.all([
        fetch("/api/auth/users").then((r) => r.json()),
        fetch("/api/farms").then((r) => r.json()),
        fetch("/api/plots").then((r) => r.json()),
        fetch("/api/soil").then((r) => r.json()),
        fetch("/api/predictions/disease").then((r) => r.json()),
        fetch("/api/predictions/crop").then((r) => r.json()),
        fetch("/api/predictions/yield").then((r) => r.json()),
        fetch("/api/predictions/fertilizer").then((r) => r.json()),
        fetch("/api/predictions/irrigation").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
        fetch("/api/weather").then((r) => r.json()),
      ]);

      if (usersRes.users) {
        setAllUsers(usersRes.users);
        if (!currentUser && usersRes.users.length > 0) {
          setCurrentUser(usersRes.users[0]); // default to Elena Vance (Farmer)
        }
      }

      if (farmsRes.farms) setFarms(farmsRes.farms);
      if (plotsRes.plots) setPlots(plotsRes.plots);
      if (soilRes.soilRecords) setSoilRecords(soilRes.soilRecords);
      if (diseaseRes.scans) setDiseaseScans(diseaseRes.scans);
      if (cropsRes.recommendations) setCropRecommendations(cropsRes.recommendations);
      if (yieldRes.yieldPredictions) setYieldPredictions(yieldRes.yieldPredictions);
      if (fertRes.fertilizerPlans) setFertilizerPlans(fertRes.fertilizerPlans);
      if (irrigRes.schedules) setIrrigationSchedules(irrigRes.schedules);
      if (notifRes.notifications) setNotifications(notifRes.notifications);
      if (weatherRes) setWeather(weatherRes);
    } catch (err) {
      console.error("Error loading agricultural platform data:", err);
      // Fallback local weather if offline
      setWeather(getFarmWeatherData("Salinas Valley, CA"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers for state updates
  const handleMarkNotificationsAsRead = async (id?: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { markAllAsRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (id === undefined || n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleFarmCreated = (farm: Farm) => {
    setFarms((prev) => [farm, ...prev]);
  };
  const handleFarmUpdated = (farm: Farm) => {
    setFarms((prev) => prev.map((f) => (f.id === farm.id ? farm : f)));
  };
  const handleFarmDeleted = (farmId: number) => {
    setFarms((prev) => prev.filter((f) => f.id !== farmId));
    setPlots((prev) => prev.filter((p) => p.farmId !== farmId));
  };

  const handlePlotCreated = (plot: Plot) => {
    setPlots((prev) => [plot, ...prev]);
  };
  const handlePlotUpdated = (plot: Plot) => {
    setPlots((prev) => prev.map((p) => (p.id === plot.id ? plot : p)));
  };
  const handlePlotDeleted = (plotId: number) => {
    setPlots((prev) => prev.filter((p) => p.id !== plotId));
  };

  const handleSoilRecordAdded = (record: SoilRecord) => {
    setSoilRecords((prev) => [record, ...prev]);
    // update plot latestSoil
    setPlots((prev) =>
      prev.map((p) => (p.id === record.plotId ? { ...p, latestSoil: record } : p))
    );
  };

  const handleScanSaved = (scan: DiseaseScan) => {
    setDiseaseScans((prev) => [scan, ...prev]);
    // Also re-fetch notifications in case an alert was created
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  };

  const handleRecommendationSaved = (rec: CropRecommendation) => {
    setCropRecommendations((prev) => [rec, ...prev]);
  };

  const handleYieldPredicted = (pred: YieldPrediction) => {
    setYieldPredictions((prev) => [pred, ...prev]);
  };

  const handlePlanCreated = (plan: FertilizerPlan) => {
    setFertilizerPlans((prev) => [plan, ...prev]);
  };

  const handleScheduleCreated = (schedule: IrrigationSchedule) => {
    setIrrigationSchedules((prev) => [schedule, ...prev]);
  };

  const totalAcreage = farms.reduce((acc, f) => acc + f.totalAcreage, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-stone-900 text-stone-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userRole={currentUser?.role}
        farmCount={farms.length}
        totalAcreage={totalAcreage}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          currentUser={currentUser}
          weather={weather}
          notifications={notifications}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onRefreshData={() => loadAllData(true)}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          refreshing={refreshing}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Wheat className="h-6 w-6 animate-pulse" />
                </div>
                <div className="text-sm font-semibold text-white">
                  Loading AgriPulse Intelligence Platform...
                </div>
                <p className="text-xs text-stone-500 font-mono">
                  Connecting to PostgreSQL & Neural Inference Pipeline
                </p>
              </div>
            ) : (
              <>
                {currentTab === "overview" && (
                  <OverviewTab
                    farms={farms}
                    plots={plots}
                    soilRecords={soilRecords}
                    diseaseScans={diseaseScans}
                    yieldPredictions={yieldPredictions}
                    notifications={notifications}
                    weather={weather}
                    onNavigateTab={setCurrentTab}
                  />
                )}

                {currentTab === "farms" && (
                  <FarmsPlotsTab
                    farms={farms}
                    plots={plots}
                    onFarmCreated={handleFarmCreated}
                    onFarmUpdated={handleFarmUpdated}
                    onFarmDeleted={handleFarmDeleted}
                    onPlotCreated={handlePlotCreated}
                    onPlotUpdated={handlePlotUpdated}
                    onPlotDeleted={handlePlotDeleted}
                  />
                )}

                {currentTab === "soil" && (
                  <SoilDataTab
                    plots={plots}
                    soilRecords={soilRecords}
                    onSoilRecordAdded={handleSoilRecordAdded}
                  />
                )}

                {currentTab === "disease" && (
                  <DiseaseScannerTab
                    plots={plots}
                    diseaseScans={diseaseScans}
                    onScanSaved={handleScanSaved}
                  />
                )}

                {currentTab === "crops" && (
                  <CropRecommendationTab
                    soilRecords={soilRecords}
                    recommendations={cropRecommendations}
                    onRecommendationSaved={handleRecommendationSaved}
                  />
                )}

                {currentTab === "yield" && (
                  <YieldForecastTab
                    farms={farms}
                    plots={plots}
                    yieldPredictions={yieldPredictions}
                    onYieldPredicted={handleYieldPredicted}
                  />
                )}

                {currentTab === "irrigation" && (
                  <SmartIrrigationTab
                    farms={farms}
                    plots={plots}
                    weather={weather}
                    schedules={irrigationSchedules}
                    onScheduleCreated={handleScheduleCreated}
                  />
                )}

                {currentTab === "fertilizer" && (
                  <FertilizerPrescriptionTab
                    farms={farms}
                    plots={plots}
                    fertilizerPlans={fertilizerPlans}
                    onPlanCreated={handlePlanCreated}
                  />
                )}

                {currentTab === "history" && (
                  <PredictionHistoryTab
                    diseaseScans={diseaseScans}
                    cropRecommendations={cropRecommendations}
                    yieldPredictions={yieldPredictions}
                    fertilizerPlans={fertilizerPlans}
                  />
                )}

                {currentTab === "models" && <ModelMonitoringTab />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={setCurrentUser}
        onUserCreated={(newUser) => setAllUsers((prev) => [...prev, newUser])}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationsAsRead}
      />
    </div>
  );
}
