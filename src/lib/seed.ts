import { db } from "@/db";
import {
  users,
  farms,
  plots,
  soilRecords,
  diseaseScans,
  cropRecommendations,
  yieldPredictions,
  fertilizerPlans,
  irrigationSchedules,
  notifications,
  modelMetrics,
} from "@/db/schema";
import { count } from "drizzle-orm";

export async function seedDatabaseIfEmpty() {
  try {
    const userCountResult = await db.select({ val: count() }).from(users);
    const existingCount = userCountResult[0]?.val || 0;

    if (existingCount > 0) {
      return { message: "Database already contains data", seeded: false };
    }

    console.log("Seeding initial agricultural demo data...");

    // 1. Insert Users with 4 distinct roles
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          name: "Elena Vance",
          email: "elena.farmer@agrisun.farm",
          role: "farmer",
          phone: "+1 (555) 234-8901",
          organization: "Suncrest Organic Farm",
          location: "Salinas Valley, CA",
          avatarUrl: "https://images.pexels.com/photos/33786601/pexels-photo-33786601.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=280",
        },
        {
          name: "Dr. Marcus Thorne",
          email: "marcus.thorne@agriscience.org",
          role: "agronomist",
          phone: "+1 (555) 987-6543",
          organization: "California Precision Agronomy Consultants",
          location: "Davis, CA",
          avatarUrl: "https://images.pexels.com/photos/13525085/pexels-photo-13525085.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=280",
        },
        {
          name: "Sarah Jenkins",
          email: "sarah.j@harvestdirect.ag",
          role: "agribusiness",
          phone: "+1 (555) 456-7890",
          organization: "HarvestDirect Grain & Produce Supply",
          location: "Fresno, CA",
          avatarUrl: "https://images.pexels.com/photos/13054496/pexels-photo-13054496.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=280",
        },
        {
          name: "David Miller",
          email: "david.admin@agripulse.ai",
          role: "admin",
          phone: "+1 (555) 112-3344",
          organization: "AgriPulse ML Infrastructure",
          location: "San Francisco, CA",
          avatarUrl: "https://images.pexels.com/photos/12529226/pexels-photo-12529226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=280",
        },
      ])
      .returning();

    const farmerId = insertedUsers[0].id;

    // 2. Insert Farms
    const insertedFarms = await db
      .insert(farms)
      .values([
        {
          userId: farmerId,
          name: "Suncrest Organic Fields",
          location: "Salinas Valley, CA",
          latitude: 36.6777,
          longitude: -121.6555,
          totalAcreage: 145.0,
          climateZone: "Mediterranean Coastal (Zone 9b)",
          waterSource: "Subsurface Drip & Managed Aquifer Well",
          status: "active",
        },
        {
          userId: farmerId,
          name: "Highland Valley Grain & Pulses",
          location: "Fresno County, CA",
          latitude: 36.7468,
          longitude: -119.7726,
          totalAcreage: 320.0,
          climateZone: "Central Valley Semi-Arid (Zone 9a)",
          waterSource: "Canal Allocation + High Flow Drip",
          status: "active",
        },
      ])
      .returning();

    const farm1Id = insertedFarms[0].id;
    const farm2Id = insertedFarms[1].id;

    // 3. Insert Plots
    const insertedPlots = await db
      .insert(plots)
      .values([
        {
          farmId: farm1Id,
          name: "Plot 1 - Roma Tomatoes Sector A",
          acreage: 28.5,
          cropType: "Roma Tomatoes",
          variety: "San Marzano Heirloom Hybrid",
          plantingDate: "2025-02-15",
          expectedHarvestDate: "2025-06-20",
          growthStage: "Fruit Formation",
          healthStatus: "Good",
          soilType: "Sandy Loam",
        },
        {
          farmId: farm1Id,
          name: "Plot 2 - Sweet Corn (Maize)",
          acreage: 42.0,
          cropType: "Corn (Maize)",
          variety: "Golden Bantam Ultra-Sweet",
          plantingDate: "2025-03-01",
          expectedHarvestDate: "2025-07-10",
          growthStage: "Vegetative",
          healthStatus: "Excellent",
          soilType: "Rich Loam",
        },
        {
          farmId: farm1Id,
          name: "Plot 3 - Bell Peppers Block C",
          acreage: 18.0,
          cropType: "Bell Peppers",
          variety: "California Wonder King",
          plantingDate: "2025-02-28",
          expectedHarvestDate: "2025-06-30",
          growthStage: "Flowering",
          healthStatus: "Good",
          soilType: "Loamy Silt",
        },
        {
          farmId: farm2Id,
          name: "Field West 4 - Winter Wheat",
          acreage: 110.0,
          cropType: "Winter Wheat",
          variety: "Hard Red Cal-Winter 202",
          plantingDate: "2024-11-10",
          expectedHarvestDate: "2025-05-25",
          growthStage: "Maturity",
          healthStatus: "Needs Attention",
          soilType: "Clay Loam",
        },
        {
          farmId: farm2Id,
          name: "Field East 5 - Soybeans Cover Crop",
          acreage: 85.0,
          cropType: "Soybeans",
          variety: "Nitrogen-Fixer Pro 90",
          plantingDate: "2025-03-12",
          expectedHarvestDate: "2025-08-01",
          growthStage: "Vegetative",
          healthStatus: "Excellent",
          soilType: "Deep Alluvial Loam",
        },
      ])
      .returning();

    // 4. Insert Soil Records
    await db.insert(soilRecords).values([
      {
        plotId: insertedPlots[0].id,
        nitrogen: 94.5,
        phosphorus: 68.2,
        potassium: 135.0,
        ph: 6.4,
        moisture: 24.8,
        organicMatter: 3.9,
        electricalConductivity: 1.15,
        temperature: 20.8,
        notes: "Good mycorrhizal activity; balanced NPK ratio following compost tea application.",
      },
      {
        plotId: insertedPlots[1].id,
        nitrogen: 122.0,
        phosphorus: 55.4,
        potassium: 78.6,
        ph: 6.6,
        moisture: 26.2,
        organicMatter: 4.2,
        electricalConductivity: 1.3,
        temperature: 22.1,
        notes: "Strong vegetative surge; high organic matter buffering soil moisture efficiently.",
      },
      {
        plotId: insertedPlots[2].id,
        nitrogen: 88.0,
        phosphorus: 62.0,
        potassium: 110.0,
        ph: 6.5,
        moisture: 22.4,
        organicMatter: 3.6,
        electricalConductivity: 1.1,
        temperature: 21.5,
        notes: "Flower set beginning; recommended light potassium top-dressing.",
      },
      {
        plotId: insertedPlots[3].id,
        nitrogen: 58.0,
        phosphorus: 38.5,
        potassium: 42.0,
        ph: 7.1,
        moisture: 18.2,
        organicMatter: 2.8,
        electricalConductivity: 1.6,
        temperature: 23.4,
        notes: "Moisture on lower threshold; potential nitrogen deficiency signs on lower canopy.",
      },
      {
        plotId: insertedPlots[4].id,
        nitrogen: 45.0,
        phosphorus: 52.0,
        potassium: 95.0,
        ph: 6.7,
        moisture: 27.5,
        organicMatter: 4.1,
        electricalConductivity: 1.05,
        temperature: 21.0,
        notes: "Excellent nodulation on roots; active nitrogen fixation confirmed.",
      },
    ]);

    // 5. Insert Disease Scans
    await db.insert(diseaseScans).values([
      {
        farmId: farm1Id,
        plotId: insertedPlots[0].id,
        userId: farmerId,
        cropName: "Roma Tomato",
        imageUrl: "/images/diseases/tomato-early-blight.jpg",
        detectedDisease: "Early Blight (Alternaria solani)",
        confidence: 0.964,
        severity: "Moderate",
        affectedArea: 18.4,
        pathogenType: "Fungal",
        symptoms: "Target-like concentric brown spots on lower leaves with yellow halos.",
        organicRemedy: "Apply Bacillus subtilis (Serenade) @ 4L/ha and prune lower 12 inches foliage.",
        chemicalRemedy: "Apply Chlorothalonil 720g/L @ 2.0 L/ha or Azoxystrobin.",
        preventiveAction: "Ensure drip lines do not splash soil onto foliage; increase airflow.",
        status: "In Treatment",
      },
      {
        farmId: farm1Id,
        plotId: insertedPlots[1].id,
        userId: farmerId,
        cropName: "Sweet Corn (Maize)",
        imageUrl: "/images/diseases/corn-leaf-blight.jpg",
        detectedDisease: "Northern Corn Leaf Blight (Exserohilum turcicum)",
        confidence: 0.948,
        severity: "Mild",
        affectedArea: 8.5,
        pathogenType: "Fungal",
        symptoms: "Cigar-shaped tan lesions along mid-canopy leaves.",
        organicRemedy: "Bio-stimulant kelp extract + Double Nickel 55 foliar spray.",
        chemicalRemedy: "Priaxor fungicide @ 300 ml/ha applied at VT stage.",
        preventiveAction: "Shred and till post-harvest stalks to break spore cycle.",
        status: "Detected",
      },
      {
        farmId: farm1Id,
        plotId: insertedPlots[2].id,
        userId: farmerId,
        cropName: "Bell Peppers",
        imageUrl: "/images/diseases/healthy-crop.jpg",
        detectedDisease: "No Disease Detected (Healthy Foliage)",
        confidence: 0.988,
        severity: "None",
        affectedArea: 0.0,
        pathogenType: "Healthy",
        symptoms: "Intact cuticle, vibrant green coloration, no leaf necrosis or chlorosis.",
        organicRemedy: "Continue preventative seaweed extract foliar regime.",
        chemicalRemedy: "No chemical action required.",
        preventiveAction: "Maintain scout trapping and optimal drip schedule.",
        status: "Resolved",
      },
      {
        farmId: farm2Id,
        plotId: insertedPlots[3].id,
        userId: farmerId,
        cropName: "Winter Wheat",
        imageUrl: "/images/diseases/apple-scab.jpg",
        detectedDisease: "Wheat Stripe Rust (Puccinia striiformis)",
        confidence: 0.923,
        severity: "Moderate",
        affectedArea: 16.2,
        pathogenType: "Fungal",
        symptoms: "Yellow-orange pustules in linear rows on upper leaf blade.",
        organicRemedy: "Potassium silicate foliar spray to fortify plant cell walls.",
        chemicalRemedy: "Tebuconazole 250 EW @ 0.75 L/ha before full flag leaf.",
        preventiveAction: "Eradicate volunteer cereal grass weeds on borders.",
        status: "In Treatment",
      },
    ]);

    // 6. Insert Crop Recommendations
    await db.insert(cropRecommendations).values([
      {
        farmId: farm1Id,
        userId: farmerId,
        soilType: "Sandy Loam",
        nitrogen: 95.0,
        phosphorus: 68.0,
        potassium: 135.0,
        ph: 6.4,
        rainfall: 520.0,
        temperature: 22.5,
        humidity: 62.0,
        topRecommendation: "Roma Tomatoes",
        confidenceScore: 0.96,
        expectedYieldPerAcre: 28.5,
        estimatedRoi: 185,
        waterRequirement: "Moderate & Uniform Drip",
        growingDurationDays: 85,
        rankedAlternatives: JSON.stringify([
          { crop: "Roma Tomatoes", matchScore: 96, expectedYieldPerAcre: 28.5, estimatedRevenuePerAcre: 12825 },
          { crop: "Bell Peppers", matchScore: 91, expectedYieldPerAcre: 14.2, estimatedRevenuePerAcre: 11644 },
          { crop: "Corn (Maize)", matchScore: 84, expectedYieldPerAcre: 4.8, estimatedRevenuePerAcre: 1032 },
          { crop: "Soybeans", matchScore: 78, expectedYieldPerAcre: 1.8, estimatedRevenuePerAcre: 882 },
        ]),
      },
      {
        farmId: farm2Id,
        userId: farmerId,
        soilType: "Clay Loam",
        nitrogen: 115.0,
        phosphorus: 55.0,
        potassium: 75.0,
        ph: 6.6,
        rainfall: 620.0,
        temperature: 24.0,
        humidity: 58.0,
        topRecommendation: "Corn (Maize)",
        confidenceScore: 0.94,
        expectedYieldPerAcre: 4.9,
        estimatedRoi: 142,
        waterRequirement: "Moderate to High (500-800 mm)",
        growingDurationDays: 110,
        rankedAlternatives: JSON.stringify([
          { crop: "Corn (Maize)", matchScore: 94, expectedYieldPerAcre: 4.9, estimatedRevenuePerAcre: 1053 },
          { crop: "Soybeans", matchScore: 88, expectedYieldPerAcre: 1.9, estimatedRevenuePerAcre: 931 },
          { crop: "Winter Wheat", matchScore: 82, expectedYieldPerAcre: 3.2, estimatedRevenuePerAcre: 832 },
        ]),
      },
    ]);

    // 7. Insert Yield Predictions
    await db.insert(yieldPredictions).values([
      {
        farmId: farm1Id,
        plotId: insertedPlots[0].id,
        crop: "Roma Tomatoes",
        acreage: 28.5,
        predictedYieldTons: 842.0,
        yieldPerAcreTons: 29.5,
        historicalAverageTons: 812.2,
        weatherFactorScore: 92.0,
        soilHealthFactorScore: 94.0,
        riskFactors: "Minor fungal spore load detected in Sector A; monitor humidity spikes.",
        recommendations: "Maintain calcium nitrate fertigation to prevent blossom end rot; harvest window peak in 32 days.",
        marketValueEstimate: 378900,
        harvestWindow: "June 15 - June 25, 2025",
      },
      {
        farmId: farm1Id,
        plotId: insertedPlots[1].id,
        crop: "Corn (Maize)",
        acreage: 42.0,
        predictedYieldTons: 205.8,
        yieldPerAcreTons: 4.9,
        historicalAverageTons: 201.6,
        weatherFactorScore: 95.0,
        soilHealthFactorScore: 91.0,
        riskFactors: "High temperature forecast during tassel emergence; ensure irrigation pre-soak.",
        recommendations: "Apply side-dress nitrogen boost at V8 growth stage.",
        marketValueEstimate: 44247,
        harvestWindow: "July 05 - July 15, 2025",
      },
      {
        farmId: farm2Id,
        plotId: insertedPlots[3].id,
        crop: "Winter Wheat",
        acreage: 110.0,
        predictedYieldTons: 319.0,
        yieldPerAcreTons: 2.9,
        historicalAverageTons: 341.0,
        weatherFactorScore: 81.0,
        soilHealthFactorScore: 79.0,
        riskFactors: "Soil moisture deficit (18.2%) and stripe rust pressure impacting head fill.",
        recommendations: "Execute supplemental pivot irrigation cycle and fungicide application within 48 hours.",
        marketValueEstimate: 82940,
        harvestWindow: "May 20 - June 01, 2025",
      },
    ]);

    // 8. Insert Fertilizer Plans
    await db.insert(fertilizerPlans).values([
      {
        farmId: farm1Id,
        plotId: insertedPlots[0].id,
        crop: "Roma Tomatoes",
        growthStage: "Fruit Formation",
        currentN: 94.5,
        currentP: 68.2,
        currentK: 135.0,
        recommendedNPKRatio: "5:2:8 High-Potassium Fertigation",
        fertilizerType: "Calcium Nitrate + Potassium Sulfate (0-0-50)",
        dosageKgPerAcre: 35.0,
        organicAlternative: "Liquid Bone Meal extract with Composted Fish Hydrolysate",
        applicationMethod: "Precision Drip Fertigation System",
        scheduledDate: "2025-05-18",
        status: "Planned",
      },
      {
        farmId: farm1Id,
        plotId: insertedPlots[1].id,
        crop: "Corn (Maize)",
        growthStage: "Vegetative V6",
        currentN: 122.0,
        currentP: 55.4,
        currentK: 78.6,
        recommendedNPKRatio: "12:4:6 Nitrogen Boost",
        fertilizerType: "Urea 46-0-0 + Ammonium Sulfate",
        dosageKgPerAcre: 48.0,
        organicAlternative: "Blood Meal (12-0-0) top-dress",
        applicationMethod: "Coulter Knife Banded Side-dress",
        scheduledDate: "2025-05-22",
        status: "Planned",
      },
    ]);

    // 9. Insert Irrigation Schedules
    await db.insert(irrigationSchedules).values([
      {
        farmId: farm1Id,
        plotId: insertedPlots[0].id,
        waterVolumeLiters: 92000,
        durationMinutes: 75,
        method: "Subsurface Drip",
        soilMoistureBefore: 24.8,
        et0Reference: 4.8,
        rainForecastMm: 0.0,
        recommendedTime: "05:00 AM",
        status: "Scheduled",
      },
      {
        farmId: farm1Id,
        plotId: insertedPlots[1].id,
        waterVolumeLiters: 145000,
        durationMinutes: 90,
        method: "Drip Tape",
        soilMoistureBefore: 26.2,
        et0Reference: 5.1,
        rainForecastMm: 0.0,
        recommendedTime: "05:45 AM",
        status: "Scheduled",
      },
      {
        farmId: farm2Id,
        plotId: insertedPlots[3].id,
        waterVolumeLiters: 420000,
        durationMinutes: 160,
        method: "Center Pivot",
        soilMoistureBefore: 18.2,
        et0Reference: 5.4,
        rainForecastMm: 1.2,
        recommendedTime: "21:30 PM",
        status: "Scheduled",
      },
    ]);

    // 10. Insert Notifications & Alerts
    await db.insert(notifications).values([
      {
        userId: farmerId,
        farmId: farm1Id,
        title: "Early Blight Warning in Sector A",
        message: "AI Vision detected Early Blight (96.4% confidence) on Roma Tomatoes. Fungicide treatment recommended within 48h.",
        type: "warning",
        category: "disease",
        isRead: false,
      },
      {
        userId: farmerId,
        farmId: farm2Id,
        title: "Low Soil Moisture in Field West 4",
        message: "Soil moisture dropped to 18.2% in Winter Wheat plot. Automated irrigation cycle queued for 21:30 PM.",
        type: "critical",
        category: "irrigation",
        isRead: false,
      },
      {
        userId: farmerId,
        farmId: farm1Id,
        title: "Weather Alert: Peak Heat Index",
        message: "Temperatures expected to reach 34°C (93°F) on Thursday. ET0 rates will peak at 6.2 mm/day.",
        type: "warning",
        category: "weather",
        isRead: false,
      },
      {
        userId: farmerId,
        farmId: farm1Id,
        title: "Yield Model Updated: +3.6% Forecast",
        message: "Optimal nitrogen retention in Plot 2 resulted in an upward revision of expected Corn yield to 205.8 Tons.",
        type: "success",
        category: "market",
        isRead: true,
      },
    ]);

    // 11. Insert Model Metrics Logs
    await db.insert(modelMetrics).values([
      {
        modelName: "AgriVision-DiseaseNet-v2.4",
        taskType: "disease_detection",
        inferenceTimeMs: 142.5,
        confidenceScore: 0.964,
        inputSummary: "Leaf imagery / Roma Tomato / 1024x1024 RGB",
        predictionResult: "Early Blight (Alternaria solani) - 96.4%",
        driftScore: 0.021,
      },
      {
        modelName: "CropRecommender-Ensemble-v3.1",
        taskType: "crop_recommendation",
        inferenceTimeMs: 48.2,
        confidenceScore: 0.960,
        inputSummary: "Soil N:95 P:68 K:135 pH:6.4 Rain:520mm Temp:22.5C",
        predictionResult: "Roma Tomatoes (Match 96%)",
        driftScore: 0.018,
      },
      {
        modelName: "YieldForecaster-XGBoost-v1.8",
        taskType: "yield_forecasting",
        inferenceTimeMs: 64.7,
        confidenceScore: 0.935,
        inputSummary: "Roma Tomatoes 28.5 Acres SoilIndex:94 WeatherIndex:92",
        predictionResult: "842.0 Tons (29.5 Ton/Acre)",
        driftScore: 0.034,
      },
      {
        modelName: "HydroSmart-ET0-v2.0",
        taskType: "irrigation_optim",
        inferenceTimeMs: 31.0,
        confidenceScore: 0.978,
        inputSummary: "SoilMoisture:24.8% ET0:4.8mm CropKc:1.15",
        predictionResult: "92,000 Liters / 75 min Drip Schedule",
        driftScore: 0.012,
      },
    ]);

    console.log("Agricultural demo database successfully seeded!");
    return { message: "Database seeded successfully", seeded: true };
  } catch (error) {
    console.error("Error during database seed:", error);
    throw error;
  }
}
