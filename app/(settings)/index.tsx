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

			{/* Mini-Tabs for Survey/General */}
			<View style={styles.tabContainer}>
				<Pressable style={[styles.tab, activeTab === 'survey' && styles.tabActive]} onPress={() => setActiveTab('survey')}>
					<Text style={[styles.tabText, activeTab === 'survey' && styles.tabTextActive]}>📋 Survey Settings</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'general' && styles.tabActive]} onPress={() => setActiveTab('general')}>
					<Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>⚙️ General Settings</Text>
				</Pressable>
			</View>

			{/* Content */}
			{activeTab === 'survey' && <SurveySettings />}
			{activeTab === 'general' && <GeneralSettings />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	tabContainer: {
		flexDirection: 'row',
		borderBottomWidth: 2,
		borderBottomColor: '#E0E0E0',
		paddingHorizontal: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
		borderBottomWidth: 3,
		borderBottomColor: 'transparent',
	},
	tabActive: {
		borderBottomColor: '#4CAF50',
	},
	tabText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#666',
	},
	tabTextActive: {
		color: '#4CAF50',
		fontWeight: '700',
	},
});
