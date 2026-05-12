import { formatAbbreviatedNumber, formatCoinNumber, formatDecimalNumber } from '@/constants/number-abbreviation';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';

interface TopHeaderProps {
	isHomePage?: boolean;
}

export default function TopHeader({ isHomePage = true }: TopHeaderProps) {
	const router = useRouter();
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const streak = useStreak();
	const coins = useDragonCoins();
	const orbs = useDragonOrbs();
	const shards = useShards();
	const souls = useDragonSouls();
	const embers = useDragonEmbers();
	const fury = useFury();
	const survey = useSurvey();
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);

	const [activeStat, setActiveStat] = useState<string | null>(null);
	const [showSurveyMenu, setShowSurveyMenu] = useState(false);

	useEffect(() => {
		if (!activeStat) return;
		const timer = setTimeout(() => setActiveStat(null), 4000);
		return () => clearTimeout(timer);
	}, [activeStat]);

	const healthPercent = dragon.maxHP > 0 ? (dragon.hp / dragon.maxHP) * 100 : 0;
	const healthColor = healthPercent < 33 ? theme.colors.danger : healthPercent < 67 ? theme.colors.warning : theme.colors.success;

	const currentLevel = scarLevel.getCurrentLevelInfo();
	const isMaxScarLevel = scarLevel.getNextLevelInfo() === null;
	const xpGoal = Math.max(1, currentLevel.levelUpRequiredXP || 1);
	const xpPercent = isMaxScarLevel ? 100 : Math.min(100, (scarLevel.currentXP / xpGoal) * 100);

	const furyPercent = Math.max(0, Math.min(100, (fury.furyMeter / Math.max(1, fury.maxFury)) * 100));
	let furyColor = theme.colors.tertiaryBackground;
	if (furyPercent < 33) furyColor = theme.colors.tertiaryBackground;
	else if (furyPercent < 67) furyColor = theme.colors.fourthBackground;
	else furyColor = theme.colors.titleText;

	const dangerOutline = healthPercent < 33 || furyPercent > 67;
	const today = new Date().toISOString().split('T')[0];
	const pendingMorning = !(survey.morningSurveyCompleted && survey.lastMorningSurveyDate === today);
	const pendingNight = !(survey.nightSurveyCompleted && survey.lastNightSurveyDate === today);
	const hasPendingSurvey = !isHomePage && (pendingMorning || pendingNight);

	const Tooltip = ({ text }: { text: string }) => (
		<View style={styles.tooltipBox}>
			<Text style={styles.tooltipText}>{text}</Text>
		</View>
	);

	return (
		<Pressable onPress={() => {
			setActiveStat(null);
			setShowSurveyMenu(false);
		}}>
			<View style={styles.container}>
				{hasPendingSurvey ? (
					<View style={styles.statWrapperSmall}>
						<Pressable style={styles.stat} onPress={() => setShowSurveyMenu(current => !current)}>
							<MaterialIcons name="menu" size={18} color={theme.colors.titleText} />
							<Text style={[styles.statText, styles.pendingSurveyText]}>Surveys</Text>
						</Pressable>
						{showSurveyMenu ? (
							<View style={styles.surveyMenu}>
								<Text style={styles.surveyMenuTitle}>Pending Surveys</Text>
								{pendingMorning ? (
									<Pressable style={styles.surveyMenuButton} onPress={() => router.push('/surveyMorning')}>
										<Text style={styles.surveyMenuButtonText}>Morning Survey</Text>
									</Pressable>
								) : null}
								{pendingNight ? (
									<Pressable style={styles.surveyMenuButton} onPress={() => router.push('/surveyNight')}>
										<Text style={styles.surveyMenuButtonText}>Night Survey</Text>
									</Pressable>
								) : null}
							</View>
						) : null}
					</View>
				) : null}

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => router.push('/pages/premium')}>
						<MaterialIcons name="auto-awesome" size={18} color={theme.colors.tint} />
						<Text style={styles.statText}>Pact</Text>
					</Pressable>
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => router.push('/pages/settings')}>
						<MaterialIcons name="settings" size={18} color={theme.colors.headerText} />
						<Text style={styles.statText}>Settings</Text>
					</Pressable>
				</View>

				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Scar Level')}>
						<ProgressBar progress={xpPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: theme.colors.info }} />
						<Text style={styles.progressText}>
							Scar {scarLevel.currentScarLevel} ({currentLevel.name}) {isMaxScarLevel ? '| Maxed' : `| ${formatAbbreviatedNumber(scarLevel.currentXP)} / ${formatAbbreviatedNumber(xpGoal)} Fire XP`}
						</Text>
					</Pressable>
					{activeStat === 'Scar Level' && <Tooltip text="Fire XP and Scar Level" />}
				</View>

				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Health Bar')}>
						<ProgressBar progress={healthPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: healthColor }} />
						<Text style={styles.progressText}>
							{formatDecimalNumber(dragon.hp)} / {formatDecimalNumber(dragon.maxHP)} HP
						</Text>
					</Pressable>
					{activeStat === 'Health Bar' && <Tooltip text="Dragon Health" />}
				</View>

				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Fury Meter')}>
						<ProgressBar progress={furyPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: furyColor }} />
						<Text style={styles.progressText}>
							Fury {formatAbbreviatedNumber(fury.furyMeter)} / {formatAbbreviatedNumber(fury.maxFury)}
						</Text>
					</Pressable>
					{activeStat === 'Fury Meter' && <Tooltip text="Dragon Fury" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Coins')}>
						<Text style={styles.coinIcon}>🪙</Text>
						<Text style={styles.statText}>{formatCoinNumber(coins.coins, true)}</Text>
					</Pressable>
					{activeStat === 'Coins' && <Tooltip text="Dragon Coins" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Shards')}>
						<MaterialIcons name="diamond" size={18} color={theme.colors.info} />
						<Text style={styles.statText}>{formatAbbreviatedNumber(shards.getShards())}</Text>
					</Pressable>
					{activeStat === 'Shards' && <Tooltip text="Dragon Shards" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Orbs')}>
						<MaterialIcons name="radio-button-unchecked" size={18} color={theme.colors.success} />
						<Text style={styles.statText}>{formatAbbreviatedNumber(orbs.getOrbs(), 1000)}</Text>
					</Pressable>
					{activeStat === 'Orbs' && <Tooltip text="Dragon Orbs" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Souls')}>
						<MaterialIcons name="blur-on" size={18} color={theme.colors.tint} />
						<Text style={styles.statText}>{formatAbbreviatedNumber(souls.getSouls())}</Text>
					</Pressable>
					{activeStat === 'Souls' && <Tooltip text="Dragon Souls" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Embers')}>
						<MaterialIcons name="whatshot" size={18} color={theme.colors.warning} />
						<Text style={styles.statText}>{formatAbbreviatedNumber(embers.getEmbers())}</Text>
					</Pressable>
					{activeStat === 'Embers' && <Tooltip text="Dragon Embers" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Streak')}>
						<MaterialIcons name="local-fire-department" size={18} color={theme.colors.warning} />
						<Text style={styles.statText}>{streak.streak}</Text>
					</Pressable>
					{activeStat === 'Streak' && <Tooltip text="Current Streak" />}
				</View>
			</View>
		</Pressable>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
	container: {
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: colors.secondaryBackground,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'nowrap',
		gap: 10,
		overflow: 'visible',
	},
	statWrapper: { flexShrink: 1, minWidth: 120, maxWidth: 185 },
	statWrapperSmall: { flexShrink: 1, minWidth: 60 },
	progressOuter: { height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: colors.tertiaryBackground },
	progressText: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2, color: colors.text },
	stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	statText: { fontSize: 12, fontWeight: '700', color: colors.text },
	pendingSurveyText: { color: colors.warning },
	coinIcon: { fontSize: 16, fontWeight: '800' },
	tooltipBox: {
		position: 'absolute',
		marginTop: 4,
		backgroundColor: colors.titleText,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		alignSelf: 'center',
		zIndex: 10,
		maxWidth: 140,
	},
	tooltipText: { color: colors.buttonText, fontSize: 11, fontWeight: '600' },
	dangerBarOutline: { borderWidth: 1, borderColor: colors.danger, shadowColor: colors.danger, shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
	surveyMenu: {
		position: 'absolute',
		top: 26,
		left: 0,
		width: 180,
		backgroundColor: colors.secondaryBackground,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 12,
		zIndex: 20,
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 4 },
	},
	surveyMenuTitle: { fontSize: 12, fontWeight: '800', color: colors.titleText, marginBottom: 8 },
	surveyMenuButton: { backgroundColor: colors.buttonBackground, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 6 },
	surveyMenuButtonText: { color: colors.buttonText, fontSize: 12, fontWeight: '700' },
});
