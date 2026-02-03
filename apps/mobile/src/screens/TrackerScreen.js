import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, Dimensions } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../ui/theme';
import { useTranslation } from '../hooks/useTranslation';
import { AsyncStorageAdapter } from '../core/storage';
import { STORAGE_KEYS } from '../core/keys';
import { InjectionSiteSelector } from '../components/features/injection-tracker/InjectionSiteSelector';
import { HeartRateChart } from '../components/tracker/HeartRateChart';
import { HeartRateInfoWidget } from '../components/tracker/HeartRateInfoWidget';
import { FeatureCard } from '../components/dashboard/FeatureCard';

const storage = new AsyncStorageAdapter();

function SimpleChart({ data, label, color = theme.primary, unit = '' }) {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const chartHeight = 140;
  const barWidth = 8;
  const barGap = 6;
  
  const recentData = data.slice(-14);
  
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text }}>
          {label}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
            <Text style={{ fontSize: 10, color: theme.muted }}>Last 14 days</Text>
          </View>
        </View>
      </View>
      
      <View style={{ 
        height: chartHeight + 40, 
        backgroundColor: theme.card, 
        borderRadius: 12, 
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, gap: barGap, paddingBottom: 30 }}>
          {recentData.map((point, idx) => {
            const height = maxValue > 0 ? ((point.value - minValue) / range) * (chartHeight - 20) : 0;
            const barHeight = Math.max(barWidth, height);
            const isToday = new Date(point.date).toDateString() === new Date().toDateString();
            const showValue = point.value > 0 && height > 30;
            
            return (
              <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
                {showValue && (
                  <View style={{ 
                    position: 'absolute', 
                    top: -20, 
                    backgroundColor: color, 
                    paddingHorizontal: 4, 
                    paddingVertical: 2, 
                    borderRadius: 4,
                    zIndex: 10
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#000000' }}>
                      {point.value.toFixed(0)}{unit}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    width: barWidth,
                    height: barHeight,
                    backgroundColor: isToday ? color : (point.value > 0 ? color : '#CBD5E1'),
                    borderRadius: 4,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: theme.primary,
                    shadowColor: point.value > 0 ? color : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: point.value > 0 ? 2 : 0
                  }}
                />
                <Text style={{ 
                  fontSize: 9, 
                  color: isToday ? color : theme.muted, 
                  fontWeight: isToday ? '700' : '400',
                  marginTop: 4
                }}>
                  {new Date(point.date).getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0'
        }}>
          <View>
            <Text style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Min
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
              {minValue.toFixed(1)}{unit}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Average
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
              {(recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length).toFixed(1)}{unit}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Max
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>
              {maxValue.toFixed(1)}{unit}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function CalendarView({ selectedDate, onSelectDate, logs }) {
  const t = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const hasLogs = (dateStr) => {
    return logs[dateStr] && logs[dateStr].length > 0;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Pressable onPress={prevMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18, color: theme.primary, fontWeight: '700' }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <Pressable onPress={nextMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18, color: theme.primary, fontWeight: '700' }}>›</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {dayNames.map(day => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.muted }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasDoses = hasLogs(dateStr);

          return (
            <Pressable
              key={idx}
              onPress={() => onSelectDate(dateStr)}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4
              }}
            >
              <View
                style={{
                  width: '90%',
                  aspectRatio: 1,
                  borderRadius: 8,
                  backgroundColor: isSelected ? theme.primary : 'transparent',
                  borderWidth: isToday ? 2 : 0,
                  borderColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isToday || isSelected ? '700' : '400',
                    color: isSelected ? '#fff' : isCurrentMonth ? theme.text : theme.muted
                  }}
                >
                  {day.getDate()}
                </Text>
                {hasDoses && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isSelected ? theme.primary : theme.card
                    }}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TrackerScreen() {
  const t = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [logs, setLogs] = useState({});
  const [protocols, setProtocols] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  const [formData, setFormData] = useState({
    protocolId: '',
    date: today,
    time: new Date().toTimeString().slice(0, 5),
    doseAmount: '',
    units: '',
    injectionSite: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showForm && selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate, showForm]);

  const loadData = async () => {
    const savedLogs = await storage.load(STORAGE_KEYS.PEPTIDE_LOGS, {});
    const savedProtocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);
    setLogs(savedLogs);
    setProtocols(Array.isArray(savedProtocols) ? savedProtocols : []);
  };

  const loadLogsForDate = (date) => {
    return logs[date] || [];
  };

  const saveLogEntry = async (entry) => {
    const allLogs = await storage.load(STORAGE_KEYS.PEPTIDE_LOGS, {});
    const date = entry.date;
    if (!allLogs[date]) {
      allLogs[date] = [];
    }
    
    if (entry.id) {
      const index = allLogs[date].findIndex(log => log.id === entry.id);
      if (index !== -1) {
        allLogs[date][index] = entry;
      }
    } else {
      entry.id = Date.now();
      allLogs[date].push(entry);
    }
    
    await storage.save(STORAGE_KEYS.PEPTIDE_LOGS, allLogs);
    setLogs(allLogs);
  };

  const deleteLogEntry = async (id, date) => {
    const allLogs = await storage.load(STORAGE_KEYS.PEPTIDE_LOGS, {});
    if (allLogs[date]) {
      allLogs[date] = allLogs[date].filter(log => log.id !== id);
      if (allLogs[date].length === 0) {
        delete allLogs[date];
      }
      await storage.save(STORAGE_KEYS.PEPTIDE_LOGS, allLogs);
      setLogs(allLogs);
    }
  };

  const handleSave = async () => {
    if (!formData.protocolId || !formData.doseAmount) {
      return;
    }

    const protocol = protocols.find(p => p.id === Number(formData.protocolId));
    if (!protocol) return;

    const entry = {
      id: editingLog?.id || null,
      protocolId: Number(formData.protocolId),
      protocolName: protocol.name,
      date: formData.date,
      time: formData.time,
      doseAmount: Number(formData.doseAmount),
      units: formData.units ? Number(formData.units) : null,
      injectionSite: formData.injectionSite,
      notes: formData.notes
    };

    await saveLogEntry(entry);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      protocolId: '',
      date: selectedDate,
      time: new Date().toTimeString().slice(0, 5),
      doseAmount: '',
      units: '',
      injectionSite: '',
      notes: ''
    });
    setEditingLog(null);
    setShowForm(false);
  };

  const startEdit = (log) => {
    setEditingLog(log);
    setFormData({
      protocolId: String(log.protocolId),
      date: log.date,
      time: log.time,
      doseAmount: String(log.doseAmount),
      units: log.units ? String(log.units) : '',
      injectionSite: log.injectionSite || '',
      notes: log.notes || ''
    });
    setShowForm(true);
  };

  const calculateCompliance = () => {
    const last30Days = [];
    const todayDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        scheduled: 0,
        taken: logs[dateStr]?.length || 0
      });
    }

    if (Array.isArray(protocols)) {
      protocols.forEach(protocol => {
      let currentDate = new Date(todayDate);
      currentDate.setDate(currentDate.getDate() - 29);
      let daysOnCount = 0;
      let cycleDay = 0;

      for (let i = 0; i < 30; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayIndex = last30Days.findIndex(d => d.date === dateStr);
        
        if (cycleDay < protocol.cycleOn) {
          if (dayIndex !== -1) {
            last30Days[dayIndex].scheduled += 1;
          }
        }
        
        daysOnCount++;
        if (daysOnCount >= protocol.cycleOn + protocol.cycleOff) {
          daysOnCount = 0;
        }
        cycleDay = daysOnCount;
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      });
    }

    return last30Days.map(day => ({
      date: day.date,
      value: day.scheduled > 0 ? (day.taken / day.scheduled) * 100 : 0
    }));
  };

  const getDailyUsageData = () => {
    const last30Days = [];
    const todayDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs[dateStr] || [];
      const totalMcg = dayLogs.reduce((sum, log) => sum + (log.doseAmount || 0), 0);
      last30Days.push({
        date: dateStr,
        value: totalMcg
      });
    }
    return last30Days;
  };

  const getUpcomingDoses = () => {
    const upcoming = [];
    const todayDate = new Date();
    const next7Days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() + i);
      next7Days.push(date.toISOString().split('T')[0]);
    }

    if (Array.isArray(protocols)) {
      protocols.forEach(protocol => {
      let currentDate = new Date(todayDate);
      let daysOnCount = 0;
      let cycleDay = 0;

      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (cycleDay < protocol.cycleOn && next7Days.includes(dateStr)) {
          const existingLogs = logs[dateStr] || [];
          const hasLogForProtocol = existingLogs.some(log => log.protocolId === protocol.id);
          
          if (!hasLogForProtocol) {
            upcoming.push({
              date: dateStr,
              protocolName: protocol.name,
              protocolId: protocol.id,
              timeOfDay: protocol.timeOfDay || 'flexible'
            });
          }
        }
        
        daysOnCount++;
        if (daysOnCount >= protocol.cycleOn + protocol.cycleOff) {
          daysOnCount = 0;
        }
        cycleDay = daysOnCount;
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      });
    }

    return Array.isArray(upcoming) ? upcoming.sort((a, b) => a.date.localeCompare(b.date)) : [];
  };

  const selectedDateLogs = loadLogsForDate(selectedDate);
  const dailyUsageData = getDailyUsageData();
  const complianceData = calculateCompliance();
  const upcomingDoses = getUpcomingDoses();

  const [chartDate, setChartDate] = useState(new Date());
  const formatChartDate = (date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const handlePrevDate = () => {
    const newDate = new Date(chartDate);
    newDate.setDate(newDate.getDate() - 1);
    setChartDate(newDate);
  };
  const handleNextDate = () => {
    const newDate = new Date(chartDate);
    newDate.setDate(newDate.getDate() + 1);
    setChartDate(newDate);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, gap: 16 }}>
      <HeartRateChart
        bpm={88}
        date={formatChartDate(chartDate)}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
      />

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
        <HeartRateInfoWidget title="Heart Rate Range" value="87 bpm" />
        <HeartRateInfoWidget title="Heart Rate Range" value="87 bpm" />
        <HeartRateInfoWidget title="Heart Rate Range" value="87 bpm" />
      </View>

      <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16 }}>
        <FeatureCard
          title="Sport Data"
          description="Keep Active, Keep Healthy"
          icon="📊"
          onPress={() => {}}
        />
        <FeatureCard
          title="Sport Data"
          description="Keep Active, Keep Healthy"
          icon="📊"
          onPress={() => {}}
        />
      </View>

      <View style={{ paddingHorizontal: 16, gap: 16 }}>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
          {t.tracker?.title || 'Peptide Tracker'}
        </Text>
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          logs={logs}
        />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Pressable
            onPress={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.primary,
              borderRadius: 8
            }}
          >
            <Text style={{ color: '#000000', fontWeight: '700', fontSize: 12 }}>
              {t.tracker?.addDose || '+ Add Dose'}
            </Text>
          </Pressable>
        </View>

        {selectedDateLogs.length === 0 ? (
          <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' }}>
            {t.tracker?.noLogs || 'No doses logged for this date.'}
          </Text>
        ) : (
          <View style={{ gap: 10 }}>
            {selectedDateLogs.map((log) => (
              <Pressable
                key={log.id}
                onPress={() => startEdit(log)}
                style={{
                  padding: 12,
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0'
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontWeight: '700', color: theme.text, fontSize: 14 }}>
                    {log.protocolName}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.muted }}>
                    {log.time}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.text, marginBottom: 4 }}>
                  {log.doseAmount} mcg
                  {log.units && ` (${log.units} units)`}
                </Text>
                {log.injectionSite && (
                  <Text style={{ fontSize: 11, color: theme.muted }}>
                    {t.tracker?.injectionSite || 'Site'}: {log.injectionSite}
                  </Text>
                )}
                {log.notes && (
                  <Text style={{ fontSize: 11, color: theme.muted, marginTop: 4, fontStyle: 'italic' }}>
                    {log.notes}
                  </Text>
                )}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteLogEntry(log.id, log.date);
                  }}
                  style={{ marginTop: 8, alignSelf: 'flex-end' }}
                >
                  <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '700' }}>
                    {t.tracker?.delete || 'Delete'}
                  </Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {dailyUsageData.length > 0 && (
        <Card>
          <SimpleChart
            data={dailyUsageData}
            label={t.tracker?.dailyUsage || 'Daily Usage'}
            color={theme.primary}
            unit=" mcg"
          />
        </Card>
      )}

      {complianceData.length > 0 && Array.isArray(protocols) && protocols.length > 0 && (
        <Card>
          <SimpleChart
            data={complianceData}
            label={t.tracker?.compliance || 'Compliance Rate'}
            color="#10B981"
            unit="%"
          />
        </Card>
      )}

      {upcomingDoses.length > 0 && (
        <Card style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#92400E', marginBottom: 12 }}>
            {t.tracker?.upcomingDoses || 'Upcoming Doses (Next 7 Days)'}
          </Text>
          <View style={{ gap: 8 }}>
            {upcomingDoses.slice(0, 7).map((dose, idx) => (
              <View
                key={idx}
                style={{
                  padding: 10,
                  backgroundColor: theme.card,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#FDE68A'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>
                  {dose.protocolName}
                </Text>
                <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
                  {new Date(dose.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {dose.timeOfDay}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' }}>
            <ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>
                  {editingLog ? (t.tracker?.editDose || 'Edit Dose') : (t.tracker?.addDose || 'Add Dose')}
                </Text>
                <Pressable onPress={resetForm}>
                  <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '700' }}>
                    {t.common?.close || 'Close'}
                  </Text>
                </Pressable>
              </View>

              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                    {t.tracker?.protocol || 'Protocol'}
                  </Text>
                  {protocols.length === 0 ? (
                    <Text style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic' }}>
                      {t.tracker?.noProtocols || 'No active protocols. Add protocols in Dashboard first.'}
                    </Text>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {Array.isArray(protocols) && protocols.map((protocol) => (
                        <Pressable
                          key={protocol.id}
                          onPress={() => setFormData({ ...formData, protocolId: String(protocol.id) })}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: formData.protocolId === String(protocol.id) ? theme.primary : theme.border,
                            backgroundColor: formData.protocolId === String(protocol.id) ? `${theme.primary}15` : '#fff'
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: formData.protocolId === String(protocol.id) ? theme.primary : theme.text }}>
                            {protocol.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                    {t.tracker?.date || 'Date'}
                  </Text>
                  <TextInput
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                    placeholder="YYYY-MM-DD"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text
                    }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                    {t.tracker?.time || 'Time'}
                  </Text>
                  <TextInput
                    value={formData.time}
                    onChangeText={(text) => setFormData({ ...formData, time: text })}
                    placeholder="HH:mm"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text
                    }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                    {t.tracker?.doseAmount || 'Dose Amount (mcg)'}
                  </Text>
                  <TextInput
                    value={formData.doseAmount}
                    onChangeText={(text) => setFormData({ ...formData, doseAmount: text })}
                    keyboardType="numeric"
                    placeholder="e.g. 250"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text
                    }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                    {t.tracker?.units || 'Units (optional)'}
                  </Text>
                  <TextInput
                    value={formData.units}
                    onChangeText={(text) => setFormData({ ...formData, units: text })}
                    keyboardType="numeric"
                    placeholder="e.g. 10"
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text
                    }}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
                    {t.tracker?.injectionSite || 'Injection Site'}
                  </Text>
                  <InjectionSiteSelector
                    selectedSite={formData.injectionSite}
                    onSelect={(site) => setFormData({ ...formData, injectionSite: site })}
                  />
                </View>

                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 6 }}>
                    {t.tracker?.notes || 'Notes (optional)'}
                  </Text>
                  <TextInput
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    placeholder={t.tracker?.notesPlaceholder || 'Add any notes...'}
                    multiline
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: theme.text,
                      minHeight: 80,
                      textAlignVertical: 'top'
                    }}
                  />
                </View>

                <Pressable
                  onPress={handleSave}
                  disabled={!formData.protocolId || !formData.doseAmount}
                  style={{
                    paddingVertical: 14,
                    backgroundColor: (!formData.protocolId || !formData.doseAmount) ? theme.muted : theme.primary,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: (!formData.protocolId || !formData.doseAmount) ? 0.5 : 1
                  }}
                >
                  <Text style={{ color: '#000000', fontWeight: '700', fontSize: 15 }}>
                    {t.common?.save || 'Save'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </ScrollView>
  );
}
