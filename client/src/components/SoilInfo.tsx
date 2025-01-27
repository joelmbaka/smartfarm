import { Box, Card, CardContent, Typography, CircularProgress, Button, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { getSoilData } from '../services/soilService';

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

interface Props {
  latitude: number;
  longitude: number;
  onAnalyze: () => void;
  analyzing: boolean;
}

export default function SoilInfo({ latitude, longitude, onAnalyze, analyzing }: Props) {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);

  const fetchSoilData = async () => {
    try {
      setError(null);
      const data = await getSoilData(latitude, longitude);
      setSoilData(data);
      setShowData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch soil data');
    }
  };

  const PreviewCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Available Analysis Data
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The analysis will provide detailed information about:
        </Typography>

        <Typography variant="h6" gutterBottom color="primary">
          Soil Properties
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">• Soil Type</Typography>
          <Typography variant="body2" color="text.secondary">• pH Level</Typography>
          <Typography variant="body2" color="text.secondary">• Organic Matter Content</Typography>
          <Typography variant="body2" color="text.secondary">• Drainage Characteristics</Typography>
          <Typography variant="body2" color="text.secondary">• NPK Values</Typography>
        </Box>

        <Typography variant="h6" gutterBottom color="primary">
          Climate Data
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">• Temperature Range</Typography>
          <Typography variant="body2" color="text.secondary">• Humidity Levels</Typography>
          <Typography variant="body2" color="text.secondary">• Rainfall Measurements</Typography>
          <Typography variant="body2" color="text.secondary">• Growing Season Length</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (!showData) {
    return <PreviewCard />;
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', textAlign: 'center', py: 2 }}>
        <Typography variant="body1">{error}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchSoilData} 
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!soilData) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Soil Information
        </Typography>
        
        <Typography variant="body1">
          <strong>Soil Type:</strong> {soilData.soil.soilType}
        </Typography>
        
        <Typography variant="body1">
          <strong>pH Level:</strong> {soilData.soil.ph.toFixed(2)}
        </Typography>
        
        <Typography variant="body1">
          <strong>Organic Matter:</strong> {soilData.soil.organicMatter.toFixed(2)}%
        </Typography>
        
        <Typography variant="body1">
          <strong>Drainage:</strong> {soilData.soil.drainage}
        </Typography>
        
        <Typography variant="body1">
          <strong>NPK Values:</strong>
        </Typography>
        <Typography variant="body2" sx={{ pl: 2 }}>
          Nitrogen: {soilData.soil.nitrogen.toFixed(2)}%
          <br />
          Phosphorus: {soilData.soil.phosphorus.toFixed(2)}%
          <br />
          Potassium: {soilData.soil.potassium.toFixed(2)}%
        </Typography>
        
        <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
          Climate Information
        </Typography>
        
        <Typography variant="body1">
          <strong>Temperature:</strong>
        </Typography>
        <Typography variant="body2" sx={{ pl: 2 }}>
          Current: {soilData.climate.temperature.current.toFixed(1)}°C
          <br />
          Min: {soilData.climate.temperature.min.toFixed(1)}°C
          <br />
          Max: {soilData.climate.temperature.max.toFixed(1)}°C
        </Typography>
        
        <Typography variant="body1">
          <strong>Humidity:</strong> {soilData.climate.humidity.toFixed(1)}%
        </Typography>
        
        <Typography variant="body1">
          <strong>Rainfall:</strong> {soilData.climate.rainfall.toFixed(1)}mm
        </Typography>
        
        <Typography variant="body1">
          <strong>Growing Season:</strong> {soilData.climate.growingSeasonLength} days
        </Typography>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => setShowData(false)}
            sx={{ minWidth: 200 }}
          >
            Check Another Location
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 