import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function Laser({ x, visible }) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.laser,
        {
          left: x - 1, // Center the 2px wide laser
          height: screenHeight,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  laser: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: '#ff0000',
    shadowColor: '#ff0000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
});