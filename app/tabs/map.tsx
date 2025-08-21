import React, { useRef } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';

// A balanced and detailed map style for better readability
const mapStyle = [{"featureType":"poi.business","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#a1c4fd"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#e0e0e0"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#c0c0c0"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#f0f0f0"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":2.5}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#f5f5f5"}]}];

export default function Map() {
  const mapRef = useRef<MapView>(null);

  // Coordinates for the center of Jaipur
  const jaipurRegion = {
    latitude: 26.9124,
    longitude: 75.7873,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleZoom = async (direction: 'in' | 'out') => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.zoom += (direction === 'in' ? 1 : -1);
      mapRef.current?.animateCamera(camera, { duration: 300 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={jaipurRegion}
        customMapStyle={mapStyle}
      >
        {/* Example Marker */}
        <Marker
          coordinate={{ latitude: 26.9124, longitude: 75.7873 }}
          title="Jaipur"
          description="The Pink City"
        />
      </MapView>
      
      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('in')}>
            <Feather name="plus" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('out')}>
            <Feather name="minus" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
});