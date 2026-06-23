import { ActionButton, EmptyState, Panel, SectionTabs, StatTile } from '@/components/DragonFocusUI';
import TopHeader from '@/components/TopHeader';
import { formatAbbreviatedNumber, formatPopulationNumber } from '@/constants/number-abbreviation';
import { SECRET_GOVERNMENT_LOGS } from '@/data/dragon-focus-2-data';
import { useAchievements } from '@/context/AchievementsProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useGraveyard } from '@/context/GraveyardProvider';
import { useJournal } from '@/context/JournalProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

type ArchivesTab = 'pact' | 'logs' | 'achievements' | 'statistics' | 'graveyard';

const ARCHIVE_TABS: Array<{ key: ArchivesTab; label: string }> = [
	{ key: 'pact', label: 'Pact' },
	{ key: 'logs', label: 'Logs' },
	{ key: 'achievements', label: 'Achievements' },
	{ key: 'statistics', label: 'Statistics' },
	{ key: 'graveyard', label: 'Graveyard' },
];

export default function ArchivesPage() {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const [tab, setTab] = useState<ArchivesTab>('pact');
	const premium = usePremium();
	const journal = useJournal();
	const achievements = useAchievements();
	const graveyard = useGraveyard();
	const dragon = useDragon();
	const goals = useGoals();
	const coins = useDragonCoins();
	const orbs = useDragonOrbs();
	const souls = useDragonSouls();
	const embers = useDragonEmbers();
	const shards = useShards();
	const population = usePopulation();
	const streak = useStreak();
	const survey = useSurvey();

	const days = journal.getEntriesByDay();
	const totalGoalsCompleted = journal.entries.reduce((sum, entry) => sum + (entry.goalsCompleted || 0), 0);
	const totalShardsEarned = journal.entries.reduce((sum, entry) => sum + (entry.rewards.shards || 0), 0);
	const averageReward = journal.entries.length ? journal.entries.reduce((sum, entry) => sum + (entry.rewards.coins || 0), 0) / journal.entries.length : 0;
	const highestReward = journal.entries.reduce((highest, entry) => Math.max(highest, entry.rewards.coins || 0), 0);

	const renderPact = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Panel>
				<Text style={styles.sectionTitle}>Dragon Pact / Account</Text>
				<Text style={styles.bodyText}>Profile login is reserved for the future account system. Local progress is already saved for currencies, logs, goals, achievements, dragon state, milestones, and options.</Text>
				<View style={styles.actionRow}>
					<ActionButton label="Sign Up Placeholder (+50 shards)" onPress={() => {
						shards.addShards(50);
						Alert.alert('Account Placeholder', 'A real account flow will replace this. Added 50 crimson shards for sign-up testing.');
					}} />
					<ActionButton label={premium.isPremium ? 'Dragon Pact Active' : 'Enable Pact Test'} variant="secondary" onPress={() => premium.setPremium(!premium.isPremium)} />
				</View>
			</Panel>
			{[
				['Monthly', '$1.99 / month', 'Flexible access to premium progression.'],
				['Yearly', '$4.99 / year', 'Launch-friendly annual pricing.'],
				['Permanent', '$9.99 once', 'Permanent Dragon Pact access.'],
			].map(plan => (
				<Panel key={plan[0]}>
					<View style={styles.planHeader}>
						<Text style={styles.cardTitle}>{plan[0]}</Text>
						<Text style={styles.priceText}>{plan[1]}</Text>
					</View>
					<Text style={styles.bodyText}>{plan[2]}</Text>
				</Panel>
			))}
			<Panel>
				<Text style={styles.sectionTitle}>Pact Benefits</Text>
				{['Unlimited habit and to-do goals', 'Crimson challenges', '2x energy and dark energy production', '4x shard cap from goals', '10% black market bonuses'].map(item => (
					<Text key={item} style={styles.bullet}>- {item}</Text>
				))}
			</Panel>
		</ScrollView>
	);

	const renderLogs = () => (
		<ScrollView horizontal contentContainerStyle={styles.tableOuter}>
			<ScrollView contentContainerStyle={styles.tableInner}>
				<View style={[styles.tableRow, styles.tableHeader]}>
					{['Date', 'Mood In', 'Mood Out', 'Goals Done', 'Late', 'Remain', 'Journal'].map(column => (
						<Text key={column} style={[styles.tableCell, styles.tableHeaderText]}>{column}</Text>
					))}
				</View>
				{days.length === 0 ? (
					<View style={styles.tableEmpty}>
						<Text style={styles.bodyText}>No logs yet. Check-in and check-out surveys will populate this table.</Text>
					</View>
				) : null}
				{days.map(day => {
					const morning = day.morning;
					const evening = day.evening;
					const remain = Math.max(0, (evening?.goalsIncomplete ?? morning?.goalsIncomplete ?? 0));
					return (
						<View key={day.date} style={styles.tableRow}>
							<Text style={styles.tableCell}>{day.date}</Text>
							<Text style={styles.tableCell}>{morning?.moodMorning || '-'}</Text>
							<Text style={styles.tableCell}>{evening?.moodEvening || '-'}</Text>
							<Text style={styles.tableCell}>{evening?.goalsCompleted ?? morning?.goalsCompleted ?? 0}</Text>
							<Text style={styles.tableCell}>{evening?.todoFailed ?? 0}</Text>
							<Text style={styles.tableCell}>{remain}</Text>
							<Text style={styles.tableCell}>{evening?.text || morning?.text ? 'View' : '-'}</Text>
						</View>
					);
				})}
			</ScrollView>
		</ScrollView>
	);

	const renderAchievements = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<View style={styles.statGrid}>
				<StatTile label="Unlocked" value={`${achievements.unlockedCount} / ${achievements.totalCount}`} />
				<StatTile label="Crimson Reward Pool" value={formatAbbreviatedNumber(achievements.totalCount * 5)} />
			</View>
			<View style={styles.achievementGrid}>
				{achievements.achievements.map(item => (
					<View key={item.id} style={[styles.achievementCard, achievements.isUnlocked(item.id) && styles.achievementUnlocked]}>
						<Text style={styles.achievementIcon}>{item.emoji}</Text>
						<Text style={styles.achievementTitle}>{item.title}</Text>
						<Text style={styles.achievementProgress}>{achievements.isUnlocked(item.id) ? 'Complete' : '0%'}</Text>
					</View>
				))}
			</View>
		</ScrollView>
	);

	const renderStatistics = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Text style={styles.listHeader}>Survey Statistics</Text>
			<View style={styles.statGrid}>
				<StatTile label="Journal Entries" value={formatAbbreviatedNumber(journal.entries.length)} />
				<StatTile label="Goals Completed" value={formatAbbreviatedNumber(totalGoalsCompleted)} />
				<StatTile label="Open Habits" value={formatAbbreviatedNumber(goals.habits.length)} />
				<StatTile label="Open To-Dos" value={formatAbbreviatedNumber(goals.todos.filter(goal => !goal.completedDate).length)} />
				<StatTile label="Morning Progress" value={`${survey.getMorningProgress()}%`} />
				<StatTile label="Night Progress" value={`${survey.getNightProgress()}%`} />
				<StatTile label="Best Crimson Streak" value={formatAbbreviatedNumber(streak.streak)} />
				<StatTile label="Average Reward" value={formatAbbreviatedNumber(averageReward)} />
			</View>
			<Text style={styles.listHeader}>Reward Statistics</Text>
			<View style={styles.statGrid}>
				<StatTile label="Total Energy" value={formatAbbreviatedNumber(coins.totalCoinsEarned)} />
				<StatTile label="Energy Current Run" value={formatAbbreviatedNumber(coins.coinsSinceLastAscension)} />
				<StatTile label="Dark Energy" value={formatAbbreviatedNumber(orbs.totalOrbsEarned, 1000)} />
				<StatTile label="Crimson Shards" value={formatAbbreviatedNumber(totalShardsEarned || shards.shards)} />
				<StatTile label="Plasma" value={formatAbbreviatedNumber(souls.totalSoulsEarned)} />
				<StatTile label="Anomalies" value={formatAbbreviatedNumber(embers.totalEmbersEarned)} />
				<StatTile label="Highest Reward Day" value={formatAbbreviatedNumber(highestReward)} />
				<StatTile label="Population" value={formatPopulationNumber(population.population)} />
			</View>
			<Text style={styles.listHeader}>Secret Government Logs</Text>
			{SECRET_GOVERNMENT_LOGS.map((log, index) => (
				<Panel key={log.id}>
					<Text style={styles.cardTitle}>{index < Math.max(1, achievements.unlockedCount / 10) ? log.title : 'Classified File'}</Text>
					<Text style={styles.bodyText}>{index < Math.max(1, achievements.unlockedCount / 10) ? log.text : 'Unlock more achievements to decrypt this record.'}</Text>
				</Panel>
			))}
		</ScrollView>
	);

	const renderGraveyard = () => (
		<ScrollView contentContainerStyle={styles.content}>
			{graveyard.graveyard.length === 0 ? <EmptyState title="No deceased dragons" body="Graveyard records will appear after a dragon death and revival." /> : null}
			{graveyard.graveyard.map(entry => (
				<Panel key={entry.id}>
					<Text style={styles.cardTitle}>{entry.name}</Text>
					<Text style={styles.bodyText}>Generation {entry.generation} | Age {formatAbbreviatedNumber(entry.age)} | Stage {entry.stage}</Text>
					<Text style={styles.metaText}>{entry.date} | {entry.cause}</Text>
				</Panel>
			))}
		</ScrollView>
	);

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<SectionTabs tabs={ARCHIVE_TABS} active={tab} onChange={setTab} />
			{tab === 'pact' ? renderPact() : null}
			{tab === 'logs' ? renderLogs() : null}
			{tab === 'achievements' ? renderAchievements() : null}
			{tab === 'statistics' ? renderStatistics() : null}
			{tab === 'graveyard' ? renderGraveyard() : null}
		</View>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.background },
		content: { padding: 14, paddingBottom: 36 },
		statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
		sectionTitle: { color: colors.headerText, fontSize: 18, fontWeight: '900', marginBottom: 8 },
		cardTitle: { color: colors.titleText, fontSize: 16, fontWeight: '900' },
		bodyText: { color: colors.text, fontSize: 13, lineHeight: 20 },
		metaText: { color: colors.secondaryText, fontSize: 12, marginTop: 8 },
		actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
		planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
		priceText: { color: colors.success, fontSize: 16, fontWeight: '900' },
		bullet: { color: colors.text, fontSize: 13, marginTop: 7, lineHeight: 18 },
		tableOuter: { minWidth: 760 },
		tableInner: { padding: 14, paddingBottom: 36 },
		tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.secondaryBackground },
		tableHeader: { backgroundColor: colors.buttonBackground },
		tableCell: { width: 110, color: colors.text, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 11 },
		tableHeaderText: { color: colors.buttonText, fontWeight: '900' },
		tableEmpty: { width: 720, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 16 },
		achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
		achievementCard: { width: '23%', minWidth: 82, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 8, alignItems: 'center' },
		achievementUnlocked: { borderColor: colors.success, backgroundColor: colors.tertiaryBackground },
		achievementIcon: { color: colors.headerText, fontSize: 15, fontWeight: '900', minHeight: 20 },
		achievementTitle: { color: colors.text, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 6, minHeight: 34 },
		achievementProgress: { color: colors.secondaryText, fontSize: 10, fontWeight: '800', marginTop: 4 },
		listHeader: { color: colors.titleText, fontSize: 17, fontWeight: '900', marginVertical: 10 },
	});
