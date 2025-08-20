import React from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar } from 'react-native';

// A URL for a clean, professional, and lightweight map tile from Stamen Design.
const MAP_IMAGE_URL = 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/10/515/366.png';

export default function Map() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Use ImageBackground to display the map */}
      <ImageBackground
        source={{ uri: MAP_IMAGE_URL }}
        style={styles.mapBackground}
        resizeMode="cover"
      >
        {/* Add a semi-transparent overlay to make the text readable */}
        <View style={styles.overlay}>
          <Text style={styles.title}>KYA KARE ISKA</Text>
          <Text style={styles.subtitle}>.</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000', // A fallback background color
  },
  mapBackground: {
    flex: 1,
    // Use StyleSheet.absoluteFillObject to ensure it covers the whole screen
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 50% black overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  }
});