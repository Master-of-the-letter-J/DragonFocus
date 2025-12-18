import { Text, View } from '@/components/Themed';
import { useSurvey } from '@/context/SurveyProvider';
import React from 'react';
import { Pressable, StyleSheet, Switch } from 'react-native';

export default function SettingsPage() {
  const { options, setOption } = useSurvey();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Show Quote</Text>
        <Switch value={options.showQuote} onValueChange={v => setOption('showQuote', v)} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enable Morning Journal</Text>
        <Switch value={options.enableJournalMorning} onValueChange={v => setOption('enableJournalMorning', v)} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enable Night Journal</Text>
        <Switch value={options.enableJournalNight} onValueChange={v => setOption('enableJournalNight', v)} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mood Question</Text>
        <Switch value={options.enableMoodQuestion} onValueChange={v => setOption('enableMoodQuestion', v)} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Project Question</Text>
        <Switch value={options.enableProjectQuestion} onValueChange={v => setOption('enableProjectQuestion', v)} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Day Checklist Type</Text>
        <Pressable
          style={styles.typeButton}
          onPress={() =>
            setOption(
              'dayChecklistType',
              options.dayChecklistType === 'simple' ? 'importance' : options.dayChecklistType === 'importance' ? 'category' : 'simple'
            )
          }
        >
          <Text style={styles.typeText}>{options.dayChecklistType}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  label: { fontSize: 16 },
  typeButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 8 },
  typeText: { fontWeight: '700' },
});
