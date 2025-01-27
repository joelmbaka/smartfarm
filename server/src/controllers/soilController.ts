import axios from 'axios';
import { Request, Response } from 'express';
import { SoilCache } from '../models/SoilCache';

const SOILGRIDS_API_URL = 'https://rest.isric.org/soilgrids/v2.0/properties/query';
const ELEVATION_API_URL = 'https://api.open-elevation.com/api/v1/lookup';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_RADIUS = 0.01; // Approximately 1km radius

interface EnhancedSoilData {
  soil: {
    ph: number;
    organicMatter: number;
    soilType: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    drainage: string;
    depth: number;
  };
  terrain: {
    elevation: number;
    slope: number;
  };
  climate: {
    temperature: {
      current: number;
      min: number;
      max: number;
    };
    rainfall: number;
    humidity: number;
    solarRadiation: number;
    windSpeed: number;
    frostDays: number;
    growingSeasonLength: number;
  };
}

type SoilDataRequest = Request<{}, {}, {}, {
  lat?: string;
  lng?: string;
}>;

export const getSoilData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    console.log('Fetching data for coordinates:', { latitude, longitude });

    // Check cache first
    try {
      const cachedData = await SoilCache.findOne({
        latitude: { $gte: latitude - CACHE_RADIUS, $lte: latitude + CACHE_RADIUS },
        longitude: { $gte: longitude - CACHE_RADIUS, $lte: longitude + CACHE_RADIUS }
      });

      if (cachedData) {
        console.log('Returning cached data');
        res.json(cachedData.data);
        return;
      }
    } catch (cacheError) {
      console.error('Cache lookup error:', cacheError);
    }

    // Fetch data from each API with proper error handling
    let soilGridsData, elevationData, weatherData;

    try {
      console.log('Fetching SoilGrids data...');
      const soilResponse = await axios.get(SOILGRIDS_API_URL, {
        params: {
          lat: latitude,
          lon: longitude,
          property: [
            'phh2o',     // pH
            'soc',       // Organic carbon
            'nitrogen',  // Total nitrogen
            'cec',       // Cation exchange capacity (K)
            'bdod',      // Bulk density
            'clay',      // Clay content
            'silt',      // Silt content
            'sand'       // Sand content
          ],
          depth: ['0-5cm', '5-15cm', '15-30cm'],
          value: 'mean'
        },
        timeout: 10000
      });
      soilGridsData = soilResponse.data;
    } catch (error: any) {
      console.error('SoilGrids API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch soil data');
    }

    try {
      console.log('Fetching elevation data...');
      const elevationResponse = await axios.get(ELEVATION_API_URL, {
        params: {
          locations: `${latitude},${longitude}`
        },
        timeout: 5000
      });
      elevationData = elevationResponse.data;
    } catch (error: any) {
      console.error('Elevation API error:', error.response?.data || error.message);
      elevationData = { results: [{ elevation: 0 }] }; // Fallback value
    }

    try {
      console.log('Fetching weather data...');
      const weatherResponse = await axios.get(WEATHER_API_URL, {
        params: {
          latitude,
          longitude,
          hourly: [
            'temperature_2m',
            'relative_humidity_2m',
            'precipitation',
            'wind_speed_10m',
            'direct_radiation',
            'soil_temperature_0cm'
          ],
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'precipitation_probability_max'
          ],
          timezone: 'auto'
        },
        timeout: 5000
      });
      weatherData = weatherResponse.data;
    } catch (error: any) {
      console.error('Weather API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather data');
    }

    // Process all the data
    const processedData = {
      soil: processSoilData(soilGridsData),
      terrain: processElevationData(elevationData),
      climate: processWeatherData(weatherData)
    };

    // Cache the processed data
    try {
      await SoilCache.create({
        latitude,
        longitude,
        data: processedData
      });
      console.log('Data cached successfully');
    } catch (cacheError) {
      console.error('Cache storage error:', cacheError);
      // Continue even if caching fails
    }

    res.json(processedData);
  } catch (error: any) {
    console.error('Controller error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch enhanced soil data',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper functions for data processing
function processSoilData(soilGridsData: any) {
  try {
    const layers = soilGridsData.properties.layers;
    
    const phLayer = layers.find((l: any) => l.name === 'phh2o');
    const socLayer = layers.find((l: any) => l.name === 'soc');
    const nitrogenLayer = layers.find((l: any) => l.name === 'nitrogen');
    const cecLayer = layers.find((l: any) => l.name === 'cec');
    const bdodLayer = layers.find((l: any) => l.name === 'bdod');
    const clayLayer = layers.find((l: any) => l.name === 'clay');
    const siltLayer = layers.find((l: any) => l.name === 'silt');
    const sandLayer = layers.find((l: any) => l.name === 'sand');

    const soilType = determineSoilType(clayLayer, siltLayer, sandLayer);
    const drainage = calculateDrainage(
      clayLayer?.depths?.[0]?.values?.mean ?? 0,
      sandLayer?.depths?.[0]?.values?.mean ?? 0,
      bdodLayer?.depths?.[0]?.values?.mean ?? 1.3
    );

    return {
      ph: phLayer?.depths?.[0]?.values?.mean ? (phLayer.depths[0].values.mean / 10) : 7,
      organicMatter: socLayer?.depths?.[0]?.values?.mean ? (socLayer.depths[0].values.mean * 1.724 / 10) : 2,
      soilType,
      nitrogen: nitrogenLayer?.depths?.[0]?.values?.mean ? (nitrogenLayer.depths[0].values.mean / 10) : 0,
      phosphorus: 0, // Default as it's not directly available
      potassium: cecLayer?.depths?.[0]?.values?.mean ? (cecLayer.depths[0].values.mean / 10) : 0,
      drainage,
      depth: 30
    };
  } catch (error) {
    console.error('Error processing soil data:', error);
    return {
      ph: 7,
      organicMatter: 2,
      soilType: 'Unknown',
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      drainage: 'Moderately-drained',
      depth: 30
    };
  }
}

function processElevationData(elevationData: any) {
  try {
    const elevation = elevationData.results[0].elevation;
    return {
      elevation,
      slope: 0 // Would need neighboring points for actual slope
    };
  } catch (error) {
    console.error('Error processing elevation data:', error);
    return {
      elevation: 0,
      slope: 0
    };
  }
}

function processWeatherData(weatherData: any) {
  try {
    const hourlyData = weatherData.hourly;
    const dailyData = weatherData.daily;
    
    return {
      temperature: {
        current: hourlyData.temperature_2m[0],
        min: Math.min(...dailyData.temperature_2m_min),
        max: Math.max(...dailyData.temperature_2m_max)
      },
      rainfall: dailyData.precipitation_sum[0],
      humidity: calculateAverage(hourlyData.relative_humidity_2m),
      solarRadiation: calculateAverage(hourlyData.direct_radiation),
      windSpeed: calculateAverage(hourlyData.wind_speed_10m),
      frostDays: calculateFrostDays(hourlyData.temperature_2m),
      growingSeasonLength: calculateGrowingSeasonLength(hourlyData.temperature_2m)
    };
  } catch (error) {
    console.error('Error processing weather data:', error);
    return {
      temperature: { current: 20, min: 15, max: 25 },
      rainfall: 0,
      humidity: 60,
      solarRadiation: 0,
      windSpeed: 0,
      frostDays: 0,
      growingSeasonLength: 180
    };
  }
}

// Utility functions
function calculateAverage(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateGrowingSeasonLength(temperatures: number[]): number {
  const dailyAverages = [];
  for (let i = 0; i < temperatures.length; i += 24) {
    const dailyAvg = temperatures.slice(i, i + 24).reduce((sum, t) => sum + t, 0) / 24;
    dailyAverages.push(dailyAvg);
  }
  return dailyAverages.filter(temp => temp > 5).length;
}

function calculateFrostDays(temperatures: number[]): number {
  const dailyMins = [];
  for (let i = 0; i < temperatures.length; i += 24) {
    const dailyMin = Math.min(...temperatures.slice(i, i + 24));
    dailyMins.push(dailyMin);
  }
  return dailyMins.filter(temp => temp < 0).length;
}

function determineSoilType(clayLayer: any, siltLayer: any, sandLayer: any): string {
  try {
    if (!clayLayer?.depths?.[0]?.values?.mean || 
        !siltLayer?.depths?.[0]?.values?.mean || 
        !sandLayer?.depths?.[0]?.values?.mean) {
      return 'Unknown';
    }

    const clay = clayLayer.depths[0].values.mean / 10;
    const silt = siltLayer.depths[0].values.mean / 10;
    const sand = sandLayer.depths[0].values.mean / 10;

    const validClay = Math.min(100, Math.max(0, clay));
    const validSilt = Math.min(100, Math.max(0, silt));
    const validSand = Math.min(100, Math.max(0, sand));

    if (validClay >= 40) return 'Clay';
    if (validSilt >= 80) return 'Silt';
    if (validSand >= 85) return 'Sand';
    if (validClay >= 27 && validSilt >= 28 && validSand <= 45) return 'Clay Loam';
    if (validSilt >= 50 && validClay >= 12 && validClay <= 27) return 'Silty Loam';
    return 'Loam';
  } catch (error) {
    console.error('Error determining soil type:', error);
    return 'Unknown';
  }
}

function calculateDrainage(clay: number, sand: number, bulkDensity: number): string {
  try {
    const validClay = Math.min(100, Math.max(0, clay / 10));
    const validSand = Math.min(100, Math.max(0, sand / 10));
    const validBulkDensity = Math.min(2, Math.max(0.5, bulkDensity / 100));

    if (validSand > 50 && validBulkDensity < 1.4) return 'Well-drained';
    if (validClay > 40) return 'Poorly-drained';
    return 'Moderately-drained';
  } catch (error) {
    console.error('Error calculating drainage:', error);
    return 'Moderately-drained';
  }
} 