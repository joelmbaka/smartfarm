import { Box, Card, CardContent, Typography, CircularProgress, Button, Skeleton, Alert, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';
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

export default function SoilInfo({ latitude, longitude, analyzing, onAnalyze }: Props) {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (analyzing) {
      const fetchData = async () => {
        try {
          setError(null);
          setIsLoading(true);
          const data = await getSoilData(latitude, longitude);
          setSoilData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch soil data');
        } finally {
          setIsLoading(false);
          onAnalyze(); // Signal that analysis is complete
        }
      };

      fetchData();
    }
  }, [analyzing, latitude, longitude, onAnalyze]);

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Soil Analysis Results
        </Typography>

        {isLoading && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            my: 3 
          }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Fetching soil data... This may take a few moments.
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Soil Properties */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Soil Properties
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="pH Level" 
                    secondary={soilData ? soilData.soil.ph.toFixed(1) : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Organic Matter (%)" 
                    secondary={soilData ? soilData.soil.organicMatter.toFixed(1) : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Soil Type" 
                    secondary={soilData ? soilData.soil.soilType : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Drainage" 
                    secondary={soilData ? soilData.soil.drainage : '---'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Nutrients */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nutrient Levels
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Nitrogen (N)" 
                    secondary={soilData ? `${soilData.soil.nitrogen} mg/kg` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Phosphorus (P)" 
                    secondary={soilData ? `${soilData.soil.phosphorus} mg/kg` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Potassium (K)" 
                    secondary={soilData ? `${soilData.soil.potassium} mg/kg` : '---'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Terrain */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Terrain Characteristics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Elevation" 
                    secondary={soilData ? `${soilData.terrain.elevation} m` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Slope" 
                    secondary={soilData ? `${soilData.terrain.slope}°` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Soil Depth" 
                    secondary={soilData ? `${soilData.soil.depth} cm` : '---'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
} 