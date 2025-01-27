import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng, Icon } from 'leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { Box, Typography, Paper } from '@mui/material';

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
const FALLBACK_POSITION: LatLng = L.latLng(20, 0);
const FALLBACK_ZOOM = 2;

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationSelect }: Props) {
  const [position, setPosition] = useState<LatLng>(FALLBACK_POSITION);

  useMapEvents({
    click(e: { latlng: LatLng }) {
      const { lat, lng } = e.latlng;
      console.log('Map clicked at:', { lat, lng });
      setPosition(e.latlng);
      onLocationSelect(lat, lng);
    },
  });

  const handleDragEnd = (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    console.log('Marker dragged to:', position);
    setPosition(position);
    onLocationSelect(position.lat, position.lng);
  };

  return (
    <Marker 
      position={position} 
      icon={redIcon}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    />
  );
}

export default function Map({ onLocationSelect }: Props) {
  const [mapConfig, setMapConfig] = useState({
    center: FALLBACK_POSITION,
    zoom: FALLBACK_ZOOM
  });

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const { latitude, longitude } = response.data;
        setMapConfig({
          center: L.latLng(latitude, longitude),
          zoom: 6
        });
        // Set initial marker position
        onLocationSelect(latitude, longitude);
      } catch (error) {
        console.log('Failed to get IP location:', error);
      }
    };

    initializeMap();
  }, [onLocationSelect]);

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
            justifyContent: 'center'
          }}
        >
          📍 Click anywhere on the map or drag the marker to set your location
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
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </Box>
  );
} 