import { useAscension } from '@/context/AscensionProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useItemCore } from '@/context/ItemCoreProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useWeather } from '@/context/WeatherProvider';
import Slider from '@react-native-community/slider';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

type VolumeKey = 'music' | 'sounds' | 'ambient' | 'dragonSounds';

export default function GeneralSettings() {
	const dragon = useDragon();
	const itemCore = useItemCore();
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const survey = useSurvey();
	const theme = useTheme();
	const weather = useWeather();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const premium = usePremium();
	const streak = useStreak();
	const shards = useShards();
	const souls = useDragonSouls();
	const coins = useDragonCoins();
	const ascension = useAscension();

	const [volumes, setVolumes] = useState({ music: 0.7, sounds: 0.8, ambient: 0.5, dragonSounds: 0.9 });
	const [devMode, setDevMode] = useState(false);

	const handleVolumeChange = (key: VolumeKey, value: number) => setVolumes(prev => ({ ...prev, [key]: value }));

	const simulateDay = () => {
		dragon.incrementAge?.();
		itemEconomy.processDailyPayouts?.();
		survey.forceNewDay();
	};

	const resourceSummary = useMemo(
		() =>
			`${coins.getCoins().toFixed(0)} coins | ${shards.getShards()} shards | ${souls.getSouls()} souls | streak ${streak.getStreak()} | scar ${scarLevel.currentScarLevel}`,
		[coins, scarLevel.currentScarLevel, shards, souls, streak],
	);

	const applyCoinMultiplier = (factor: number) => {
		const current = coins.getCoins();
		if (current <= 0 || factor <= 1) return;
		coins.addCoins(current * (factor - 1));
	};

	const applyShardMultiplier = (factor: number) => {
		const current = shards.getShards();
		if (current <= 0 || factor <= 1) return;
		shards.addShards(current * (factor - 1));
	};

	const applySoulMultiplier = (factor: number) => {
		const current = souls.getSouls();
		if (current <= 0 || factor <= 1) return;
		souls.addSouls(current * (factor - 1));
	};

	const applyStreakMultiplier = (factor: number) => {
		const current = streak.getStreak();
		if (current <= 0 || factor <= 1) return;
		streak.adjustStreak(current * (factor - 1));
	};

	const adjustAge = (delta: number) => {
		dragon.setAge?.((dragon.age ?? 0) + delta);
	};

	const adjustHp = (delta: number) => {
		dragon.setHp?.((dragon.hp ?? 0) + delta);
	};

	const resetEverythingVisible = () => {
		dragon.resetDragon?.();
		itemCore.resetInventory?.();
		survey.clearProgress?.('morning');
		survey.clearProgress?.('night');
		survey.forceNewDay();
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
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
				<Text style={styles.infoText}>Brightness: {theme.brightness.replaceAll('_', ' ')}</Text>
				<Text style={styles.infoText}>Dynamic weather: {weather.enabled ? 'On' : 'Off'}</Text>
				<View style={styles.buttonRow}>
					<ActionButton label="Light" onPress={() => theme.setMode('light')} variant="ghost" />
					<ActionButton label="Dark" onPress={() => theme.setMode('dark')} variant="ghost" />
					<ActionButton label="Dungeon" onPress={() => theme.setBackgroundTheme('dungeon')} variant="ghost" />
					<ActionButton label="Castle" onPress={() => theme.setBackgroundTheme('castlePlains')} variant="ghost" />
					<ActionButton label="Volcano" onPress={() => theme.setBackgroundTheme('volcano')} variant="ghost" />
					<ActionButton label="Forest" onPress={() => theme.setBackgroundTheme('forest')} variant="ghost" />
				</View>
				<View style={styles.buttonRow}>
					<ActionButton label="Bright" onPress={() => theme.setBrightness('bright')} variant="ghost" />
					<ActionButton label="Slight Bright" onPress={() => theme.setBrightness('slight_bright')} variant="ghost" />
					<ActionButton label="Normal" onPress={() => theme.setBrightness('normal')} variant="ghost" />
					<ActionButton label="Slight Dim" onPress={() => theme.setBrightness('slight_dimmer')} variant="ghost" />
					<ActionButton label="Dim" onPress={() => theme.setBrightness('dimmer')} variant="ghost" />
				</View>
				<SettingRow label="Enable dynamic weather" value={weather.enabled} onValueChange={weather.setEnabled} />
				<SettingRow label="Enable premium Dragon Pact" value={premium.isPremium} onValueChange={premium.setPremium} />
				<SettingRow label="Dragon invincibility" value={!!dragon.invincible} onValueChange={value => dragon.setInvincible?.(value)} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Reset</Text>
				<Text style={styles.helperText}>This clears the dragon, visible market inventory, and in-progress survey state.</Text>
				<Pressable style={styles.primaryButton} onPress={resetEverythingVisible}>
					<Text style={styles.primaryButtonText}>Reset Dragon, Market Inventory, and Survey Progress</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Cheats</Text>
				<SettingRow label="Enable Dev Mode" value={devMode} onValueChange={setDevMode} />

				{devMode && (
					<>
						<Text style={styles.helperText}>Current resources: {resourceSummary}</Text>

						<Text style={styles.sectionLabel}>Day Flow</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="Simulate Day" onPress={simulateDay} />
							<ActionButton label="Force New Day" onPress={survey.forceNewDay} />
							<ActionButton label="Try Ascend" onPress={() => ascension.ascend()} />
							<ActionButton label="Clear Effects" onPress={() => itemSnacks.clearEffects(true)} />
						</View>

						<Text style={styles.sectionLabel}>Dragon</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="Spawn" onPress={() => dragon.spawnDragon()} />
							<ActionButton label="Kill" onPress={() => dragon.die()} />
							<ActionButton label="Revive" onPress={() => dragon.revive()} />
							<ActionButton label="-1000 Age" onPress={() => adjustAge(-1000)} />
							<ActionButton label="-10 Age" onPress={() => adjustAge(-10)} />
							<ActionButton label="-1 Age" onPress={() => adjustAge(-1)} />
							<ActionButton label="+1 Age" onPress={() => adjustAge(1)} />
							<ActionButton label="+10 Age" onPress={() => adjustAge(10)} />
							<ActionButton label="+1000 Age" onPress={() => adjustAge(1000)} />
						</View>

						<Text style={styles.sectionLabel}>Coins</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+1" onPress={() => coins.addCoins(1)} />
							<ActionButton label="+10" onPress={() => coins.addCoins(10)} />
							<ActionButton label="+100" onPress={() => coins.addCoins(100)} />
							<ActionButton label="+1000" onPress={() => coins.addCoins(1000)} />
							<ActionButton label="+10000000" onPress={() => coins.addCoins(10_000_000)} />
							<ActionButton label="x2" onPress={() => applyCoinMultiplier(2)} />
							<ActionButton label="x10" onPress={() => applyCoinMultiplier(10)} />
						</View>

						<Text style={styles.sectionLabel}>Shards</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+1" onPress={() => shards.addShards(1)} />
							<ActionButton label="+10" onPress={() => shards.addShards(10)} />
							<ActionButton label="+100" onPress={() => shards.addShards(100)} />
							<ActionButton label="+1000" onPress={() => shards.addShards(1000)} />
							<ActionButton label="+10000000" onPress={() => shards.addShards(10_000_000)} />
							<ActionButton label="x2" onPress={() => applyShardMultiplier(2)} />
							<ActionButton label="x10" onPress={() => applyShardMultiplier(10)} />
						</View>

						<Text style={styles.sectionLabel}>Souls</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+1" onPress={() => souls.addSouls(1)} />
							<ActionButton label="+10" onPress={() => souls.addSouls(10)} />
							<ActionButton label="+100" onPress={() => souls.addSouls(100)} />
							<ActionButton label="+1000" onPress={() => souls.addSouls(1000)} />
							<ActionButton label="+10000000" onPress={() => souls.addSouls(10_000_000)} />
							<ActionButton label="x2" onPress={() => applySoulMultiplier(2)} />
							<ActionButton label="x10" onPress={() => applySoulMultiplier(10)} />
						</View>

						<Text style={styles.sectionLabel}>Streak & Fire XP</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+1 Streak" onPress={() => streak.adjustStreak(1)} />
							<ActionButton label="+10 Streak" onPress={() => streak.adjustStreak(10)} />
							<ActionButton label="+100 Streak" onPress={() => streak.adjustStreak(100)} />
							<ActionButton label="x2 Streak" onPress={() => applyStreakMultiplier(2)} />
							<ActionButton label="x10 Streak" onPress={() => applyStreakMultiplier(10)} />
							<ActionButton label="+1 XP" onPress={() => scarLevel.addXP(1)} />
							<ActionButton label="+10 XP" onPress={() => scarLevel.addXP(10)} />
							<ActionButton label="+100 XP" onPress={() => scarLevel.addXP(100)} />
							<ActionButton label="+1000 XP" onPress={() => scarLevel.addXP(1000)} />
							<ActionButton label="+10000000 XP" onPress={() => scarLevel.addXP(10_000_000)} />
						</View>

						<Text style={styles.sectionLabel}>Fury & Health</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="-100 Fury" onPress={() => fury.addFury(-100)} />
							<ActionButton label="-10 Fury" onPress={() => fury.addFury(-10)} />
							<ActionButton label="-1 Fury" onPress={() => fury.addFury(-1)} />
							<ActionButton label="+1 Fury" onPress={() => fury.addFury(1)} />
							<ActionButton label="+10 Fury" onPress={() => fury.addFury(10)} />
							<ActionButton label="+100 Fury" onPress={() => fury.addFury(100)} />
							<ActionButton label="-100 HP" onPress={() => adjustHp(-100)} />
							<ActionButton label="-10 HP" onPress={() => adjustHp(-10)} />
							<ActionButton label="-1 HP" onPress={() => adjustHp(-1)} />
							<ActionButton label="+1 HP" onPress={() => adjustHp(1)} />
							<ActionButton label="+10 HP" onPress={() => adjustHp(10)} />
							<ActionButton label="+100 HP" onPress={() => adjustHp(100)} />
						</View>
					</>
				)}
			</View>
		</ScrollView>
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

function SettingRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
	return (
		<View style={styles.settingRow}>
			<Text style={styles.settingLabel}>{label}</Text>
			<Switch value={value} onValueChange={onValueChange} />
		</View>
	);
}

function ActionButton({ label, onPress, variant = 'default' }: { label: string; onPress: () => void; variant?: 'default' | 'ghost' }) {
	return (
		<Pressable style={[styles.cheatButton, variant === 'ghost' && styles.ghostButton]} onPress={onPress}>
			<Text style={[styles.cheatButtonText, variant === 'ghost' && styles.ghostButtonText]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, paddingBottom: 40 },
	title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
	card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 14 },
	cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: '#111827' },
	infoText: { color: '#4B5563', marginBottom: 6 },
	helperText: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginBottom: 10 },
	sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	sliderLabel: { color: '#374151', fontWeight: '700' },
	sliderValue: { color: '#6B7280', fontWeight: '700' },
	buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
	ghostButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB' },
	ghostButtonText: { color: '#374151' },
	primaryButton: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
	primaryButtonText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
	cheatButton: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
	cheatButtonText: { color: '#111827', fontWeight: '800' },
	sectionLabel: { fontSize: 13, fontWeight: '800', color: '#111827', marginTop: 8 },
	settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
	settingLabel: { flex: 1, paddingRight: 12, color: '#374151', fontWeight: '600' },
});
