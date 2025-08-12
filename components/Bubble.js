import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

/**
 * Bubble Component (now displays burgers)
 * 
 * Renders a burger emoji instead of a green bubble
 * Each burger has a position (x, y) and size
 * 
 * @param {Object} props - Component properties
 * @param {number} props.x - X coordinate of the burger
 * @param {number} props.y - Y coordinate of the burger
 * @param {number} props.radius - Size parameter (used for positioning)
 * @returns {React.Component} Rendered burger
 */
export default function Bubble({ x, y, radius }) {
  const burgerSize = radius * 2;
  
  return (
    <View
      style={[
        styles.burgerContainer,
        {
          left: x,
          top: y,
          width: burgerSize,
          height: burgerSize,
        },
      ]}
    >
      <Text style={styles.burgerEmoji}>🍔</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  burgerContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  burgerEmoji: {
    fontSize: 50,
    textAlign: 'center',
  },
});
