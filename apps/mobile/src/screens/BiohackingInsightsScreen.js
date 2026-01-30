import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';

const storage = new AsyncStorageAdapter();

function SimpleChart({ data, label, color = theme.primary }) {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 }}>
        {data.map((point, idx) => {
          const height = ((point.value - minValue) / range) * 70;
          return (
            <View key={idx} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <View
                style={{
                  width: '100%',
                  height: Math.max(4, height),
                  backgroundColor: color,
                  borderRadius: 2,
                  opacity: 0.7
                }}
              />
              <Text style={{ fontSize: 8, color: theme.muted, transform: [{ rotate: '-45deg' }] }}>
                {new Date(point.date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: theme.muted }}>Min: {minValue.toFixed(1)}</Text>
        <Text style={{ fontSize: 10, color: theme.muted }}>Max: {maxValue.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export function BiohackingInsightsScreen() {
  const t = useTranslation();
  const [wellnessMetrics, setWellnessMetrics] = useState({});
  const [protocols, setProtocols] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    (async () => {
      const metrics = await storage.load(STORAGE_KEYS.WELLNESS_METRICS, {});
      const prots = await storage.load(STORAGE_KEYS.PROTOCOLS, []);
      setWellnessMetrics(metrics);
      setProtocols(prots);
      calculateCorrelations(metrics, prots);
    })();
  }, []);

  const calculateCorrelations = (metrics, prots) => {
    if (!metrics || Object.keys(metrics).length === 0) return;
    
    const sortedDates = Object.keys(metrics).sort();
    const recentDates = sortedDates.slice(-dateRange);
    
    const correlationsFound = [];
    
    if (prots.length > 0) {
      const protocolsWithTiming = prots.filter(p => p.timeOfDay && p.timeOfDay !== 'flexible');
      const consistentDays = recentDates.filter(date => {
        return protocolsWithTiming.length > 0;
      });
      
      if (consistentDays.length > 0 && recentDates.length > consistentDays.length) {
        const consistentScores = consistentDays.map(d => metrics[d]?.energy || 0).filter(v => v > 0);
        const inconsistentScores = recentDates
          .filter(d => !consistentDays.includes(d))
          .map(d => metrics[d]?.energy || 0)
          .filter(v => v > 0);
        
        if (consistentScores.length > 0 && inconsistentScores.length > 0) {
          const avgConsistent = consistentScores.reduce((a, b) => a + b, 0) / consistentScores.length;
          const avgInconsistent = inconsistentScores.reduce((a, b) => a + b, 0) / inconsistentScores.length;
          
          if (avgConsistent > avgInconsistent) {
            const improvement = ((avgConsistent - avgInconsistent) / avgInconsistent) * 100;
            correlationsFound.push({
              type: 'timing',
              message: `On days with consistent protocol timing, your energy scores are ${improvement.toFixed(0)}% higher`,
              improvement: improvement
            });
          }
        }
      }
    }
    
    setCorrelations(correlationsFound);
  };

  const getChartData = (metricKey) => {
    const sortedDates = Object.keys(wellnessMetrics)
      .sort()
      .slice(-dateRange)
      .map(date => ({
        date,
        value: wellnessMetrics[date]?.[metricKey] || 0
      }))
      .filter(d => d.value > 0);
    
    return sortedDates;
  };

  const energyData = getChartData('energy');
  const painData = getChartData('pain');

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
          Wellness History
        </Text>
        
        {Object.keys(wellnessMetrics).length === 0 ? (
          <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: 20 }}>
            No wellness data yet. Track your metrics in the Health tab.
          </Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[7, 30, 90].map((days) => (
                <Pressable
                  key={days}
                  onPress={() => setDateRange(days)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: dateRange === days ? theme.primary : theme.card
                  }}
                >
                  <Text style={{ 
                    fontSize: 11, 
                    fontWeight: '700', 
                    color: dateRange === days ? '#fff' : theme.text 
                  }}>
                    {days}d
                  </Text>
                </Pressable>
              ))}
            </View>
            
            {energyData.length > 0 && (
              <SimpleChart data={energyData} label="Energy Level" color={theme.primary} />
            )}
            
            {painData.length > 0 && (
              <SimpleChart data={painData} label="Post-Recovery Pain" color="#DC2626" />
            )}
          </>
        )}
      </Card>

      {correlations.length > 0 && (
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
            Correlation Insights
          </Text>
          {correlations.map((corr, idx) => (
            <View
              key={idx}
              style={{
                padding: 12,
                backgroundColor: '#ECFDF5',
                borderRadius: 12,
                borderLeftWidth: 3,
                borderLeftColor: theme.primary,
                marginBottom: 12
              }}
            >
              <Text style={{ fontSize: 13, color: theme.text, lineHeight: 18 }}>
                {corr.message}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}
