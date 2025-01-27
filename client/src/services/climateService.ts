import axios from 'axios';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

interface ClimateData {
  temperature: {
    current: number;
    min: number;
    max: number;
  };
  rainfall: {
    daily: number;
    probability: number;
  };
  humidity: number;
  forecast: Array<{
    date: string;
    temperature: number;
    rainfall: number;
  }>;
}

export const getClimateData = async (lat: number, lng: number): Promise<ClimateData> => {
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'temperature_2m,precipitation,relative_humidity_2m',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: 7
      }
    });

    const { hourly, daily } = response.data;

    // Get current values (first entry in hourly data)
    const currentTemp = hourly.temperature_2m[0];
    const currentHumidity = hourly.relative_humidity_2m[0];

    // Process forecast data
    const forecast = daily.time.map((date: string, index: number) => ({
      date,
      temperature: (daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2,
      rainfall: daily.precipitation_sum[index]
    }));

    return {
      temperature: {
        current: currentTemp,
        min: daily.temperature_2m_min[0],
        max: daily.temperature_2m_max[0]
      },
      rainfall: {
        daily: daily.precipitation_sum[0],
        probability: daily.precipitation_probability_max[0]
      },
      humidity: currentHumidity,
      forecast
    };
  } catch (error) {
    console.error('Error fetching climate data:', error);
    throw new Error('Failed to fetch climate data');
  }
}; 