import { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  CircularProgress, 
  Grid, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';
import { getClimateData } from '../services/climateService';

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

interface ClimateInfoProps {
  location: { lat: number; lng: number } | null;
  analyzing: boolean;
}

export default function ClimateInfo({ location, analyzing }: ClimateInfoProps) {
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analyzing && location) {
      const fetchClimateData = async () => {
        setError(null);
        try {
          const data = await getClimateData(location.lat, location.lng);
          setClimateData(data);
        } catch (err) {
          setError('Failed to fetch climate data. Please try again.');
          console.error(err);
        }
      };

      fetchClimateData();
    }
  }, [analyzing, location]);

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Climate Information
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Temperature
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Current" 
                    secondary={climateData ? `${climateData.temperature.current}°C` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Min" 
                    secondary={climateData ? `${climateData.temperature.min}°C` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Max" 
                    secondary={climateData ? `${climateData.temperature.max}°C` : '---'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Precipitation
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Daily Rainfall" 
                    secondary={climateData ? `${climateData.rainfall.daily} mm` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Probability" 
                    secondary={climateData ? `${climateData.rainfall.probability}%` : '---'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Humidity" 
                    secondary={climateData ? `${climateData.humidity}%` : '---'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                7-Day Forecast
              </Typography>
              <List dense>
                {climateData ? (
                  climateData.forecast.slice(0, 3).map((day: { date: string; temperature: number; rainfall: number }, index: number) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={new Date(day.date).toLocaleDateString()} 
                        secondary={`${day.temperature}°C, ${day.rainfall}mm`}
                      />
                    </ListItem>
                  ))
                ) : (
                  Array(3).fill(0).map((_, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Day ${index + 1}`}
                        secondary="---"
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {analyzing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 