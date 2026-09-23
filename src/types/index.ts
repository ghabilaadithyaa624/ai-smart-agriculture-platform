export type UserRole = "farmer" | "agronomist" | "agribusiness" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  organization?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Farm {
  id: number;
  userId: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  totalAcreage: number;
  climateZone: string;
  waterSource: string;
  status: "active" | "fallow" | "harvesting";
  createdAt: string;
  plotCount?: number;
  crops?: string[];
  cultivatedAcreage?: number;
}

export interface Plot {
  id: number;
  farmId: number;
  name: string;
  acreage: number;
  cropType: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  healthStatus: "Excellent" | "Good" | "Needs Attention" | "Critical";
  soilType: string;
  createdAt: string;
  farmName?: string;
  latestSoil?: SoilRecord | null;
}

export interface SoilRecord {
  id: number;
  plotId: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  organicMatter: number;
  electricalConductivity: number;
  temperature: number;
  notes?: string | null;
  testedAt: string;
  plotName?: string;
  cropType?: string;
  farmId?: number | null;
}

export interface DiseaseScan {
  id: number;
  farmId?: number | null;
  plotId?: number | null;
  userId: number;
  cropName: string;
  imageUrl: string;
  detectedDisease: string;
  confidence: number;
  severity: "Mild" | "Moderate" | "Severe" | "None";
  affectedArea: number;
  pathogenType: "Fungal" | "Bacterial" | "Viral" | "Physiological" | "Healthy";
  symptoms: string;
  organicRemedy: string;
  chemicalRemedy: string;
  preventiveAction: string;
  status: "Detected" | "In Treatment" | "Resolved";
  createdAt: string;
}

export interface CropRecommendation {
  id: number;
  farmId?: number | null;
  userId: number;
  soilType: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  rainfall: number;
  temperature: number;
  humidity: number;
  topRecommendation: string;
  confidenceScore: number;
  expectedYieldPerAcre: number;
  estimatedRoi: number;
  waterRequirement: string;
  growingDurationDays: number;
  rankedAlternatives: string;
  createdAt: string;
}

export interface YieldPrediction {
  id: number;
  farmId: number;
  plotId?: number | null;
  crop: string;
  acreage: number;
  predictedYieldTons: number;
  yieldPerAcreTons: number;
  historicalAverageTons: number;
  weatherFactorScore: number;
  soilHealthFactorScore: number;
  riskFactors: string;
  recommendations: string;
  marketValueEstimate: number;
  harvestWindow: string;
  createdAt: string;
}

export interface FertilizerPlan {
  id: number;
  farmId: number;
  plotId?: number | null;
  crop: string;
  growthStage: string;
  currentN: number;
  currentP: number;
  currentK: number;
  recommendedNPKRatio: string;
  fertilizerType: string;
  dosageKgPerAcre: number;
  organicAlternative: string;
  applicationMethod: string;
  scheduledDate: string;
  status: "Planned" | "Applied" | "Deferred";
  createdAt: string;
}

export interface IrrigationSchedule {
  id: number;
  farmId: number;
  plotId: number;
  waterVolumeLiters: number;
  durationMinutes: number;
  method: string;
  soilMoistureBefore: number;
  et0Reference: number;
  rainForecastMm: number;
  recommendedTime: string;
  status: "Scheduled" | "Completed" | "Deferred";
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId?: number | null;
  farmId?: number | null;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "critical";
  category: "weather" | "disease" | "soil" | "irrigation" | "market" | "general";
  isRead: boolean;
  createdAt: string;
}

export interface ModelMetricLog {
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
