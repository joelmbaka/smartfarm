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
  TableRow
} from '@mui/material';
import { getClimateData } from '../services/climateService';

interface ClimateInfoProps {
  location: { lat: number; lng: number } | null;
}

export default function ClimateInfo({ location }: ClimateInfoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [climateData, setClimateData] = useState<any>(null);

  useEffect(() => {
    const fetchClimateData = async () => {
      if (!location) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getClimateData(location.lat, location.lng);
        setClimateData(data);
      } catch (err) {
        setError('Failed to fetch climate data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClimateData();
  }, [location]);

  if (!location) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Climate Information
      </Typography>

      {loading && (
        <Grid container justifyContent="center" sx={{ py: 3 }}>
          <CircularProgress />
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {climateData && !loading && (
        <>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Temperature</Typography>
              <Typography variant="body1">
                Current: {climateData.temperature.current}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Min: {climateData.temperature.min}°C | Max: {climateData.temperature.max}°C
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Rainfall</Typography>
              <Typography variant="body1">
                {climateData.rainfall.daily}mm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Probability: {climateData.rainfall.probability}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2">Humidity</Typography>
              <Typography variant="body1">{climateData.humidity}%</Typography>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            7-Day Forecast
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Temperature (°C)</TableCell>
                  <TableCell align="right">Rainfall (mm)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {climateData.forecast.map((day: any) => (
                  <TableRow key={day.date}>
                    <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{day.temperature.toFixed(1)}</TableCell>
                    <TableCell align="right">{day.rainfall.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
} 