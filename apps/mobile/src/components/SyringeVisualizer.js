import React from 'react';
import { View, Text } from 'react-native';

export function SyringeVisualizer({ drawUnits = 0, maxUnits = 100 }) {
  const height = 200;
  const width = 60;
  const safeUnits = Number.isFinite(drawUnits) ? drawUnits : 0;
  const safeMax = maxUnits > 0 ? maxUnits : 100;
  const fillPercentage = Math.min(safeUnits / safeMax, 1);
  const fillHeight = (height - 30) * fillPercentage;

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Text style={{ color: '#00CFBD', fontWeight: 'bold', marginBottom: 10, fontSize: 14 }}>
        Draw to: {safeUnits.toFixed(1)} Units
      </Text>
      <View style={{ position: 'relative', width, height }}>
        <View
          style={{
            position: 'absolute',
            left: 15,
            top: 15,
            width: 30,
            height: height - 30,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />
        {Array.from({ length: 11 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: 48,
              top: 15 + (i * (height - 30)) / 10,
              width: 8,
              height: 1,
              backgroundColor: '#AAA',
            }}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            left: 17,
            top: height - 15 - fillHeight,
            width: 26,
            height: fillHeight,
            backgroundColor: 'rgba(0, 207, 189, 0.4)',
            borderRadius: 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 10,
            top: height - 15 - fillHeight,
            width: 40,
            height: 3,
            backgroundColor: '#FF4B4B',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 28,
            top: height - 15 - fillHeight,
            width: 4,
            height: fillHeight + 15,
            backgroundColor: '#AAA',
          }}
        />
      </View>
    </View>
  );
}
