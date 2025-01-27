import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng, Icon } from 'leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

// Custom red marker icon
const redIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// World view as fallback
const FALLBACK_POSITION = L.latLng(-1.2841, 36.8155);
const FALLBACK_ZOOM = 6;
const LOCATION_ZOOM = 9;

interface Position {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
}

function useCurrentPosition() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Try to get location with a short timeout
    const timeoutId = setTimeout(() => {
      if (mounted && !position && !error) {
        console.log('Location timeout - using fallback');
        setLoading(false);
        // Create a proper Position object
        setPosition({
          coords: {
            latitude: FALLBACK_POSITION.lat,
            longitude: FALLBACK_POSITION.lng,
            accuracy: 0,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
      }
    }, 5000);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mounted) {
            console.log('Location detected:', {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: `${pos.coords.accuracy} meters`
            });
            setPosition(pos);
            setLoading(false);
          }
        },
        (err) => {
          if (mounted) {
            console.warn('Geolocation error:', err.message);
            setError(err);
            setLoading(false);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 300000
        }
      );
    } else {
      setError(new Error('Geolocation not supported') as GeolocationPositionError);
      setLoading(false);
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return { position, error, loading };
}

function LocationMarker({ initialPosition, onLocationSelect }: { 
  initialPosition: L.LatLng; 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState(initialPosition);
  const map = useMap();

  // Handle map clicks
  useEffect(() => {
    map.on('click', (e) => {
      const newPos = e.latlng;
      setPosition(newPos);
      onLocationSelect(newPos.lat, newPos.lng);
    });

    return () => {
      map.off('click');
    };
  }, [map, onLocationSelect]);

  // Update position when initialPosition changes
  useEffect(() => {
    if (!position.equals(initialPosition)) {
      setPosition(initialPosition);
      map.flyTo(initialPosition, map.getZoom(), {
        duration: 1.5
      });
    }
  }, [initialPosition, map]);

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
          onLocationSelect(pos.lat, pos.lng);
        },
      }}
    />
  );
}

export default function Map({ onLocationSelect }: Props) {
  const { position, error, loading } = useCurrentPosition();
  const [mapConfig, setMapConfig] = useState({
    center: FALLBACK_POSITION,
    zoom: FALLBACK_ZOOM
  });

  useEffect(() => {
    if (position && position.coords) {
      const newPos = L.latLng(position.coords.latitude, position.coords.longitude);
      if (!mapConfig.center.equals(newPos)) {
        setMapConfig({
          center: newPos,
          zoom: LOCATION_ZOOM
        });
        onLocationSelect(position.coords.latitude, position.coords.longitude);
      }
    }
  }, [position]);

  return (
    <Box sx={{ mt: 2 }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={16} />
              Detecting location...
            </>
          ) : (
            '📍 Click anywhere on the map to set location or drag the marker'
          )}
        </Typography>
      </Paper>
      <MapContainer
        key={`${mapConfig.center.lat}-${mapConfig.center.lng}-${mapConfig.zoom}`}
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          initialPosition={mapConfig.center} 
          onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </Box>
  );
} 