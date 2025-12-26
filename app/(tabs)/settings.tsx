import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useDragonClicking } from '@/context/DragonClickingProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useItems } from '@/context/ItemsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

function SettingRow({ label, scarLevelRequired, currentScarLevel = 0, value, onValueChange, disabled = false }: { label: string; scarLevelRequired?: number; currentScarLevel?: number; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
	const showRequirement = scarLevelRequired !== undefined && currentScarLevel < scarLevelRequired;
	const isLocked = showRequirement;
	const isDisabled = disabled || isLocked;

	return (
		<View style={styles.row}>
			<View style={styles.labelContainer}>
				<Text selectable={false} style={styles.label}>
					{label}
				</Text>
				{showRequirement && <Text style={styles.requirementText}>Requires Scar Level {scarLevelRequired}</Text>}
			</View>
			<Switch value={value && !isLocked} onValueChange={onValueChange} disabled={isDisabled} />
		</View>
	);
}

export default function SettingsPage() {
	const { options, setOption, resetDailySurveys } = useSurvey();
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const router = useRouter();

	const canEnableInvincible = scarLevel.currentScarLevel >= 5;

	// providers for cheats / resets
	const coins = useDragonCoins();
	const shards = useShards();
	const streak = useStreak();
	const goals = useGoals();
	const items = useItems();
	const fury = useFury();
	const dragonClicking = useDragonClicking();

	const handleInvincibleToggle = (v: boolean) => {
		if (canEnableInvincible) {
			dragon.setInvincible?.(v);
		}
	};

	// Cheat / dev helpers
	const handleGrantCoins = (amt: number) => {
		coins.addCoins(amt);
		Alert.alert('Cheat', `Granted ${amt} coins.`);
	};

	const handleGrantShards = (amt: number) => {
		shards.addShards(amt);
		Alert.alert('Cheat', `Granted ${amt} shards.`);
	};

	const handleGrantStreak = () => {
		streak.incrementStreak();
		Alert.alert('Cheat', 'Incremented streak by 1.');
	};

	const handleHealDragon = () => {
		// Adds 1 HP without exceeding max
		const nextHp = Math.min(dragon.hp + 1, dragon.maxHP);
		dragon.setHp?.(nextHp);
	};

	const handleDamageDragon = () => {
		// Removes 1 HP without going below 0
		const nextHp = Math.max(dragon.hp - 1, 0);
		dragon.setHp?.(nextHp);
	};

	const handleAddXP = (amt: number) => {
		scarLevel.addXP(amt);
		Alert.alert('Cheat', `Added ${amt} XP.`);
	};

	const handleSimulateDay = () => {
		if (items.processDailyPayouts) items.processDailyPayouts();
		if (dragonClicking.resetDailyClicks) dragonClicking.resetDailyClicks();
		resetDailySurveys();
		Alert.alert('Simulate Day', 'Simulated a day rollover.');
	};

	const handleFullResetAll = () => {
		Alert.alert('Reset All Progress', 'This will wipe EVERYTHING (coins, items, dragon, levels). This cannot be undone!', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Reset EVERYTHING',
				onPress: () => {
					// Trigger all provider reset functions
					resetDailySurveys();
					if (dragonClicking.resetDailyClicks) dragonClicking.resetDailyClicks();
					if (streak.resetStreak) streak.resetStreak();
					if (goals.resetGoals) goals.resetGoals();
					if (items.resetInventory) items.resetInventory();
					if (coins.resetCoins) coins.resetCoins();
					if (shards.resetShards) shards.resetShards();
					if (fury.resetFury) fury.resetFury();
					if (dragon.resetDragon) dragon.resetDragon();
					if (scarLevel.resetScarLevel) scarLevel.resetScarLevel();

					Alert.alert('Total Wipeout', 'All game data has been cleared.');
					router.replace('./home');
				},
				style: 'destructive',
			},
		]);
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
				<Text style={styles.title}>Settings</Text>

				<Text style={styles.sectionTitle}>Survey Options</Text>
				<SettingRow label="Show Quote" value={options.showQuote} onValueChange={v => setOption('showQuote', v)} />
				<SettingRow label="Enable Morning Journal" value={options.enableJournalMorning} onValueChange={v => setOption('enableJournalMorning', v)} />
				<SettingRow label="Enable Night Journal" value={options.enableJournalNight} onValueChange={v => setOption('enableJournalNight', v)} />
				<SettingRow label="Mood Question" value={options.enableMoodQuestion} onValueChange={v => setOption('enableMoodQuestion', v)} />
				<SettingRow label="Show Advice" value={!!options.enableAdvice} onValueChange={v => setOption('enableAdvice' as any, v)} />

				<Text style={styles.sectionTitle}>App Info</Text>
				<Pressable style={styles.typeButton} onPress={() => router.push('./pages/tutorial')}>
					<Text style={styles.typeText}>📖 Open Tutorial & Info</Text>
				</Pressable>

				<Text style={styles.sectionTitle}>Fun Modes</Text>
				<SettingRow label="Invincible Dragon Mode" scarLevelRequired={5} currentScarLevel={scarLevel.currentScarLevel} value={!!dragon.invincible} onValueChange={handleInvincibleToggle} />

				<Text style={styles.sectionTitle}>Cheats & Dev</Text>
				<View style={styles.cheatGrid}>
					<Pressable style={[styles.cheatButton, { backgroundColor: '#FFD700' }]} onPress={() => handleGrantCoins(10000)}>
						<Text style={[styles.cheatText, { color: '#000' }]}>💰 +10,000 Coins</Text>
					</Pressable>

					<Pressable style={[styles.cheatButton, { backgroundColor: '#4CAF50' }]} onPress={handleHealDragon}>
						<Text style={styles.cheatText}>❤️ Heal (+1 HP)</Text>
					</Pressable>

					<Pressable style={[styles.cheatButton, { backgroundColor: '#f44336' }]} onPress={handleDamageDragon}>
						<Text style={styles.cheatText}>💢 Damage (-1 HP)</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={() => handleGrantCoins(1000)}>
						<Text style={styles.cheatText}>+1000 Coins</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={() => handleGrantShards(5)}>
						<Text style={styles.cheatText}>+5 Shards</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={handleGrantStreak}>
						<Text style={styles.cheatText}>+1 Streak</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={() => handleAddXP(1000)}>
						<Text style={styles.cheatText}>+1000 XP</Text>
					</Pressable>
					<Pressable style={[styles.cheatButton, { backgroundColor: '#607D8B' }]} onPress={handleSimulateDay}>
						<Text style={styles.cheatText}>Simulate Day</Text>
					</Pressable>
				</View>

				<Text style={styles.sectionTitle}>Danger Zone</Text>
				<Pressable style={[styles.typeButton, styles.dangerButton]} onPress={handleFullResetAll}>
					<Text style={[styles.typeText, styles.dangerText]}>⚠️ RESET ALL PROGRESS</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { flex: 1 },
	scrollContainer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 40 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
	sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#555' },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
	label: { fontSize: 16 },
	labelContainer: { flex: 1 },
	typeButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#eee', borderRadius: 8, marginVertical: 8 },
	typeText: { fontWeight: '700', fontSize: 16 },
	requirementText: { fontSize: 11, color: '#888', fontStyle: 'italic', marginTop: 2 },
	dangerButton: { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#f44336', marginTop: 20 },
	dangerText: { color: '#c62828', textAlign: 'center' },
	cheatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
	cheatButton: { paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#455A64', borderRadius: 8, minWidth: '45%' },
	cheatText: { color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center' },
});
