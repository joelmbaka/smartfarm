import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import Map from './components/Map';
import SoilInfo from './components/SoilInfo';
import ClimateInfo from './components/ClimateInfo';
import { useState } from 'react';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('Location selected:', { lat, lng });
    setSelectedLocation({ lat, lng });
    setAnalyzing(false);
    setIsLoading(false);
  };

  const handleAnalyze = async () => {
    if (!selectedLocation) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Map onLocationSelect={handleLocationSelect} />
        
        <Box sx={{ 
          mt: 2, 
          mb: 3, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}>
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Detecting your location...
            </Typography>
          ) : selectedLocation && (
            <>
              <Typography variant="body2" color="text.secondary">
                Selected Location: {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{ 
                  minWidth: 200,
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
              >
                {analyzing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Analyze Location'
                )}
              </Button>
            </>
          )}
        </Box>

        <SoilInfo 
          latitude={selectedLocation?.lat || 0}
          longitude={selectedLocation?.lng || 0}
          analyzing={analyzing}
          onAnalyze={() => setAnalyzing(false)}
        />
        
        <ClimateInfo 
          location={selectedLocation} 
          analyzing={analyzing}
        />
      </Box>
    </Container>
  );
}