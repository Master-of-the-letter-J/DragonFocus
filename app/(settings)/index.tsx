import TopHeader from '@/components/TopHeader';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import GeneralSettings from './generalSettings';
import SurveySettings from './surveySettings';

export default function SettingsIndex() {
	const [activeTab, setActiveTab] = useState<'general' | 'survey' | 'tutorial'>('general');

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			<View style={styles.tabContainer}>
				<Pressable style={[styles.tab, activeTab === 'general' && styles.tabActive]} onPress={() => setActiveTab('general')}>
					<Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>General</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'survey' && styles.tabActive]} onPress={() => setActiveTab('survey')}>
					<Text style={[styles.tabText, activeTab === 'survey' && styles.tabTextActive]}>Survey</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'tutorial' && styles.tabActive]} onPress={() => setActiveTab('tutorial')}>
					<Text style={[styles.tabText, activeTab === 'tutorial' && styles.tabTextActive]}>Tutorial</Text>
				</Pressable>
			</View>

			{activeTab === 'general' ? <GeneralSettings /> : activeTab === 'survey' ? <SurveySettings /> : <SettingsTutorialPanel />}
		</View>
	);
}

function SettingsTutorialPanel() {
	return (
		<ScrollView contentContainerStyle={styles.tutorialContainer}>
			<Text style={styles.tutorialTitle}>Tutorial</Text>
			<Text style={styles.tutorialBody}>
				Dragon Focus is a daily planning app wrapped around raising a dragon. The basic loop is simple: use the morning survey to set the day up, use the evening survey to report what really happened, and spend the rewards in the market to make the dragon stronger. The home screen is your command center. It shows the dragon, its health, age, stage, population pressure, active effects, backpack snacks, and the two daily survey buttons. If the dragon has not been summoned, tap the egg or spawn button. If the dragon is alive, tapping it earns click coins and adds a tiny bit of population growth. If it dies, revive it and keep going.
			</Text>
			<Text style={styles.tutorialBody}>
				The morning survey is for intention. It can ask your mood, habits, to-dos, prompts, trivia, fun facts, quotes, advice, and a journal entry depending on your survey settings. Habit goals are repeatable routines. To-dos are task goals and can have due dates, challenge status, and sub-goals. The evening survey checks off completed habits, to-dos, and sub-goals, then pays coins, shards, Fire XP, fury changes, streak progress, and challenge rewards when eligible. Rewards can be blocked or reduced when goals are completed too soon after creation, when a challenge is late, or when a survey is only being refilled after already being completed for the day.
			</Text>
			<Text style={styles.tutorialBody}>
				Coins are the main spending resource. They come from surveys, click rewards, idle generators, black-market trades, and some effects. Shards unlock stronger systems and also grant Dragon Orbs. Orbs power the dragon attack market, where the dragon fights the Obsidian Legion. Souls and Embers are later prestige resources used by ascension, transcension, soul prophets, relics, and draconian upgrades. Scar Level is the long-term unlock track. Fire XP increases Scar Level, and higher Scar Levels reveal stronger market items, generators, clickers, effects, and cosmetics.
			</Text>
			<Text style={styles.tutorialBody}>
				Settings are split into General, Survey, and Tutorial. General controls audio, themes, weather, premium/dev toggles, resets, and cheats. Survey controls question order, enabled sections, prompt counts, trivia, fun facts, mood options, goal categories, custom prompts, and journal placement. The Market contains snacks, generators, clickers, cosmetics, themes, Dragon Attack upgrades, Hades upgrades, and Black Market trades. The Journal area stores history: logs, tables, achievements, goal pages, graveyard, ascension, and transcension. A healthy rhythm is to plan in the morning, update goals during the day if needed, finish the evening survey honestly, then spend rewards on upgrades that make tomorrow easier.
			</Text>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, gap: 12 },
	tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
	tabActive: { borderBottomColor: '#166534' },
	tabText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
	tabTextActive: { color: '#166534' },
	tutorialContainer: { padding: 20, paddingBottom: 40 },
	tutorialTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
	tutorialBody: { color: '#4B5563', lineHeight: 20, marginBottom: 16 },
});
