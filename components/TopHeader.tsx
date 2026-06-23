import { formatAbbreviatedNumber } from '@/constants/number-abbreviation';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonFocus } from '@/context/DragonFocusProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useFury } from '@/context/FuryProvider';
import { useStreak } from '@/context/StreakProvider';
import { useTheme } from '@/context/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface TopHeaderProps {
	isHomePage?: boolean;
}

const MENU_ITEMS = [
	{ id: 'checkIn', label: 'Check-In Survey', route: '/surveyMorning' },
	{ id: 'checkOut', label: 'Check-Out Survey', route: '/surveyNight' },
	{ id: 'incompleteGoals', label: 'Incomplete Goals', route: '/pages/hatchery' },
	{ id: 'completedGoals', label: 'Harvest Goals', route: '/pages/hatchery' },
	{ id: 'world', label: 'World', route: '/pages/world' },
	{ id: 'account', label: 'Account', route: '/pages/archives' },
	{ id: 'logs', label: 'Logs', route: '/pages/archives' },
	{ id: 'stats', label: 'Statistics', route: '/pages/archives' },
	{ id: 'achievements', label: 'Achievements', route: '/pages/archives' },
	{ id: 'options', label: 'Options', route: '/pages/options' },
	{ id: 'gamemodes', label: 'Game Modes', route: '/pages/options' },
	{ id: 'tutorial', label: 'Tutorial', route: '/tutorial' },
] as const;

export default function TopHeader(_props: TopHeaderProps) {
	const router = useRouter();
	const focus = useDragonFocus();
	const fury = useFury();
	const coins = useDragonCoins();
	const orbs = useDragonOrbs();
	const streak = useStreak();
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);

	const [menuOpen, setMenuOpen] = useState(false);
	const [activeStat, setActiveStat] = useState<string | null>(null);

	useEffect(() => {
		if (!activeStat) return;
		const timer = setTimeout(() => setActiveStat(null), 2600);
		return () => clearTimeout(timer);
	}, [activeStat]);

	useEffect(() => {
		const [nextMilestone] = focus.getNewMilestones(coins.coins);
		if (!nextMilestone) return;
		focus.markMilestoneSeen(nextMilestone.id);
		Alert.alert(
			'Milestone Discovered',
			`${nextMilestone.name}\n\n${nextMilestone.description}\n\nUnlocks: ${nextMilestone.unlocks.join(', ')}`,
		);
	}, [coins.coins, focus]);

	const statItems = [
		{ key: 'fury', label: 'Fury', value: `${formatAbbreviatedNumber(fury.furyMeter)} / ${formatAbbreviatedNumber(fury.maxFury)}`, icon: 'whatshot' as const },
		{ key: 'energy', label: 'Energy', value: formatAbbreviatedNumber(coins.coins), icon: 'bolt' as const },
		{ key: 'darkEnergy', label: 'Dark Energy', value: formatAbbreviatedNumber(orbs.orbs, 1000), icon: 'dark-mode' as const },
		{ key: 'streak', label: 'Crimson Streak', value: formatAbbreviatedNumber(streak.streak), icon: 'local-fire-department' as const },
	];

	return (
		<View style={styles.shell}>
			<View style={styles.row}>
				<Pressable style={styles.menuButton} onPress={() => setMenuOpen(current => !current)}>
					<MaterialIcons name="menu" size={20} color={theme.colors.buttonText} />
					<Text style={styles.menuText}>Menu</Text>
				</Pressable>

				<View style={styles.stats}>
					{statItems.map(item => (
						<Pressable key={item.key} style={styles.stat} onPress={() => setActiveStat(activeStat === item.label ? null : item.label)}>
							<MaterialIcons name={item.icon} size={16} color={theme.colors.headerText} />
							<Text numberOfLines={1} style={styles.statValue}>{item.value}</Text>
						</Pressable>
					))}
				</View>
			</View>

			{activeStat ? (
				<View style={styles.tooltip}>
					<Text style={styles.tooltipText}>{activeStat}</Text>
				</View>
			) : null}

			{menuOpen ? (
				<View style={styles.menu}>
					{MENU_ITEMS.filter(item => focus.menuShortcuts[item.id]).map(item => (
						<Pressable
							key={item.id}
							style={styles.menuItem}
							onPress={() => {
								setMenuOpen(false);
								router.push(item.route as never);
							}}>
							<Text style={styles.menuItemText}>{item.label}</Text>
						</Pressable>
					))}
				</View>
			) : null}
		</View>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		shell: {
			backgroundColor: colors.secondaryBackground,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
			zIndex: 50,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			paddingHorizontal: 10,
			paddingVertical: 8,
		},
		menuButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 5,
			backgroundColor: colors.buttonBackground,
			borderRadius: 8,
			paddingHorizontal: 10,
			paddingVertical: 8,
		},
		menuText: {
			color: colors.buttonText,
			fontWeight: '900',
			fontSize: 12,
		},
		stats: {
			flex: 1,
			flexDirection: 'row',
			gap: 6,
		},
		stat: {
			flex: 1,
			minWidth: 0,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 3,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.background,
			paddingHorizontal: 5,
			paddingVertical: 8,
		},
		statValue: {
			color: colors.text,
			fontSize: 11,
			fontWeight: '900',
			maxWidth: 70,
		},
		tooltip: {
			position: 'absolute',
			right: 10,
			top: 44,
			borderRadius: 8,
			backgroundColor: colors.titleText,
			paddingHorizontal: 10,
			paddingVertical: 6,
			zIndex: 70,
		},
		tooltipText: {
			color: colors.buttonText,
			fontSize: 12,
			fontWeight: '800',
		},
		menu: {
			position: 'absolute',
			left: 10,
			top: 48,
			width: 230,
			maxWidth: '92%',
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.secondaryBackground,
			padding: 8,
			zIndex: 80,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.18,
			shadowRadius: 8,
		},
		menuItem: {
			borderRadius: 6,
			paddingHorizontal: 10,
			paddingVertical: 10,
		},
		menuItemText: {
			color: colors.text,
			fontSize: 13,
			fontWeight: '800',
		},
	});
