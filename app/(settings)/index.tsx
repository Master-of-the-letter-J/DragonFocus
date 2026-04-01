import TopHeader from '@/components/TopHeader';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GeneralSettings from './generalSettings';
import SurveySettings from './surveySettings';

export default function SettingsIndex() {
	const [activeTab, setActiveTab] = useState<'survey' | 'general'>('survey');

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			<View style={styles.tabContainer}>
				<Pressable style={[styles.tab, activeTab === 'survey' && styles.tabActive]} onPress={() => setActiveTab('survey')}>
					<Text style={[styles.tabText, activeTab === 'survey' && styles.tabTextActive]}>Survey Settings</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'general' && styles.tabActive]} onPress={() => setActiveTab('general')}>
					<Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>General Settings</Text>
				</Pressable>
			</View>

			{activeTab === 'survey' ? <SurveySettings /> : <GeneralSettings />}
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
});
