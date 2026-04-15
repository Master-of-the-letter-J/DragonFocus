import TopHeader from '@/components/TopHeader';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GeneralSettings from './generalSettings';
import SurveySettings from './surveySettings';

export default function SettingsIndex() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'survey' | 'general' | 'tutorial'>('survey');

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			<View style={styles.tabContainer}>
				<Pressable style={[styles.tab, activeTab === 'survey' && styles.tabActive]} onPress={() => setActiveTab('survey')}>
					<Text style={[styles.tabText, activeTab === 'survey' && styles.tabTextActive]}>Survey</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'general' && styles.tabActive]} onPress={() => setActiveTab('general')}>
					<Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>General</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'tutorial' && styles.tabActive]} onPress={() => setActiveTab('tutorial')}>
					<Text style={[styles.tabText, activeTab === 'tutorial' && styles.tabTextActive]}>Tutorial</Text>
				</Pressable>
			</View>

			{activeTab === 'survey' ? <SurveySettings /> : activeTab === 'general' ? <GeneralSettings /> : <SettingsTutorialPanel onOpenFull={() => router.push('/survey/tutorial' as any)} />}
		</View>
	);
}

function SettingsTutorialPanel({ onOpenFull }: { onOpenFull: () => void }) {
	return (
		<View style={styles.tutorialContainer}>
			<Text style={styles.tutorialTitle}>Tutorial</Text>
			<Text style={styles.tutorialBody}>This tab keeps the reference flow inside settings, while the full tutorial page stays available for the complete walkthrough.</Text>
			<Text style={styles.tutorialBullet}>- Morning survey plans habits, to-dos, and extra prompts for the same day.</Text>
			<Text style={styles.tutorialBullet}>- Night survey checks completions, challenge rewards, prompts, trivia, and journal logs.</Text>
			<Text style={styles.tutorialBullet}>- Market, dragon stats, scar levels, and ascension all build on that survey loop.</Text>
			<Pressable style={styles.tutorialButton} onPress={onOpenFull}>
				<Text style={styles.tutorialButtonText}>Open Full Tutorial</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, gap: 12 },
	tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
	tabActive: { borderBottomColor: '#166534' },
	tabText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
	tabTextActive: { color: '#166534' },
	tutorialContainer: { flex: 1, padding: 20 },
	tutorialTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
	tutorialBody: { color: '#4B5563', lineHeight: 20, marginBottom: 16 },
	tutorialBullet: { color: '#374151', marginBottom: 8, lineHeight: 20 },
	tutorialButton: { alignSelf: 'flex-start', backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginTop: 8 },
	tutorialButtonText: { color: '#fff', fontWeight: '800' },
});
