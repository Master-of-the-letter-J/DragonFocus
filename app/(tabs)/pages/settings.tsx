import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useDragonAlarm } from '@/context/DragonAlarmProvider';
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
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput } from 'react-native';

function SettingRow({ label, scarLevelRequired, currentScarLevel = 0, value, onValueChange, disabled = false }: { label: string; scarLevelRequired?: number; currentScarLevel?: number; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
	const showRequirement = scarLevelRequired !== undefined && currentScarLevel < scarLevelRequired;

	// NEW: hard lock when requirement not met
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
	const alarms = useDragonAlarm();
	const router = useRouter();
	const [newAlarmTime, setNewAlarmTime] = useState('');
	const [showAlarmInput, setShowAlarmInput] = useState(false);

	const canEnableInvincible = scarLevel.currentScarLevel >= 5;
	const canEnableAlarms = scarLevel.currentScarLevel >= 3;

	// additional providers for cheats / resets
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

	const handleResetProgress = () => {
		Alert.alert('Reset All Progress', 'Are you sure you want to reset ALL progress? This cannot be undone!', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Reset',
				onPress: () => {
					resetDailySurveys();
					Alert.alert('Progress Reset', 'All your progress has been reset. Please restart the app for full effect.');
				},
				style: 'destructive',
			},
		]);
	};

	const handleAddAlarm = () => {
		if (!newAlarmTime.match(/^\d{2}:\d{2}$/)) {
			Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 07:00)');
			return;
		}
		alarms.addAlarm(newAlarmTime);
		setNewAlarmTime('');
		setShowAlarmInput(false);
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
		dragon.setHp?.(dragon.maxHP);
		Alert.alert('Cheat', 'Dragon healed to full HP.');
	};

	const handleAddXP = (amt: number) => {
		scarLevel.addXP(amt);
		Alert.alert('Cheat', `Added ${amt} XP.`);
	};

	const handleSimulateDay = () => {
		if (items.processDailyPayouts) items.processDailyPayouts();
		if (dragonClicking.resetDailyClicks) dragonClicking.resetDailyClicks();
		resetDailySurveys();
		Alert.alert('Simulate Day', 'Simulated a day rollover: payouts processed and daily states reset.');
	};

	const handleFullResetAll = () => {
		Alert.alert('Reset All Progress', 'This will reset most game state (coins, shards, goals, inventory, streaks, fury, dragon). Continue?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Reset',
				onPress: () => {
					resetDailySurveys();
					dragonClicking.resetDailyClicks();
					streak.resetStreak();
					if (goals.resetGoals) goals.resetGoals();
					if (items.resetInventory) items.resetInventory();
					if (coins.resetCoins) coins.resetCoins();
					if (shards.resetShards) shards.resetShards();
					if (fury.resetFury) fury.resetFury();
					if (dragon.resetDragon) dragon.resetDragon();
					Alert.alert('Reset', 'Selected providers have been reset. Restart app for full cleanup.');
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
				<SettingRow label="Random Prompt" value={!!options.randomPromptCount && options.randomPromptCount > 0} onValueChange={v => setOption('randomPromptCount' as any, v ? 1 : 0)} />
				<SettingRow label="Random MC Questions" value={!!options.enableRandomMC} onValueChange={v => setOption('enableRandomMC' as any, v)} />

				<Text style={styles.sectionTitle}>Help & Info</Text>
				<View style={{ paddingVertical: 8 }}>
					<Text style={{ color: '#555', fontSize: 14, marginBottom: 6 }}>Coins: earned from surveys, clicks and generators — used in the Shop.</Text>
					<Text style={{ color: '#555', fontSize: 14, marginBottom: 6 }}>Shards: rarer currency for generators/upgrades; gained from some rewards and selling generators.</Text>
					<Text style={{ color: '#555', fontSize: 14 }}>Scar Levels: unlock features and increase multipliers as you gain XP.</Text>
				</View>
				<View style={styles.row}>
					<Pressable style={styles.typeButton} onPress={() => router.push('/(tabs)/pages/tutorial')}>
						<Text style={styles.typeText}>📖 Click for Important App Info</Text>
					</Pressable>
				</View>

				<Text style={styles.sectionTitle}>Fun Modes</Text>
				<SettingRow label="Invincible Dragon Mode" scarLevelRequired={5} currentScarLevel={scarLevel.currentScarLevel} value={!!dragon.invincible} onValueChange={handleInvincibleToggle} />

				<Text style={styles.sectionTitle}>Dragon Alarms</Text>
				{!canEnableAlarms && (
					<View style={styles.lockedSection}>
						<Text style={{ color: '#999', fontSize: 14 }}>🔒 Requires Scar Level 3+ to unlock</Text>
					</View>
				)}
				{canEnableAlarms && (
					<>
						{alarms.alarms.map(alarm => (
							<View key={alarm.id} style={styles.alarmRow}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontWeight: '600', fontSize: 14 }}>{alarm.label || `Alarm - ${alarm.times.join(', ')}`}</Text>
									<Text style={{ fontSize: 12, color: '#666' }}>{alarm.times.join(', ')}</Text>
								</View>
								<Pressable style={[styles.alarmToggle, alarm.enabled && styles.alarmEnabled]} onPress={() => alarms.toggleAlarm(alarm.id, !alarm.enabled)}>
									<Text style={{ fontSize: 12, fontWeight: '600', color: alarm.enabled ? '#4CAF50' : '#999' }}>{alarm.enabled ? '🔔' : '🔕'}</Text>
								</Pressable>
								<Pressable
									style={styles.alarmDelete}
									onPress={() => {
										Alert.alert('Delete Alarm', 'Remove this alarm?', [
											{ text: 'Cancel', style: 'cancel' },
											{
												text: 'Delete',
												style: 'destructive',
												onPress: () => alarms.removeAlarm(alarm.id),
											},
										]);
									}}>
									<Text style={{ fontSize: 14, color: '#f44336' }}>✕</Text>
								</Pressable>
							</View>
						))}
						{!showAlarmInput ? (
							<Pressable style={styles.addAlarmButton} onPress={() => setShowAlarmInput(true)}>
								<Text style={styles.addAlarmText}>+ Add Alarm</Text>
							</Pressable>
						) : (
							<View style={styles.alarmInputContainer}>
								<TextInput placeholder="HH:MM (e.g., 07:00)" value={newAlarmTime} onChangeText={setNewAlarmTime} style={styles.alarmInput} placeholderTextColor="#ccc" />
								<Pressable style={styles.alarmInputButton} onPress={handleAddAlarm}>
									<Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
								</Pressable>
								<Pressable style={[styles.alarmInputButton, { backgroundColor: '#999' }]} onPress={() => setShowAlarmInput(false)}>
									<Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
								</Pressable>
							</View>
						)}
					</>
				)}

				<Text style={styles.sectionTitle}>Danger Zone</Text>

				<Text style={styles.sectionTitle}>Cheats & Dev</Text>
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
					<Pressable style={styles.cheatButton} onPress={() => handleGrantCoins(1000)}>
						<Text style={styles.cheatText}>+1000 Coins</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={() => handleGrantShards(5)}>
						<Text style={styles.cheatText}>+5 Shards</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={handleGrantStreak}>
						<Text style={styles.cheatText}>+1 Streak</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={handleHealDragon}>
						<Text style={styles.cheatText}>Heal Dragon</Text>
					</Pressable>
					<Pressable style={styles.cheatButton} onPress={() => handleAddXP(1000)}>
						<Text style={styles.cheatText}>+1000 XP</Text>
					</Pressable>
					<Pressable style={[styles.cheatButton, { backgroundColor: '#607D8B' }]} onPress={handleSimulateDay}>
						<Text style={styles.cheatText}>Simulate Day</Text>
					</Pressable>
				</View>
				<Pressable style={[styles.typeButton, styles.dangerButton]} onPress={handleResetProgress}>
					<Text style={[styles.typeText, styles.dangerText]}>⚠️ Reset Survey Progress</Text>
				</Pressable>
				<Pressable style={[styles.typeButton, styles.dangerButton]} onPress={handleFullResetAll}>
					<Text style={[styles.typeText, styles.dangerText]}>⚠️ Reset All Progress</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { flex: 1 },
	scrollContainer: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
	sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#555' },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
	label: { fontSize: 16 },
	labelContainer: { flex: 1 },
	lockText: { fontSize: 12, color: '#999' },
	typeButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#eee', borderRadius: 8, marginVertical: 8 },
	typeText: { fontWeight: '700', fontSize: 16 },
	requirementText: { fontSize: 11, color: '#888', fontStyle: 'italic', marginTop: 2 },
	dangerButton: { backgroundColor: '#ffebee' },
	dangerText: { color: '#c62828' },
	cheatButton: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#455A64', borderRadius: 8, margin: 6 },
	cheatText: { color: '#fff', fontWeight: '700' },
	lockedSection: { padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#ccc' },
	alarmRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8, gap: 8 },
	alarmToggle: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: '#eee' },
	alarmEnabled: { backgroundColor: '#E8F5E9' },
	alarmDelete: { paddingHorizontal: 8, paddingVertical: 6 },
	addAlarmButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center', marginTop: 8 },
	addAlarmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
	alarmInputContainer: { flexDirection: 'row', gap: 8, marginTop: 12 },
	alarmInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
	alarmInputButton: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#4CAF50', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
