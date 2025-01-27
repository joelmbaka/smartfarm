import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface SoilData {
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

export async function getSoilData(lat: number, lng: number): Promise<SoilData> {
  try {
    console.log('Fetching soil data for:', { lat, lng });
    const response = await fetch(`${API_BASE_URL}/soil?lat=${lat}&lng=${lng}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error details:', errorData);
      throw new Error(errorData.error || 'Failed to fetch soil data');
    }

    const data = await response.json();
    console.log('Received soil data:', data);
    return data;
  } catch (error) {
    console.error('Error in getSoilData:', error);
    throw error;
  }
}

function calculateAveragePH(phLayer: any): number {
  if (!phLayer || !phLayer.depths) return 0;
  
  // Get values from the first two depths (0-5cm and 5-15cm)
  const topSoilValues = phLayer.depths
    .slice(0, 2)
    .map((depth: any) => depth.values.mean);
  
  // Calculate average and divide by 10 (pH is stored as pH*10)
  const average = topSoilValues.reduce((sum: number, val: number) => sum + val, 0) / topSoilValues.length;
  return average / 10;
}

function calculateOrganicMatter(socLayer: any): number {
  if (!socLayer || !socLayer.depths) return 0;
  
  // Get values from the first two depths
  const topSoilValues = socLayer.depths
    .slice(0, 2)
    .map((depth: any) => depth.values.mean);
  
  // Calculate average and convert to percentage (stored as dg/kg, need to divide by 10)
  const averageSoc = topSoilValues.reduce((sum: number, val: number) => sum + val, 0) / topSoilValues.length;
  return (averageSoc / 10) * 1.724; // Convert to organic matter percentage
}

function determineSoilType(clayLayer: any, siltLayer: any, sandLayer: any): string {
  if (!clayLayer || !siltLayer || !sandLayer) return 'Unknown';

  // Get average values from top layers (0-5cm and 5-15cm)
  const clay = clayLayer.depths[0].values.mean / 10; // Convert from g/kg to percentage
  const silt = siltLayer.depths[0].values.mean / 10;
  const sand = sandLayer.depths[0].values.mean / 10;

  // Simple soil texture classification
  if (clay >= 40) return 'Clay';
  if (silt >= 80) return 'Silt';
  if (sand >= 85) return 'Sand';
  if (clay >= 27 && silt >= 28 && sand <= 45) return 'Clay Loam';
  if (silt >= 50 && clay >= 12 && clay <= 27) return 'Silty Loam';
  return 'Loam';
} 