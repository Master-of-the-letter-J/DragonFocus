import { useAscension } from '@/context/AscensionProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useItems } from '@/context/ItemsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useWeather } from '@/context/WeatherProvider';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function GeneralSettings() {
	const dragon = useDragon();
	const items = useItems();
	const survey = useSurvey();
	const theme = useTheme();
	const weather = useWeather();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const shards = useShards();
	const souls = useDragonSouls();
	const coins = useDragonCoins();
	const ascension = useAscension();

	const [volumes, setVolumes] = useState({ music: 0.7, sounds: 0.8, ambient: 0.5, dragonSounds: 0.9 });
	const [devMode, setDevMode] = useState(false);

	const handleVolumeChange = (key: keyof typeof volumes, value: number) => setVolumes(prev => ({ ...prev, [key]: value }));

	const simulateDay = () => {
		dragon.incrementAge?.();
		items.processDailyPayouts?.();
	};

	const forceNewDay = () => {
		const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
		survey.setLastMorningSurveyDate(yesterday);
		survey.setLastNightSurveyDate(yesterday);
		survey.resetDailySurveys();
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>General Settings</Text>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Audio & Atmosphere</Text>
				<SliderRow label="Music" value={volumes.music} onChange={value => handleVolumeChange('music', value)} />
				<SliderRow label="Sound Effects" value={volumes.sounds} onChange={value => handleVolumeChange('sounds', value)} />
				<SliderRow label="Ambient" value={volumes.ambient} onChange={value => handleVolumeChange('ambient', value)} />
				<SliderRow label="Dragon Sounds" value={volumes.dragonSounds} onChange={value => handleVolumeChange('dragonSounds', value)} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Theme & Weather</Text>
				<Text style={styles.infoText}>Theme mode: {theme.mode}</Text>
				<Text style={styles.infoText}>Background theme: {theme.backgroundTheme}</Text>
				<Text style={styles.infoText}>Weather enabled: {weather.enabled ? 'Yes' : 'No'}</Text>
				<View style={styles.buttonRow}>
					<Pressable style={styles.ghostButton} onPress={() => theme.setMode('light')}>
						<Text style={styles.ghostButtonText}>Light</Text>
					</Pressable>
					<Pressable style={styles.ghostButton} onPress={() => theme.setMode('dark')}>
						<Text style={styles.ghostButtonText}>Dark</Text>
					</Pressable>
					<Pressable style={styles.ghostButton} onPress={() => theme.setBackgroundTheme('castlePlains')}>
						<Text style={styles.ghostButtonText}>Castle</Text>
					</Pressable>
					<Pressable style={styles.ghostButton} onPress={() => theme.setBackgroundTheme('volcano')}>
						<Text style={styles.ghostButtonText}>Volcano</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Reset</Text>
				<Pressable
					style={styles.primaryButton}
					onPress={() => {
						dragon.resetDragon?.();
						items.resetInventory?.();
						survey.clearProgress?.('morning');
						survey.clearProgress?.('night');
					}}>
					<Text style={styles.primaryButtonText}>Reset Dragon, Shop Inventory, and Survey Progress</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Cheats</Text>
				<Pressable style={styles.primaryButton} onPress={() => setDevMode(value => !value)}>
					<Text style={styles.primaryButtonText}>{devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}</Text>
				</Pressable>

				{devMode && (
					<>
						<Text style={styles.helperText}>Current resources: {coins.getCoins().toFixed(0)} coins • {shards.getShards()} shards • {souls.getSouls()} souls • Scar {scarLevel.currentScarLevel}</Text>
						<View style={styles.buttonRow}>
							<Pressable style={styles.cheatButton} onPress={simulateDay}>
								<Text style={styles.cheatButtonText}>Simulate Day</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={forceNewDay}>
								<Text style={styles.cheatButtonText}>Force New Day</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => dragon.spawnDragon()}>
								<Text style={styles.cheatButtonText}>Spawn</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => dragon.die()}>
								<Text style={styles.cheatButtonText}>Kill Dragon</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => dragon.revive()}>
								<Text style={styles.cheatButtonText}>Revive</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => dragon.incrementAge()}>
								<Text style={styles.cheatButtonText}>+1 Age</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => coins.addCoins(1000)}>
								<Text style={styles.cheatButtonText}>+1000 Coins</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => shards.addShards(25)}>
								<Text style={styles.cheatButtonText}>+25 Shards</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => souls.addSouls(25)}>
								<Text style={styles.cheatButtonText}>+25 Souls</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => scarLevel.addXP(5000)}>
								<Text style={styles.cheatButtonText}>+5000 XP</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => fury.addFury(-10)}>
								<Text style={styles.cheatButtonText}>-10 Fury</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => fury.addFury(10)}>
								<Text style={styles.cheatButtonText}>+10 Fury</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => items.clearEffects(true)}>
								<Text style={styles.cheatButtonText}>Clear Effects</Text>
							</Pressable>
							<Pressable style={styles.cheatButton} onPress={() => ascension.ascend()}>
								<Text style={styles.cheatButtonText}>Try Ascend</Text>
							</Pressable>
						</View>
					</>
				)}
			</View>
		</View>
	);
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
	return (
		<View style={{ marginBottom: 12 }}>
			<View style={styles.sliderLabelRow}>
				<Text style={styles.sliderLabel}>{label}</Text>
				<Text style={styles.sliderValue}>{Math.round(value * 100)}%</Text>
			</View>
			<Slider value={value} onValueChange={onChange} minimumValue={0} maximumValue={1} step={0.01} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, flex: 1 },
	title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
	card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 14 },
	cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: '#111827' },
	infoText: { color: '#4B5563', marginBottom: 6 },
	helperText: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginVertical: 10 },
	sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	sliderLabel: { color: '#374151', fontWeight: '700' },
	sliderValue: { color: '#6B7280', fontWeight: '700' },
	buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
	ghostButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB' },
	ghostButtonText: { color: '#374151', fontWeight: '700' },
	primaryButton: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
	primaryButtonText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
	cheatButton: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
	cheatButtonText: { color: '#111827', fontWeight: '800' },
});
