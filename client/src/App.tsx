import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import Map from './components/Map';
import SoilInfo from './components/SoilInfo';
import { useState } from 'react';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('Location selected:', { lat, lng });
    setSelectedLocation({ lat, lng });
    setShowAnalysis(false); // Reset analysis when location changes
  };

  const handleAnalyze = async () => {
    if (!selectedLocation) return;
    setAnalyzing(true);
    setShowAnalysis(true);
    // The actual analysis will be handled in SoilInfo component
    setAnalyzing(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Map Section */}
        <Map onLocationSelect={handleLocationSelect} />
        
        {/* Location Info & Analysis Button */}
        <Box 
          sx={{ 
            mt: 2, 
            mb: 3, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          {selectedLocation && (
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

        {/* Soil Info Section */}
        {selectedLocation && (
          <SoilInfo 
            latitude={selectedLocation.lat} 
            longitude={selectedLocation.lng}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
          />
        )}
      </Box>
    </Container>
  );
}