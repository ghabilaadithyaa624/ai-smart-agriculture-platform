export interface FarmWeather {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number; // %
  rainfallMm: number; // 24h precipitation
  windSpeedKmH: number;
  windDirection: string;
  solarRadiationWm2: number;
  et0EvapotranspirationMm: number;
  uvIndex: number;
  soilTemperatureC: number;
  condition: string;
  conditionIcon: "sun" | "cloud-sun" | "rain" | "cloud-rain" | "wind";
  alerts: Array<{
    severity: "low" | "medium" | "high";
    title: string;
    description: string;
  }>;
  forecast: Array<{
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    humidity: number;
    rainProb: number;
    rainMm: number;
    et0: number;
    condition: string;
    conditionIcon: "sun" | "cloud-sun" | "rain" | "cloud-rain";
  }>;
  hourlyForecast: Array<{
    hour: string;
    temp: number;
    humidity: number;
    rainProb: number;
    et0Rate: number;
  }>;
}

export function getFarmWeatherData(locationName: string = "Salinas Valley, CA"): FarmWeather {
  return {
    locationName,
    latitude: 36.6777,
    longitude: -121.6555,
    temperature: 23.4,
    feelsLike: 23.1,
    tempMin: 14.2,
    tempMax: 26.8,
    humidity: 58,
    rainfallMm: 0.0,
    windSpeedKmH: 14.2,
    windDirection: "WNW (290°)",
    solarRadiationWm2: 685,
    et0EvapotranspirationMm: 4.85,
    uvIndex: 7,
    soilTemperatureC: 19.8,
    condition: "Partly Sunny & Mild",
    conditionIcon: "cloud-sun",
    alerts: [
      {
        severity: "medium",
        title: "High Evapotranspiration Window",
        description: "ET0 rate will peak at 0.65 mm/h between 12:00 - 15:00. Recommend pre-soak or early morning fertigation.",
      },
    ],
    forecast: [
      {
        day: "Today",
        date: "May 16",
        tempMax: 27,
        tempMin: 14,
        humidity: 58,
        rainProb: 5,
        rainMm: 0.0,
        et0: 4.9,
        condition: "Partly Sunny",
        conditionIcon: "cloud-sun",
      },
      {
        day: "Fri",
        date: "May 17",
        tempMax: 28,
        tempMin: 15,
        humidity: 52,
        rainProb: 10,
        rainMm: 0.0,
        et0: 5.2,
        condition: "Sunny & Warm",
        conditionIcon: "sun",
      },
      {
        day: "Sat",
        date: "May 18",
        tempMax: 31,
        tempMin: 16,
        humidity: 48,
        rainProb: 15,
        rainMm: 0.2,
        et0: 5.8,
        condition: "Clear Sky",
        conditionIcon: "sun",
      },
      {
        day: "Sun",
        date: "May 19",
        tempMax: 29,
        tempMin: 15,
        humidity: 62,
        rainProb: 35,
        rainMm: 2.1,
        et0: 4.4,
        condition: "Passing Clouds",
        conditionIcon: "cloud-sun",
      },
      {
        day: "Mon",
        date: "May 20",
        tempMax: 24,
        tempMin: 13,
        humidity: 75,
        rainProb: 65,
        rainMm: 8.5,
        et0: 3.2,
        condition: "Light Rain Expected",
        conditionIcon: "cloud-rain",
      },
      {
        day: "Tue",
        date: "May 21",
        tempMax: 22,
        tempMin: 12,
        humidity: 70,
        rainProb: 40,
        rainMm: 3.0,
        et0: 3.6,
        condition: "Scattered Showers",
        conditionIcon: "rain",
      },
      {
        day: "Wed",
        date: "May 22",
        tempMax: 25,
        tempMin: 14,
        humidity: 60,
        rainProb: 10,
        rainMm: 0.0,
        et0: 4.7,
        condition: "Clearing & Pleasant",
        conditionIcon: "sun",
      },
    ],
    hourlyForecast: [
      { hour: "06:00", temp: 15.2, humidity: 82, rainProb: 0, et0Rate: 0.05 },
      { hour: "09:00", temp: 19.5, humidity: 68, rainProb: 0, et0Rate: 0.28 },
      { hour: "12:00", temp: 24.8, humidity: 54, rainProb: 5, et0Rate: 0.62 },
      { hour: "15:00", temp: 26.5, humidity: 50, rainProb: 5, et0Rate: 0.65 },
      { hour: "18:00", temp: 23.0, humidity: 60, rainProb: 10, et0Rate: 0.35 },
      { hour: "21:00", temp: 18.2, humidity: 74, rainProb: 5, et0Rate: 0.08 },
    ],
  };
}
