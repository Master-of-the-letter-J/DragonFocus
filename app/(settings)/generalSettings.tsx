import { useDragon } from '@/context/DragonProvider';
import { useItems } from '@/context/ItemsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useWeather } from '@/context/WeatherProvider';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function GeneralSettings() {
	const dragon = useDragon();
	const items = useItems();
	const survey = useSurvey();
	const theme = useTheme();
	const weather = useWeather();
	const scarLevel = useScarLevel();

	const [volumes, setVolumes] = useState({ music: 0.7, sounds: 0.8, ambient: 0.5, dragonSounds: 0.9 });

	const handleVolumeChange = (key: keyof typeof volumes, value: number) => setVolumes(p => ({ ...p, [key]: value }));

	// Simulate day without alert (already implemented): age + process daily payouts
	const simulateDay = () => {
		try {
			dragon.incrementAge?.();
		} catch (e) {}
		try {
			items.processDailyPayouts?.();
		} catch (e) {}
	};

	const agePlus = () => dragon.incrementAge?.();
	const ageMinus = () => dragon.setAge?.(Math.max(0, (dragon.age || 0) - 1));

	const backgroundThemes = [
		{ id: 'dungeon', name: '🏰 Dungeon Theme', locked: false },
		{ id: 'forest', name: '🌲 Forest Theme', locked: false },
		{ id: 'sky', name: '☁️ Sky Theme', locked: false },
		{ id: 'custom', name: '🎨 Custom (Your Image)', locked: scarLevel.currentScarLevel < 4 },
	];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>General Settings</Text>

			{/* Basic Settings first */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>🔊 Basic: Volume & Sound</Text>
				<View style={styles.row}>
					<Text style={styles.label}>Music</Text>
					<Text style={styles.value}>{Math.round(volumes.music * 100)}%</Text>
				</View>
				<View style={styles.rowButtons}>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('music', 0)}>
						<Text>0%</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('music', 0.33)}>
						<Text>33%</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('music', 0.66)}>
						<Text>66%</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('music', 1)}>
						<Text>100%</Text>
					</Pressable>
				</View>

				<View style={[styles.row, { marginTop: 8 }]}>
					<Text style={styles.label}>Sound Effects</Text>
					<Text style={styles.value}>{Math.round(volumes.sounds * 100)}%</Text>
				</View>
				<View style={styles.rowButtons}>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('sounds', 0)}>
						<Text>0%</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('sounds', 0.33)}>
						<Text>33%</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('sounds', 0.66)}>
						<Text>66%</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={() => handleVolumeChange('sounds', 1)}>
						<Text>100%</Text>
					</Pressable>
				</View>
			</View>

			{/* Backgrounds, Theme & Weather next */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>🖼️ Backgrounds & Theme</Text>
				<View style={styles.row}>
					<Text style={styles.label}>Theme Mode</Text>
					<Text style={styles.value}>{theme.mode}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>Background</Text>
					<Text style={styles.value}>{backgroundThemes.find(b => b.id === theme.backgroundTheme)?.name || 'Dungeon Theme'}</Text>
				</View>
				<View style={{ marginTop: 8 }}>
					<Pressable style={styles.bigButton} onPress={() => theme.setMode('light')}>
						<Text>☀️ Set Light</Text>
					</Pressable>
					<Pressable style={styles.bigButton} onPress={() => theme.setMode('dark')}>
						<Text>🌙 Set Dark</Text>
					</Pressable>
				</View>

				<Text style={{ marginTop: 8, color: '#666' }}>Weather enabled: {weather.enabled ? 'Yes' : 'No'}</Text>
			</View>

			{/* Reset button */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>🔄 Reset</Text>
				<Pressable
					style={styles.button}
					onPress={() => {
						dragon.resetDragon?.();
						if (typeof (items as any).reset === 'function') (items as any).reset();
						if (typeof (survey as any).clearProgress === 'function') (survey as any).clearProgress('morning');
						if (typeof (survey as any).clearProgress === 'function') (survey as any).clearProgress('night');
					}}>
					<Text style={styles.buttonText}>Reset selected systems (Dragon / Items / Surveys)</Text>
				</Pressable>
			</View>

			{/* Cheats last */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>⚠️ Cheats</Text>
				<Pressable style={styles.button} onPress={simulateDay}>
					<Text style={styles.buttonText}>Simulate Day (no alert)</Text>
				</Pressable>
				<View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
					<Pressable style={styles.smallButton} onPress={agePlus}>
						<Text style={styles.smallButtonText}>+1 Age</Text>
					</Pressable>
					<Pressable style={styles.smallButton} onPress={ageMinus}>
						<Text style={styles.smallButtonText}>-1 Age</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, flex: 1 },
	title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
	section: { marginBottom: 20 },
	sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
	button: { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 8 },
	buttonText: { fontWeight: '700' },
	smallButton: { padding: 10, backgroundColor: '#e9e9e9', borderRadius: 8 },
	smallButtonText: { fontWeight: '700' },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
	rowButtons: { flexDirection: 'row', gap: 8, marginBottom: 6 },
	label: { fontSize: 14, color: '#333' },
	value: { fontSize: 14, color: '#666' },
	bigButton: { padding: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
});
