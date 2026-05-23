import { useAscension } from '@/context/AscensionProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useDragonAttacks } from '@/context/DragonAttacksProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useItemCore } from '@/context/ItemCoreProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { usePremium } from '@/context/PremiumProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme, type BackgroundTheme } from '@/context/ThemeProvider';
import { useWeather } from '@/context/WeatherProvider';
import Slider from '@react-native-community/slider';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

type VolumeKey = 'music' | 'sounds' | 'ambient' | 'dragonSounds';

export default function GeneralSettings() {
	const dragon = useDragon();
	const attacks = useDragonAttacks();
	const itemCore = useItemCore();
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const survey = useSurvey();
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	const weather = useWeather();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const premium = usePremium();
	const population = usePopulation();
	const streak = useStreak();
	const shards = useShards();
	const orbs = useDragonOrbs();
	const souls = useDragonSouls();
	const coins = useDragonCoins();
	const ascension = useAscension();

	const [volumes, setVolumes] = useState({ music: 0.7, sounds: 0.8, ambient: 0.5, dragonSounds: 0.9 });
	const [devMode, setDevMode] = useState(false);
	const [cheatAmountInput, setCheatAmountInput] = useState('1000000');

	const handleVolumeChange = (key: VolumeKey, value: number) => setVolumes(prev => ({ ...prev, [key]: value }));

	const simulateDay = () => {
		const today = new Date().toISOString().split('T')[0];
		const skippedSurveyCount = Number(!(survey.morningSurveyCompleted && survey.lastMorningSurveyDate === today)) + Number(!(survey.nightSurveyCompleted && survey.lastNightSurveyDate === today));

		dragon.incrementAge?.();
		itemEconomy.processDailyPayouts?.();
		population.dailyPopulationUpdate(fury.furyMeter, dragon.age);
		if (skippedSurveyCount > 0) fury.incrementFuryFromSkippedSurveys(skippedSurveyCount);
		dragon.dailyHealthPenalty(fury.furyMeter);
		survey.forceNewDay();
	};

	const resourceSummary = useMemo(
		() =>
			`${coins.getCoins().toFixed(0)} coins | ${shards.getShards()} shards | ${orbs.getOrbs()} orbs | ${souls.getSouls()} souls | streak ${streak.getStreak()} | scar ${scarLevel.currentScarLevel}`,
		[coins, orbs, scarLevel.currentScarLevel, shards, souls, streak],
	);

	const themeChoices: { id: BackgroundTheme; label: string; swatch: string }[] = [
		{ id: 'dungeon', label: 'Dungeon', swatch: '#9F5427' },
		{ id: 'castlePlains', label: 'Castle', swatch: '#6D9C52' },
		{ id: 'forest', label: 'Forest', swatch: '#4E9A61' },
		{ id: 'sky', label: 'Sky', swatch: '#5B9CC4' },
		{ id: 'space', label: 'Space', swatch: '#5F85DB' },
		{ id: 'volcano', label: 'Volcano', swatch: '#E45B2A' },
		{ id: 'ocean', label: 'Ocean', swatch: '#0E7490' },
		{ id: 'aurora', label: 'Aurora', swatch: '#7C3AED' },
		{ id: 'crystal', label: 'Crystal', swatch: '#C026D3' },
	];

	const parseCheatAmount = () => {
		const parsed = Number.parseInt(cheatAmountInput.replace(/,/g, ''), 10);
		if (Number.isNaN(parsed)) return 1;
		return Math.max(1, Math.min(1_000_000_000, parsed));
	};

	const runProductionTicks = (seconds: number) => {
		itemEconomy.simulateProductionSeconds(Math.max(1, Math.min(100_000, seconds)));
	};

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
				<SettingRow label="Dark mode" value={theme.mode === 'dark'} onValueChange={value => theme.setMode(value ? 'dark' : 'light')} />
				<Text style={styles.sectionLabel}>Background Theme</Text>
				<View style={styles.themeGrid}>
					{themeChoices.map(choice => (
						<Pressable key={choice.id} style={[styles.themeChoice, theme.backgroundTheme === choice.id && styles.themeChoiceActive]} onPress={() => theme.setBackgroundTheme(choice.id)}>
							<View style={[styles.themeSwatch, { backgroundColor: choice.swatch }]} />
							<Text style={[styles.themeChoiceText, theme.backgroundTheme === choice.id && styles.themeChoiceTextActive]}>{choice.label}</Text>
						</Pressable>
					))}
				</View>
				<Text style={styles.sectionLabel}>Brightness</Text>
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
						<Text style={styles.helperText}>Cheat amount is clamped from 1 to 1,000,000,000.</Text>
						<TextInput value={cheatAmountInput} onChangeText={setCheatAmountInput} keyboardType="number-pad" style={styles.cheatInput} placeholder="Cheat amount" placeholderTextColor={theme.colors.secondaryText} />

						<Text style={styles.sectionLabel}>Day Flow</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="Simulate Day" onPress={simulateDay} />
							<ActionButton label="Force New Day" onPress={survey.forceNewDay} />
							<ActionButton label="Try Ascend" onPress={() => ascension.ascend()} />
							<ActionButton label="Clear Effects" onPress={() => itemSnacks.clearEffects(true)} />
						</View>

						<Text style={styles.sectionLabel}>Production Speed</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="Run 1s Tick" onPress={() => runProductionTicks(1)} />
							<ActionButton label="Run 1h Ticks" onPress={() => runProductionTicks(3600)} />
							<ActionButton label="Run 1 Day Ticks" onPress={() => runProductionTicks(86_400)} />
							<ActionButton label="Run 100K Ticks" onPress={() => runProductionTicks(100_000)} />
							<ActionButton label="Coin Mult x86400" onPress={() => coins.setExternalCoinMultiplier(86_400)} />
							<ActionButton label="Coin Mult x1" onPress={() => coins.setExternalCoinMultiplier(1)} />
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
							<ActionButton label="+Amount" onPress={() => coins.addCoins(parseCheatAmount())} />
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
							<ActionButton label="+Amount" onPress={() => shards.addShards(parseCheatAmount())} />
							<ActionButton label="+10000000" onPress={() => shards.addShards(10_000_000)} />
							<ActionButton label="x2" onPress={() => applyShardMultiplier(2)} />
							<ActionButton label="x10" onPress={() => applyShardMultiplier(10)} />
						</View>

						<Text style={styles.sectionLabel}>Orbs</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+1" onPress={() => orbs.earnOrbs(1, 'other')} />
							<ActionButton label="+100" onPress={() => orbs.earnOrbs(100, 'other')} />
							<ActionButton label="+Amount" onPress={() => orbs.earnOrbs(parseCheatAmount(), 'other')} />
						</View>

						<Text style={styles.sectionLabel}>Souls</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+1" onPress={() => souls.addSouls(1)} />
							<ActionButton label="+10" onPress={() => souls.addSouls(10)} />
							<ActionButton label="+100" onPress={() => souls.addSouls(100)} />
							<ActionButton label="+1000" onPress={() => souls.addSouls(1000)} />
							<ActionButton label="+Amount" onPress={() => souls.addSouls(parseCheatAmount())} />
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

						<Text style={styles.sectionLabel}>Population & Armies</Text>
						<View style={styles.buttonRow}>
							<ActionButton label="+Population" onPress={() => population.addPopulation(parseCheatAmount())} />
							<ActionButton label="Kill Amount" onPress={() => population.destroyPopulation(parseCheatAmount())} />
							<ActionButton label="Kill Population" onPress={() => population.destroyPopulation(population.population)} />
							<ActionButton label="+Army" onPress={() => attacks.addObsidianLegions(parseCheatAmount())} />
							<ActionButton label="+Dragon Guards" onPress={() => attacks.addDragonGuards(parseCheatAmount())} />
							<ActionButton label="Reset War" onPress={() => attacks.resetDragonAttacks()} />
						</View>
					</>
				)}
			</View>
		</ScrollView>
	);
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
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
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.settingRow}>
			<Text style={styles.settingLabel}>{label}</Text>
			<Switch value={value} onValueChange={onValueChange} />
		</View>
	);
}

function ActionButton({ label, onPress, variant = 'default' }: { label: string; onPress: () => void; variant?: 'default' | 'ghost' }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<Pressable style={[styles.cheatButton, variant === 'ghost' && styles.ghostButton]} onPress={onPress}>
			<Text style={[styles.cheatButtonText, variant === 'ghost' && styles.ghostButtonText]}>{label}</Text>
		</Pressable>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
	container: { padding: 16, paddingBottom: 40 },
	title: { fontSize: 24, fontWeight: '800', color: colors.titleText, marginBottom: 12 },
	card: { backgroundColor: colors.secondaryBackground, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
	cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: colors.titleText },
	infoText: { color: colors.text, marginBottom: 6 },
	helperText: { color: colors.secondaryText, fontSize: 12, lineHeight: 18, marginBottom: 10 },
	sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	sliderLabel: { color: colors.headerText, fontWeight: '700' },
	sliderValue: { color: colors.secondaryText, fontWeight: '700' },
	buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
	themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 4 },
	themeChoice: { minWidth: 96, flexGrow: 1, flexBasis: '30%', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryBackground, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 10 },
	themeChoiceActive: { borderColor: colors.tint, backgroundColor: colors.tertiaryBackground },
	themeSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: colors.border },
	themeChoiceText: { color: colors.headerText, fontWeight: '800', fontSize: 12 },
	themeChoiceTextActive: { color: colors.titleText },
	ghostButton: { backgroundColor: colors.primaryBackground, borderWidth: 1, borderColor: colors.border },
	ghostButtonText: { color: colors.headerText },
	primaryButton: { backgroundColor: colors.buttonBackground, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
	primaryButtonText: { color: colors.buttonText, fontWeight: '800', textAlign: 'center' },
	cheatButton: { backgroundColor: colors.tertiaryBackground, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
	cheatButtonText: { color: colors.titleText, fontWeight: '800' },
	cheatInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.inputBackground, marginBottom: 8 },
	sectionLabel: { fontSize: 13, fontWeight: '800', color: colors.titleText, marginTop: 8 },
	settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
	settingLabel: { flex: 1, paddingRight: 12, color: colors.headerText, fontWeight: '600' },
});
