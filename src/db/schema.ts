import { pgTable, serial, text, real, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("farmer"), // 'farmer' | 'agronomist' | 'agribusiness' | 'admin'
  phone: text("phone"),
  organization: text("organization"),
  location: text("location"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude").default(36.7468),
  longitude: real("longitude").default(-119.7726),
  totalAcreage: real("total_acreage").notNull(),
  climateZone: text("climate_zone").notNull().default("Temperate / Semi-Arid"),
  waterSource: text("water_source").notNull().default("Deep Well & Drip System"),
  status: text("status").notNull().default("active"), // 'active' | 'fallow' | 'harvesting'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plots = pgTable("plots", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  acreage: real("acreage").notNull(),
  cropType: text("crop_type").notNull(),
  variety: text("variety").notNull(),
  plantingDate: text("planting_date").notNull(),
  expectedHarvestDate: text("expected_harvest_date").notNull(),
  growthStage: text("growth_stage").notNull(), // 'Germination' | 'Vegetative' | 'Flowering' | 'Fruit Formation' | 'Maturity' | 'Harvest Ready'
  healthStatus: text("health_status").notNull().default("Good"), // 'Excellent' | 'Good' | 'Needs Attention' | 'Critical'
  soilType: text("soil_type").notNull().default("Loamy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const soilRecords = pgTable("soil_records", {
  id: serial("id").primaryKey(),
  plotId: integer("plot_id").references(() => plots.id, { onDelete: "cascade" }).notNull(),
  nitrogen: real("nitrogen").notNull(), // mg/kg or ppm
  phosphorus: real("phosphorus").notNull(), // mg/kg
  potassium: real("potassium").notNull(), // mg/kg
  ph: real("ph").notNull(),
  moisture: real("moisture").notNull(), // percentage %
  organicMatter: real("organic_matter").notNull(), // percentage %
  electricalConductivity: real("electrical_conductivity").notNull().default(1.2), // dS/m
  temperature: real("temperature").notNull().default(21.5), // °C
  notes: text("notes"),
  testedAt: timestamp("tested_at").defaultNow().notNull(),
});

export const diseaseScans = pgTable("disease_scans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "cascade" }),
  plotId: integer("plot_id").references(() => plots.id, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  cropName: text("crop_name").notNull(),
  imageUrl: text("image_url").notNull(),
  detectedDisease: text("detected_disease").notNull(),
  confidence: real("confidence").notNull(),
  severity: text("severity").notNull().default("Moderate"), // 'Mild' | 'Moderate' | 'Severe' | 'None'
  affectedArea: real("affected_area").notNull().default(15.0), // %
  pathogenType: text("pathogen_type").notNull().default("Fungal"), // 'Fungal' | 'Bacterial' | 'Viral' | 'Physiological' | 'Healthy'
  symptoms: text("symptoms").notNull(),
  organicRemedy: text("organic_remedy").notNull(),
  chemicalRemedy: text("chemical_remedy").notNull(),
  preventiveAction: text("preventive_action").notNull(),
  status: text("status").notNull().default("Detected"), // 'Detected' | 'In Treatment' | 'Resolved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cropRecommendations = pgTable("crop_recommendations", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  soilType: text("soil_type").notNull(),
  nitrogen: real("nitrogen").notNull(),
  phosphorus: real("phosphorus").notNull(),
  potassium: real("potassium").notNull(),
  ph: real("ph").notNull(),
  rainfall: real("rainfall").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  topRecommendation: text("top_recommendation").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  expectedYieldPerAcre: real("expected_yield_per_acre").notNull(),
  estimatedRoi: real("estimated_roi").notNull(),
  waterRequirement: text("water_requirement").notNull(),
  growingDurationDays: integer("growing_duration_days").notNull(),
  rankedAlternatives: text("ranked_alternatives").notNull(), // JSON string array of { crop, score, roi }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const yieldPredictions = pgTable("yield_predictions", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "cascade" }).notNull(),
  plotId: integer("plot_id").references(() => plots.id, { onDelete: "set null" }),
  crop: text("crop").notNull(),
  acreage: real("acreage").notNull(),
  predictedYieldTons: real("predicted_yield_tons").notNull(),
  yieldPerAcreTons: real("yield_per_acre_tons").notNull(),
  historicalAverageTons: real("historical_average_tons").notNull(),
  weatherFactorScore: real("weather_factor_score").notNull(),
  soilHealthFactorScore: real("soil_health_factor_score").notNull(),
  riskFactors: text("risk_factors").notNull(),
  recommendations: text("recommendations").notNull(),
  marketValueEstimate: real("market_value_estimate").notNull(),
  harvestWindow: text("harvest_window").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fertilizerPlans = pgTable("fertilizer_plans", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "cascade" }).notNull(),
  plotId: integer("plot_id").references(() => plots.id, { onDelete: "set null" }),
  crop: text("crop").notNull(),
  growthStage: text("growth_stage").notNull(),
  currentN: real("current_n").notNull(),
  currentP: real("current_p").notNull(),
  currentK: real("current_k").notNull(),
  recommendedNPKRatio: text("recommended_npk_ratio").notNull(),
  fertilizerType: text("fertilizer_type").notNull(),
  dosageKgPerAcre: real("dosage_kg_per_acre").notNull(),
  organicAlternative: text("organic_alternative").notNull(),
  applicationMethod: text("application_method").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  status: text("status").notNull().default("Planned"), // 'Planned' | 'Applied' | 'Deferred'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const irrigationSchedules = pgTable("irrigation_schedules", {
  id: serial("id").primaryKey(),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "cascade" }).notNull(),
  plotId: integer("plot_id").references(() => plots.id, { onDelete: "cascade" }).notNull(),
  waterVolumeLiters: real("water_volume_liters").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  method: text("method").notNull().default("Drip Line"),
  soilMoistureBefore: real("soil_moisture_before").notNull(),
  et0Reference: real("et0_reference").notNull(),
  rainForecastMm: real("rain_forecast_mm").notNull(),
  recommendedTime: text("recommended_time").notNull(),
  status: text("status").notNull().default("Scheduled"), // 'Scheduled' | 'Completed' | 'Deferred'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  farmId: integer("farm_id").references(() => farms.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // 'info' | 'warning' | 'success' | 'critical'
  category: text("category").notNull().default("general"), // 'weather' | 'disease' | 'soil' | 'irrigation' | 'market'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modelMetrics = pgTable("model_metrics", {
  id: serial("id").primaryKey(),
  modelName: text("model_name").notNull(),
  taskType: text("task_type").notNull(), // 'disease_detection' | 'crop_recommendation' | 'yield_forecasting' | 'irrigation_optim' | 'fertilizer_prescript'
  inferenceTimeMs: real("inference_time_ms").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  inputSummary: text("input_summary").notNull(),
  predictionResult: text("prediction_result").notNull(),
  driftScore: real("drift_score").notNull().default(0.04),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
