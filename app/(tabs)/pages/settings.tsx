import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useAchievements } from '@/context/AchievementsProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useWeather } from '@/context/WeatherProvider';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

interface VolumeSettings {
	music: number;
	sounds: number;
	ambient: number;
	dragonSounds: number;
}

export default function SettingsPage() {
	const theme = useTheme();
	const weather = useWeather();
	const scarLevel = useScarLevel();
	const dragon = useDragon();
	const coins = useDragonCoins();
	const shards = useShards();
	const fury = useFury();
	const survey = useSurvey();
	const goals = useGoals();
	const achievements = useAchievements();

	const [activeTab, setActiveTab] = useState<'general' | 'theme'>('general');
	const [volumes, setVolumes] = useState<VolumeSettings>({
		music: 0.7,
		sounds: 0.8,
		ambient: 0.5,
		dragonSounds: 0.9,
	});
	const [showBackgroundModal, setShowBackgroundModal] = useState(false);

	const handleResetAll = () => {
		Alert.alert(
			'Reset All Progress',
			'Are you sure you want to reset everything? This action cannot be undone.\n\nThis will reset:\n• Dragon stats\n• All coins and shards\n• Surveys\n• Goals and habits\n• Achievements\n• Fury meter',
			[
				{ text: 'Cancel', onPress: () => {}, style: 'cancel' },
				{
					text: 'Reset All',
					onPress: () => {
						dragon.resetDragon?.();
						(coins as any).reset?.();
						(shards as any).reset?.();
						fury.resetFury?.();
						survey.resetDailySurveys?.();
						(goals as any).clear?.();
						(achievements as any).reset?.();
						Alert.alert('Success', 'All progress has been reset!');
					},
					style: 'destructive',
				},
			],
			{ cancelable: true },
		);
	};

	const backgroundThemes = [
		{ id: 'dungeon', name: '🏰 Dungeon Theme', locked: false },
		{ id: 'forest', name: '🌲 Forest Theme', locked: false },
		{ id: 'sky', name: '☁️ Sky Theme', locked: false },
		{ id: 'custom', name: '🎨 Custom (Your Image)', locked: scarLevel.currentScarLevel < 4 },
	];

	const handleVolumeChange = (key: keyof VolumeSettings, value: number) => {
		setVolumes(prev => ({ ...prev, [key]: value }));
	};

	const styles = StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.colors.background },
		content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
		tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: 20 },
		tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
		tabActive: { borderBottomColor: theme.colors.tint },
		tabText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
		tabTextActive: { color: theme.colors.tint },
		section: { marginBottom: 24 },
		sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
		settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
		settingLabel: { fontSize: 15, color: theme.colors.text, flex: 1 },
		settingValue: { fontSize: 13, color: theme.colors.tint, marginRight: 8 },
		slider: { flex: 1, height: 40, marginHorizontal: 8 },
		volumeButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, backgroundColor: theme.colors.card, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
		volumeButtonActive: { borderColor: theme.colors.tint, backgroundColor: theme.colors.tint },
		volumeButtonText: { fontSize: 12, color: theme.colors.text, fontWeight: '600' },
		toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
		toggleLabel: { fontSize: 15, color: theme.colors.text },
		themeButton: { paddingVertical: 12, paddingHorizontal: 16, marginVertical: 8, backgroundColor: theme.colors.card, borderRadius: 8, borderWidth: 2, borderColor: theme.colors.border },
		themeButtonActive: { borderColor: theme.colors.tint, backgroundColor: theme.colors.tint },
		themeButtonText: { fontSize: 15, color: theme.colors.text, textAlign: 'center' },
		themeButtonTextActive: { color: theme.colors.background, fontWeight: '700' },
		themeButtonLocked: { opacity: 0.5 },
		lockedBadge: { fontSize: 12, color: theme.colors.warning, marginTop: 4, textAlign: 'center' },
		backgroundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
		backgroundItem: { flex: 0.48, paddingVertical: 16, paddingHorizontal: 12, backgroundColor: theme.colors.card, borderRadius: 8, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
		backgroundItemLocked: { opacity: 0.5 },
		backgroundItemSelected: { borderColor: theme.colors.tint, backgroundColor: theme.colors.tint },
		backgroundItemText: { fontSize: 13, color: theme.colors.text, textAlign: 'center' },
		backgroundItemTextSelected: { color: theme.colors.background, fontWeight: '700' },
		modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
		modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingVertical: 20, paddingHorizontal: 16, maxHeight: '80%' },
		modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 16 },
		closeButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.tint, borderRadius: 8, alignItems: 'center', marginTop: 12 },
		closeButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
		resetButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.colors.danger, borderRadius: 8, alignItems: 'center', marginTop: 24 },
		resetButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
	});

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			<View style={styles.tabContainer}>
				<Pressable style={[styles.tab, activeTab === 'general' && styles.tabActive]} onPress={() => setActiveTab('general')}>
					<Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>⚙️ General</Text>
				</Pressable>
				<Pressable style={[styles.tab, activeTab === 'theme' && styles.tabActive]} onPress={() => setActiveTab('theme')}>
					<Text style={[styles.tabText, activeTab === 'theme' && styles.tabTextActive]}>🎨 Theme</Text>
				</Pressable>
			</View>

			<ScrollView style={styles.content}>
				{activeTab === 'general' && (
					<View>
						{/* Volume Controls */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>🔊 Volume Controls</Text>

							<View style={styles.settingRow}>
								<Text style={styles.settingLabel}>Music Volume</Text>
								<Text style={styles.settingValue}>{Math.round(volumes.music * 100)}%</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
								<Pressable style={[styles.volumeButton, volumes.music === 0 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('music', 0)}>
									<Text style={styles.volumeButtonText}>0%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.music === 0.33 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('music', 0.33)}>
									<Text style={styles.volumeButtonText}>33%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.music === 0.66 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('music', 0.66)}>
									<Text style={styles.volumeButtonText}>66%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.music === 1 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('music', 1)}>
									<Text style={styles.volumeButtonText}>100%</Text>
								</Pressable>
							</View>

							<View style={[styles.settingRow, { marginTop: 16 }]}>
								<Text style={styles.settingLabel}>Sound Effects Volume</Text>
								<Text style={styles.settingValue}>{Math.round(volumes.sounds * 100)}%</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
								<Pressable style={[styles.volumeButton, volumes.sounds === 0 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('sounds', 0)}>
									<Text style={styles.volumeButtonText}>0%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.sounds === 0.33 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('sounds', 0.33)}>
									<Text style={styles.volumeButtonText}>33%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.sounds === 0.66 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('sounds', 0.66)}>
									<Text style={styles.volumeButtonText}>66%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.sounds === 1 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('sounds', 1)}>
									<Text style={styles.volumeButtonText}>100%</Text>
								</Pressable>
							</View>

							<View style={[styles.settingRow, { marginTop: 16 }]}>
								<Text style={styles.settingLabel}>Ambient Volume</Text>
								<Text style={styles.settingValue}>{Math.round(volumes.ambient * 100)}%</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
								<Pressable style={[styles.volumeButton, volumes.ambient === 0 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('ambient', 0)}>
									<Text style={styles.volumeButtonText}>0%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.ambient === 0.33 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('ambient', 0.33)}>
									<Text style={styles.volumeButtonText}>33%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.ambient === 0.66 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('ambient', 0.66)}>
									<Text style={styles.volumeButtonText}>66%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.ambient === 1 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('ambient', 1)}>
									<Text style={styles.volumeButtonText}>100%</Text>
								</Pressable>
							</View>

							<View style={[styles.settingRow, { marginTop: 16 }]}>
								<Text style={styles.settingLabel}>Dragon Sounds Volume</Text>
								<Text style={styles.settingValue}>{Math.round(volumes.dragonSounds * 100)}%</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
								<Pressable style={[styles.volumeButton, volumes.dragonSounds === 0 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('dragonSounds', 0)}>
									<Text style={styles.volumeButtonText}>0%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.dragonSounds === 0.33 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('dragonSounds', 0.33)}>
									<Text style={styles.volumeButtonText}>33%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.dragonSounds === 0.66 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('dragonSounds', 0.66)}>
									<Text style={styles.volumeButtonText}>66%</Text>
								</Pressable>
								<Pressable style={[styles.volumeButton, volumes.dragonSounds === 1 && styles.volumeButtonActive]} onPress={() => handleVolumeChange('dragonSounds', 1)}>
									<Text style={styles.volumeButtonText}>100%</Text>
								</Pressable>
							</View>
						</View>

						{/* Feature Toggles */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>✨ Features</Text>

							<View style={styles.toggleContainer}>
								<Text style={styles.toggleLabel}>Enable Weather Effects</Text>
								<Switch value={weather.enabled} onValueChange={weather.setEnabled} trackColor={{ false: theme.colors.border, true: theme.colors.tint }} thumbColor={weather.enabled ? theme.colors.success : theme.colors.danger} />
							</View>

							<View style={styles.toggleContainer}>
								<Text style={styles.toggleLabel}>Enable Brightness Changes</Text>
								<Switch value={true} disabled={true} trackColor={{ false: theme.colors.border, true: theme.colors.tint }} thumbColor={theme.colors.success} />
							</View>
						</View>

						{/* Reset All Button */}
						<View style={styles.section}>
							<Pressable style={styles.resetButton} onPress={handleResetAll}>
								<Text style={styles.resetButtonText}>🔄 Reset All Progress</Text>
							</Pressable>
						</View>
					</View>
				)}

				{activeTab === 'theme' && (
					<View>
						{/* Light/Dark Mode */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>🌓 Light/Dark Mode</Text>

							<Pressable style={[styles.themeButton, theme.mode === 'light' && styles.themeButtonActive]} onPress={() => theme.setMode('light')}>
								<Text style={[styles.themeButtonText, theme.mode === 'light' && styles.themeButtonTextActive]}>☀️ Light Mode</Text>
							</Pressable>

							<Pressable style={[styles.themeButton, theme.mode === 'dark' && styles.themeButtonActive]} onPress={() => theme.setMode('dark')}>
								<Text style={[styles.themeButtonText, theme.mode === 'dark' && styles.themeButtonTextActive]}>🌙 Dark Mode</Text>
							</Pressable>
						</View>

						{/* Background Selection */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>🖼️ Background Theme</Text>
							<Pressable style={[styles.themeButton]} onPress={() => setShowBackgroundModal(true)}>
								<Text style={[styles.themeButtonText]}>Select Background...</Text>
							</Pressable>

							<Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 8 }}>Current: {backgroundThemes.find(t => t.id === theme.backgroundTheme)?.name || 'Dungeon Theme'}</Text>

							{scarLevel.currentScarLevel < 4 && <Text style={{ color: theme.colors.warning, fontSize: 12, marginTop: 8 }}>💎 Unlock custom background at Scar Level 4</Text>}
						</View>

						{/* Brightness Controls */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>☀️ Brightness</Text>

							{(['bright', 'slight_bright', 'normal', 'slight_dimmer', 'dimmer'] as const).map(level => (
								<Pressable key={level} style={[styles.themeButton, theme.brightness === level && styles.themeButtonActive]} onPress={() => theme.setBrightness(level)}>
									<Text style={[styles.themeButtonText, theme.brightness === level && styles.themeButtonTextActive]}>{level === 'bright' ? '☀️ Bright' : level === 'slight_bright' ? '🌤️ Slight Bright' : level === 'normal' ? '⚪ Normal' : level === 'slight_dimmer' ? '🌑 Slight Dimmer' : '🌑🌑 Dimmer'}</Text>
								</Pressable>
							))}
						</View>
					</View>
				)}
			</ScrollView>

			{/* Background Selection Modal */}
			<Modal visible={showBackgroundModal} transparent={true} animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Choose a Background</Text>

						<View style={styles.backgroundGrid}>
							{backgroundThemes.map(bg => (
								<Pressable
									key={bg.id}
									style={[styles.backgroundItem, theme.backgroundTheme === bg.id && styles.backgroundItemSelected, bg.locked && styles.backgroundItemLocked]}
									onPress={() => {
										if (!bg.locked) {
											theme.setBackgroundTheme(bg.id as any);
											setShowBackgroundModal(false);
										}
									}}
									disabled={bg.locked}>
									<Text style={[styles.backgroundItemText, theme.backgroundTheme === bg.id && styles.backgroundItemTextSelected]}>{bg.name}</Text>
									{bg.locked && <Text style={styles.lockedBadge}>🔒 Unlock at Level 4</Text>}
								</Pressable>
							))}
						</View>

						<Pressable style={styles.closeButton} onPress={() => setShowBackgroundModal(false)}>
							<Text style={styles.closeButtonText}>Close</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</View>
	);
}
