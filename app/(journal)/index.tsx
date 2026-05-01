import { formatCoinNumber } from '@/constants/number-abbreviation';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import HabitGoalsPage from './habitGoals';
import TodoGoalsPage from './todoGoals';
import Achievements from './achievements';
import AscensionPage from './ascension';
import Graveyard from './graveyard';
import ListView from './listView';
import TableView from './tableView';
import TranscensionPage from './transcension';

type JournalTab = 'habits' | 'todos' | 'table' | 'list' | 'achievements' | 'graveyard' | 'ascension' | 'transcension';

const LAIR_TABS: Array<{ key: JournalTab; label: string; coinCost?: number; scarRequired?: number }> = [
	{ key: 'habits', label: 'Habit Goals' },
	{ key: 'todos', label: 'To-Do Goals' },
	{ key: 'table', label: 'Logs - Table', coinCost: 5 },
	{ key: 'list', label: 'Logs - List', coinCost: 5 },
	{ key: 'achievements', label: 'Achievements' , coinCost: 5 },
	{ key: 'graveyard', label: 'Graveyard', coinCost: 10, scarRequired: 2 },
	{ key: 'ascension', label: 'Ascension', coinCost: 50, scarRequired: 4 },
	{ key: 'transcension', label: 'Transcension', coinCost: 100, scarRequired: 8 },
];

export default function JournalHub() {
	const [tab, setTab] = useState<JournalTab>('habits');
	const [unlockedTabs, setUnlockedTabs] = useState<Record<JournalTab, boolean>>({
		habits: true,
		todos: true,
		table: false,
		list: false,
		achievements: false,
		graveyard: false,
		ascension: false,
		transcension: false,
	});
	const coins = useDragonCoins();
	const scarLevel = useScarLevel();

	const handleTabPress = (item: (typeof LAIR_TABS)[number]) => {
		if (unlockedTabs[item.key]) {
			setTab(item.key);
			return;
		}

		if (item.scarRequired && scarLevel.currentScarLevel < item.scarRequired) {
			Alert.alert('Lair Section Locked', `Reach Scar Level ${item.scarRequired} before unlocking ${item.label}.`);
			return;
		}

		const cost = item.coinCost ?? 0;
		Alert.alert('Unlock Lair Section', `Unlock ${item.label} for ${formatCoinNumber(cost)} coins?`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Unlock',
				onPress: () => {
					if (!coins.spendCoins(cost)) {
						Alert.alert('Not Enough Coins', `You need ${formatCoinNumber(cost)} coins to unlock ${item.label}.`);
						return;
					}
					setUnlockedTabs(current => ({ ...current, [item.key]: true }));
					setTab(item.key);
				},
			},
		]);
	};

	const render = () => {
		if (tab === 'habits') return <HabitGoalsPage />;
		if (tab === 'todos') return <TodoGoalsPage />;
		if (tab === 'table') return <TableView />;
		if (tab === 'list') return <ListView />;
		if (tab === 'achievements') return <Achievements />;
		if (tab === 'graveyard') return <Graveyard />;
		if (tab === 'ascension') return <AscensionPage />;
		return <TranscensionPage />;
	};

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.topTabs}>
				{LAIR_TABS.map(item => {
					const isUnlocked = unlockedTabs[item.key];
					const scarLocked = !!item.scarRequired && scarLevel.currentScarLevel < item.scarRequired;
					return (
					<Pressable key={item.key} style={[styles.tabBtn, tab === item.key && styles.tabActive, !isUnlocked && styles.tabLocked]} onPress={() => handleTabPress(item)}>
						<Text style={[styles.tabText, tab === item.key && styles.tabTextActive, !isUnlocked && styles.tabTextLocked]}>
							{!isUnlocked ? '🔒 ' : ''}{item.label}
						</Text>
						{!isUnlocked ? (
							<Text style={styles.unlockText}>
								{scarLocked ? `Scar ${item.scarRequired}+` : `Unlock for: 🪙 ${formatCoinNumber(item.coinCost ?? 0)}`}
							</Text>
						) : null}
					</Pressable>
					);
				})}
			</View>

			<View style={{ flex: 1 }}>{render()}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	topTabs: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8, justifyContent: 'center', backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#eee' },
	tabBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
	tabActive: { backgroundColor: '#e6f4ea', borderColor: '#4CAF50' },
	tabLocked: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', opacity: 0.78 },
	tabText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
	tabTextActive: { color: '#166534' },
	tabTextLocked: { color: '#6B7280' },
	unlockText: { marginTop: 2, fontSize: 10, color: '#6B7280', fontWeight: '600' },
});
