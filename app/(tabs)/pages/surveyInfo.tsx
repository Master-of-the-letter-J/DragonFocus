import { Text } from '@/components/Themed';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function SurveyInfoPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Survey Layout & Summary</Text>

      <Text style={styles.sectionTitle}>Overview</Text>
      <Text style={styles.paragraph}>
        Surveys are optional morning and night flows that collect mood, goals, schedules, and short answers. Each
        survey awards coins, XP, and health effects. Many elements can be toggled in Settings.
      </Text>

      <Text style={styles.sectionTitle}>Morning Survey</Text>
      <Text style={styles.paragraph}>- Multiple Choice: Mood</Text>
      <Text style={styles.paragraph}>- Multiple Choice: Project to work on</Text>
      <Text style={styles.paragraph}>- Question Edit: Add/Remove Day Goals</Text>
      <Text style={styles.paragraph}>- Dropdown: Progress on regular goal</Text>
      <Text style={styles.paragraph}>- Written Checklists: Day Goals (Importance / Categories / Schedule)</Text>
      <Text style={styles.paragraph}>- Short Answer: Pre-set & custom prompts</Text>
      <Text style={styles.paragraph}>- Optionally show a motivational quote</Text>

      <Text style={styles.sectionTitle}>Evening Survey</Text>
      <Text style={styles.paragraph}>- Multiple Choice: Mood</Text>
      <Text style={styles.paragraph}>- Project review & checklist completion</Text>
      <Text style={styles.paragraph}>- Short Answers: Reflections & prompts</Text>
      <Text style={styles.paragraph}>- Show results and rewards earned</Text>

      <Text style={styles.sectionTitle}>Question Types</Text>
      <Text style={styles.paragraph}>Checklist, Dropdown, Multiple Choice, Count, Short Answer, Schedule</Text>

      <Text style={styles.sectionTitle}>Goal Types</Text>
      <Text style={styles.paragraph}>Project, Long-Term, Medium-Term, Short-Term, Day Goals (with checklists)</Text>

      <Text style={styles.sectionTitle}>User Experience Tips</Text>
      <Text style={styles.paragraph}>- Enable/disable sections in Settings to tailor the experience.</Text>
      <Text style={styles.paragraph}>- Use SMART goals and break large projects into sub-goals.</Text>

      <Text style={styles.sectionTitle}>Tips For Alphas</Text>
      <Text style={styles.paragraph}>Knowledge, Empathy, and Confidence — focus on these three when interacting and planning.</Text>
      <Text style={styles.paragraph}>Balance outgoingness with reflection and practice discipline to build momentum.</Text>

      <Text style={styles.footer}>You can customize every part of the surveys in Settings.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  paragraph: { fontSize: 14, marginTop: 6, color: '#333' },
  footer: { marginTop: 20, fontSize: 13, color: '#666' },
});
