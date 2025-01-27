import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
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
const FALLBACK_POSITION: LatLng = L.latLng(0, 0);
const FALLBACK_ZOOM = 2;

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ initialPosition, onLocationSelect }: { 
  initialPosition: LatLng; 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState<LatLng>(initialPosition);

  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  // Fly to initial position when component mounts
  useEffect(() => {
    if (initialPosition !== FALLBACK_POSITION) {
      map.flyTo(initialPosition, map.getZoom());
    }
  }, [map, initialPosition]);

  // Always render the marker at the current position
  return (
    <Marker 
      position={position} 
      icon={redIcon}
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

const getLocationFromIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.error) {
      throw new Error('IP geolocation failed');
    }
    
    // Log once with clean formatting
    console.log('Location detected:', {
      city: data.city,
      region: data.region,
      country: data.country_name,
      coordinates: `${data.latitude}, ${data.longitude}`
    });
    
    return {
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('IP geolocation failed:', error);
    throw error;
  }
};

export default function Map({ onLocationSelect }: Props) {
  const [mapConfig, setMapConfig] = useState({
    center: FALLBACK_POSITION,
    zoom: FALLBACK_ZOOM
  });
  const [initialPosition, setInitialPosition] = useState<LatLng>(FALLBACK_POSITION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      setIsLoading(true);
      try {
        const location = await getLocationFromIP();
        
        if (!mounted) return;
        
        const pos = L.latLng(location.latitude, location.longitude);
        console.log('Setting marker position:', pos);
        setMapConfig({
          center: pos,
          zoom: 11
        });
        setInitialPosition(pos);
        onLocationSelect(location.latitude, location.longitude);
      } catch (error) {
        console.error('Location services failed:', error);
        if (!mounted) return;
        
        // Fallback to browser geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!mounted) return;
              const { latitude, longitude } = position.coords;
              const pos = L.latLng(latitude, longitude);
              setMapConfig({
                center: pos,
                zoom: 11
              });
              setInitialPosition(pos);
              onLocationSelect(latitude, longitude);
            },
            (geoError) => {
              console.error('Browser geolocation failed:', geoError);
              if (!mounted) return;
              setMapConfig({
                center: FALLBACK_POSITION,
                zoom: FALLBACK_ZOOM
              });
              setInitialPosition(FALLBACK_POSITION);
              onLocationSelect(FALLBACK_POSITION.lat, FALLBACK_POSITION.lng);
            }
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          mb: 2, 
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: 1
        }}
      >
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
          {isLoading ? (
            <>
              <CircularProgress size={16} />
              Detecting location...
            </>
          ) : (
            '📍 Click anywhere on the map or drag the marker to set your location'
          )}
        </Typography>
      </Paper>
      <MapContainer
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          initialPosition={initialPosition} 
          onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </Box>
  );
} 