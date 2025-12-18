import { Text, View } from '@/components/Themed';
import { useJournal } from '@/context/JournalProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

export default function JournalPage() {
  const { entries, getEntriesByDate } = useJournal();
  const survey = useSurvey();
  const [view, setView] = useState<'chart' | 'detailed' | 'today'>('chart');

  const today = new Date().toISOString().split('T')[0];
  const todays = getEntriesByDate(today);

  const renderChartItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.date} • {item.surveyType}</Text>
      <Text style={styles.cardText}>Goals: {item.goalsCompleted} • Schedule: {item.schedulePercent}%</Text>
      <Text style={styles.cardText}>Rewards: {item.rewards.coins} coins • {item.rewards.xp} XP • Fury {item.rewards.fury}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>

      <View style={styles.segmentRow}>
        <Pressable style={[styles.segmentButton, view === 'chart' && styles.segmentActive]} onPress={() => setView('chart')}><Text>Chart</Text></Pressable>
        <Pressable style={[styles.segmentButton, view === 'detailed' && styles.segmentActive]} onPress={() => setView('detailed')}><Text>Detailed</Text></Pressable>
        <Pressable style={[styles.segmentButton, view === 'today' && styles.segmentActive]} onPress={() => setView('today')}><Text>Today's Schedule</Text></Pressable>
      </View>

      {view === 'chart' && (
        <FlatList data={entries} keyExtractor={i => i.id} renderItem={renderChartItem} />
      )}

      {view === 'detailed' && (
        <FlatList data={entries} keyExtractor={i => i.id} renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.date} • {item.surveyType}</Text>
            <Text style={styles.cardText}>Goals Completed: {item.goalsCompleted}</Text>
            <Text style={styles.cardText}>Schedule Completed: {item.schedulePercent}%</Text>
            <Text style={styles.cardText}>Rewards: {item.rewards.coins} coins, {item.rewards.xp} XP, Fury {item.rewards.fury}</Text>
            {item.text ? <Text style={styles.cardText}>Entry: {item.text}</Text> : null}
          </View>
        )} />
      )}

      {view === 'today' && (
        <View style={{ flex: 1 }}>
          {todays.length === 0 ? (
            <View style={styles.card}><Text>No schedule for today. Add one in the survey.</Text></View>
          ) : (
            <FlatList data={todays} keyExtractor={i => i.id} renderItem={renderChartItem} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segmentButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 8 },
  segmentActive: { backgroundColor: '#cce9d8' },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
  cardTitle: { fontWeight: '700' },
  cardText: { marginTop: 6, color: '#333' },
});

