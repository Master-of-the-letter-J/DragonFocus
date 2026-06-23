import { ActionButton, EmptyState, Panel, SectionTabs, StatTile } from '@/components/DragonFocusUI';
import TopHeader from '@/components/TopHeader';
import { clearAppStorage } from '@/constants/storage';
import { DRAGON_FOCUS_GAMEMODES, type GameModeId } from '@/data/dragon-focus-2-data';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useDragonFocus, type MenuShortcutId } from '@/context/DragonFocusProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useFury } from '@/context/FuryProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import Slider from '@react-native-community/slider';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

type OptionsTab = 'general' | 'surveys' | 'tutorial';

const OPTIONS_TABS: Array<{ key: OptionsTab; label: string }> = [
	{ key: 'general', label: 'General' },
	{ key: 'surveys', label: 'Surveys' },
	{ key: 'tutorial', label: 'Tutorial' },
];

const MENU_LABELS: Record<MenuShortcutId, string> = {
	checkIn: 'Take Check-In Survey',
	checkOut: 'Take Check-Out Survey',
	incompleteGoals: 'View Incomplete Goals',
	completedGoals: 'View Completed Goals / Harvest',
	pomodoro: 'View Pomodoro Cave',
	world: 'View World Tab',
	account: 'View Account Button',
	logs: 'View Logs Button',
	stats: 'View Stats Button',
	achievements: 'View Achievements Button',
	options: 'View Basic Options Button',
	gamemodes: 'View Game-Modes Button',
	tutorial: 'View Tutorial Button',
};

export default function OptionsPage() {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const [tab, setTab] = useState<OptionsTab>('general');
	const [modeDays, setModeDays] = useState('1');
	const focus = useDragonFocus();
	const survey = useSurvey();
	const dragon = useDragon();
	const fury = useFury();
	const coins = useDragonCoins();
	const orbs = useDragonOrbs();
	const shards = useShards();
	const souls = useDragonSouls();
	const embers = useDragonEmbers();
	const streak = useStreak();
	const population = usePopulation();
	const premium = usePremium();

	const unlockedMilestones = focus.getUnlockedMilestoneCount(coins.coins);

	const confirmReset = () => {
		Alert.alert('Reset All Data', 'This wipes local progress. Continue?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Continue',
				style: 'destructive',
				onPress: () =>
					Alert.alert('Second Warning', 'Currencies, logs, goals, dragon state, achievements, milestones, and settings will be cleared.', [
						{ text: 'Cancel', style: 'cancel' },
						{
							text: 'Continue',
							style: 'destructive',
							onPress: () =>
								Alert.alert('Third Warning', 'This cannot be undone from the app.', [
									{ text: 'Cancel', style: 'cancel' },
									{
										text: 'Final Warning',
										style: 'destructive',
										onPress: () =>
											Alert.alert('Type Reset Mentally', 'Last confirmation. Reset everything?', [
												{ text: 'Cancel', style: 'cancel' },
												{ text: 'Reset', style: 'destructive', onPress: () => void clearAppStorage() },
											]),
									},
								]),
						},
					]),
			},
		]);
	};

	const renderGeneral = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Panel>
				<Text style={styles.sectionTitle}>Main Settings</Text>
				<SliderRow label="Volume" value={focus.settings.volume} onChange={value => focus.setSetting('volume', value)} />
				<SliderRow label="Sound Effects" value={focus.settings.soundEffectsVolume} onChange={value => focus.setSetting('soundEffectsVolume', value)} />
				<SliderRow label="Brightness" value={focus.settings.brightness} onChange={value => focus.setSetting('brightness', value)} />
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Theme Settings</Text>
				<TextInput value={focus.settings.themeName} onChangeText={value => focus.setSetting('themeName', value)} style={styles.input} placeholder="Theme" placeholderTextColor={theme.colors.secondaryText} />
				<TextInput value={focus.settings.backgroundName} onChangeText={value => focus.setSetting('backgroundName', value)} style={styles.input} placeholder="Background" placeholderTextColor={theme.colors.secondaryText} />
				<ToggleRow label="Weather Effect: Rain" value={focus.settings.weatherRain} onValueChange={value => focus.setSetting('weatherRain', value)} />
				<ToggleRow label="Weather Effect: Tremors" value={focus.settings.weatherTremors} onValueChange={value => focus.setSetting('weatherTremors', value)} />
				<ToggleRow label="Weather Effect: Brightness Change" value={focus.settings.weatherBrightness} onValueChange={value => focus.setSetting('weatherBrightness', value)} />
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Gamemodes</Text>
				<Text style={styles.bodyText}>Set a timed mode in days. Nuclear timers are marked for future stricter enforcement; Hard+ is intentionally non-exitable.</Text>
				<TextInput value={modeDays} onChangeText={text => setModeDays(text.replace(/[^0-9]/g, '').slice(0, 3))} style={styles.input} keyboardType="number-pad" placeholder="Days" placeholderTextColor={theme.colors.secondaryText} />
				{DRAGON_FOCUS_GAMEMODES.map(mode => {
					const locked = unlockedMilestones < mode.milestoneRequired;
					const selected = focus.activeGameMode === mode.id;
					return (
						<View key={mode.id} style={[styles.modeRow, selected && styles.modeSelected]}>
							<View style={styles.modeText}>
								<Text style={styles.cardTitle}>{mode.name}</Text>
								<Text style={styles.bodyText}>{locked ? `Unlocks at milestone ${mode.milestoneRequired}. ` : ''}{mode.description}</Text>
							</View>
							<ActionButton label={selected ? 'Active' : 'Enter'} disabled={locked || selected} onPress={() => focus.setGameMode(mode.id as GameModeId, Number.parseInt(modeDays || '0', 10) || undefined, false)} />
						</View>
					);
				})}
				<ActionButton label="Exit Timed Mode" variant="secondary" disabled={focus.activeGameMode === 'hardPlus'} onPress={focus.clearTimedGameMode} />
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Reset All Data</Text>
				<Text style={styles.bodyText}>Four warnings guard the reset button because this clears local saved progress.</Text>
				<ActionButton label="Reset All Data" variant="danger" onPress={confirmReset} />
			</Panel>
			<Panel>
				<ToggleRow label="Enable Dev Mode" value={focus.settings.devMode} onValueChange={value => focus.setSetting('devMode', value)} />
				{focus.settings.devMode ? renderCheats() : <EmptyState title="Cheats Hidden" body="Enable Dev Mode to show local testing controls." />}
			</Panel>
		</ScrollView>
	);

	const renderCheats = () => (
		<View>
			<View style={styles.statGrid}>
				<StatTile label="Energy" value={String(Math.floor(coins.coins))} />
				<StatTile label="Dark Energy" value={String(Math.floor(orbs.orbs))} />
				<StatTile label="Shards" value={String(shards.shards)} />
				<StatTile label="Fury" value={String(fury.furyMeter)} />
			</View>
			<View style={styles.actionRow}>
				<ActionButton label="+100 Energy" onPress={() => coins.addCoins(100)} />
				<ActionButton label="+1,000 Energy" onPress={() => coins.addCoins(1000)} />
				<ActionButton label="x2 Energy" onPress={() => coins.addCoins(coins.coins)} />
				<ActionButton label="+100 Dark" onPress={() => orbs.earnOrbs(100, 'other')} />
				<ActionButton label="+100 Shards" onPress={() => shards.addShards(100)} />
				<ActionButton label="+10 Streak" onPress={() => streak.adjustStreak(10)} />
				<ActionButton label="+10 Plasma" onPress={() => souls.addSouls(10)} />
				<ActionButton label="+10 Anomalies" onPress={() => embers.earnEmbers(10)} />
				<ActionButton label="+1 Age" onPress={() => dragon.setAge?.(dragon.age + 1)} />
				<ActionButton label="-10 Fury" onPress={() => fury.addFury(-10)} />
				<ActionButton label="+10 Fury" onPress={() => fury.addFury(10)} />
				<ActionButton label="Simulate Day" onPress={() => {
					dragon.incrementAge();
					population.dailyPopulationUpdate(fury.furyMeter, dragon.age);
					survey.forceNewDay();
				}} />
				<ActionButton label="Premium Toggle" variant="secondary" onPress={() => premium.setPremium(!premium.isPremium)} />
			</View>
		</View>
	);

	const renderSurveys = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Panel>
				<Text style={styles.sectionTitle}>Top Menu Shortcuts</Text>
				{(Object.keys(MENU_LABELS) as MenuShortcutId[]).map(id => (
					<ToggleRow key={id} label={MENU_LABELS[id]} value={focus.menuShortcuts[id]} onValueChange={value => focus.setMenuShortcut(id, value)} />
				))}
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Survey Order & Requirements</Text>
				<ToggleRow label="Require Check-In" value={focus.settings.requireCheckIn} onValueChange={value => focus.setSetting('requireCheckIn', value)} />
				<ToggleRow label="Require Check-Out" value={focus.settings.requireCheckOut} onValueChange={value => focus.setSetting('requireCheckOut', value)} />
				<ToggleRow label="Give Survey Advice / Quotes / Fun Facts" value={focus.settings.showSurveyAdvice} onValueChange={value => focus.setSetting('showSurveyAdvice', value)} />
				<ToggleRow label="Ask a Mood Question" value={focus.settings.showMoodQuestion} onValueChange={value => focus.setSetting('showMoodQuestion', value)} />
				<ToggleRow label="See / Edit Incomplete Goals in Check-In" value={focus.settings.showGoalEditorInCheckIn} onValueChange={value => focus.setSetting('showGoalEditorInCheckIn', value)} />
				<ToggleRow label="See / Harvest Completed Goals in Check-Out" value={focus.settings.showHarvestInCheckOut} onValueChange={value => focus.setSetting('showHarvestInCheckOut', value)} />
				<ToggleRow label="Enable Journal" value={focus.settings.showJournal} onValueChange={value => focus.setSetting('showJournal', value)} />
				<ToggleRow label="Show a Quote" value={focus.settings.showQuote} onValueChange={value => focus.setSetting('showQuote', value)} />
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Unlock Planning</Text>
				{['Categories for 10 energy', 'Importance for 10 energy', 'Custom categories for 5 energy', 'Challenges for 20 energy', 'Short answers and trivia after journal unlock'].map(item => (
					<Text key={item} style={styles.bullet}>- {item}</Text>
				))}
			</Panel>
		</ScrollView>
	);

	const renderTutorial = () => (
		<ScrollView contentContainerStyle={styles.content}>
			{[
				['Goals', 'Use Hatchery to create to-do and habit directives. Complete them directly or during check-out. Harvest completed directives for energy and occasional shards.'],
				['Pomodoro', 'Choose a to-do, start the Pomodoro Cave timer, and keep the focus surface uncluttered while the session runs.'],
				['Currencies', 'Energy buys production. Dark Energy powers advanced upgrades. Crimson Shards unlock premium-style shortcuts. Plasma and Anomalies come from prestige loops.'],
				['Milestones', 'Milestones unlock logs, achievements, markets, Armageddon, Transcension, and future missions as energy grows.'],
				['Dragon Fury', 'Fury rises from neglect and can threaten population. Completed goals, streaks, and calm modes reduce pressure.'],
			].map(section => (
				<Panel key={section[0]}>
					<Text style={styles.sectionTitle}>{section[0]}</Text>
					<Text style={styles.bodyText}>{section[1]}</Text>
				</Panel>
			))}
		</ScrollView>
	);

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<SectionTabs tabs={OPTIONS_TABS} active={tab} onChange={setTab} />
			{tab === 'general' ? renderGeneral() : null}
			{tab === 'surveys' ? renderSurveys() : null}
			{tab === 'tutorial' ? renderTutorial() : null}
		</View>
	);
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.sliderRow}>
			<View style={styles.sliderHeader}>
				<Text style={styles.toggleLabel}>{label}</Text>
				<Text style={styles.toggleValue}>{Math.round(value)}</Text>
			</View>
			<Slider minimumValue={0} maximumValue={100} step={1} value={value} onValueChange={onChange} minimumTrackTintColor={theme.colors.buttonBackground} maximumTrackTintColor={theme.colors.border} />
		</View>
	);
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.toggleRow}>
			<Text style={styles.toggleLabel}>{label}</Text>
			<Switch value={value} onValueChange={onValueChange} />
		</View>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.background },
		content: { padding: 14, paddingBottom: 36 },
		sectionTitle: { color: colors.headerText, fontSize: 18, fontWeight: '900', marginBottom: 8 },
		cardTitle: { color: colors.titleText, fontSize: 15, fontWeight: '900' },
		bodyText: { color: colors.text, fontSize: 13, lineHeight: 20 },
		input: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontWeight: '700' },
		modeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
		modeSelected: { backgroundColor: colors.tertiaryBackground },
		modeText: { flex: 1 },
		actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
		statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
		toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 11 },
		toggleLabel: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '800' },
		toggleValue: { color: colors.secondaryText, fontSize: 12, fontWeight: '900' },
		sliderRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
		sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
		bullet: { color: colors.text, fontSize: 13, marginTop: 7, lineHeight: 18 },
	});
