import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';

interface TopHeaderProps {
	isHomePage?: boolean;
}

const formatFireXp = (value: number) => {
	if (value < 1_000) return Math.floor(value).toString();
	if (value < 1_000_000_000_000) return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
	return value.toExponential(1).replace('+', '');
};

export default function TopHeader({ isHomePage = true }: TopHeaderProps) {
	const router = useRouter();
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const streak = useStreak();
	const coins = useDragonCoins();
	const shards = useShards();
	const souls = useDragonSouls();
	const fury = useFury();

	const [activeStat, setActiveStat] = useState<string | null>(null);

	useEffect(() => {
		if (!activeStat) return;
		const timer = setTimeout(() => setActiveStat(null), 4000);
		return () => clearTimeout(timer);
	}, [activeStat]);

	const healthPercent = dragon.maxHP > 0 ? (dragon.hp / dragon.maxHP) * 100 : 0;
	const healthColor = healthPercent < 33 ? '#e74c3c' : healthPercent < 67 ? '#f39c12' : '#27ae60';

	const currentLevel = scarLevel.getCurrentLevelInfo();
	const isMaxScarLevel = scarLevel.getNextLevelInfo() === null;
	const xpGoal = Math.max(1, currentLevel.levelUpRequiredXP || 1);
	const xpPercent = isMaxScarLevel ? 100 : Math.min(100, (scarLevel.currentXP / xpGoal) * 100);

	const furyPercent = Math.max(0, Math.min(100, fury.furyMeter));
	let furyColor = '#dcdcdc';
	if (furyPercent < 33) furyColor = '#e0e0e0';
	else if (furyPercent < 67) furyColor = '#9e9e9e';
	else furyColor = '#111';

	const dangerOutline = healthPercent < 33 || furyPercent > 67;

	const Tooltip = ({ text }: { text: string }) => (
		<View style={styles.tooltipBox}>
			<Text style={styles.tooltipText}>{text}</Text>
		</View>
	);

	return (
		<Pressable onPress={() => setActiveStat(null)}>
			<View style={styles.container}>
				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => router.push('/pages/premium')}>
						<MaterialIcons name="auto-awesome" size={18} color="#7C3AED" />
						<Text style={styles.statText}>Pact</Text>
					</Pressable>
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => router.push('/pages/settings')}>
						<MaterialIcons name="settings" size={18} color="#374151" />
						<Text style={styles.statText}>Settings</Text>
					</Pressable>
				</View>

				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Scar Level')}>
						<ProgressBar progress={xpPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: '#3cc8e7' }} />
						<Text style={styles.progressText}>
							Scar {scarLevel.currentScarLevel} ({currentLevel.name}) {isMaxScarLevel ? '| Maxed' : `| ${formatFireXp(scarLevel.currentXP)} / ${formatFireXp(xpGoal)} Fire XP`}
						</Text>
					</Pressable>
					{activeStat === 'Scar Level' && <Tooltip text="Fire XP and Scar Level" />}
				</View>

				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Health Bar')}>
						<ProgressBar progress={healthPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: healthColor }} />
						<Text style={styles.progressText}>
							{dragon.hp} / {dragon.maxHP} HP
						</Text>
					</Pressable>
					{activeStat === 'Health Bar' && <Tooltip text="Dragon Health" />}
				</View>

				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Fury Meter')}>
						<ProgressBar progress={furyPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: furyColor }} />
						<Text style={[styles.progressText, furyPercent > 67 && styles.textLight]}>Fury {Math.round(furyPercent)} / 100</Text>
					</Pressable>
					{activeStat === 'Fury Meter' && <Tooltip text="Dragon Fury" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Coins')}>
						<Text style={styles.coinIcon}>$</Text>
						<Text style={styles.statText}>{Number(coins.coins).toFixed(0)}</Text>
					</Pressable>
					{activeStat === 'Coins' && <Tooltip text="Dragon Coins" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Shards')}>
						<MaterialIcons name="diamond" size={18} color="#3498db" />
						<Text style={styles.statText}>{shards.getShards()}</Text>
					</Pressable>
					{activeStat === 'Shards' && <Tooltip text="Dragon Shards" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Souls')}>
						<MaterialIcons name="blur-on" size={18} color="rgb(153, 102, 204)" />
						<Text style={styles.statText}>{souls.getSouls()}</Text>
					</Pressable>
					{activeStat === 'Souls' && <Tooltip text="Dragon Souls" />}
				</View>

				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Streak')}>
						<MaterialIcons name="local-fire-department" size={18} color="#f39c12" />
						<Text style={styles.statText}>{streak.streak}</Text>
					</Pressable>
					{activeStat === 'Streak' && <Tooltip text="Current Streak" />}
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'nowrap',
		gap: 10,
		overflow: 'visible',
	},
	statWrapper: { flexShrink: 1, minWidth: 120, maxWidth: 185 },
	statWrapperSmall: { flexShrink: 1, minWidth: 60 },
	progressOuter: { height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: '#ecf0f1' },
	progressText: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2, color: '#333' },
	textLight: { color: '#fff' },
	stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	statText: { fontSize: 12, fontWeight: '700', color: '#333' },
	coinIcon: { fontSize: 16, fontWeight: '800' },
	tooltipBox: {
		position: 'absolute',
		marginTop: 4,
		backgroundColor: '#333',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		alignSelf: 'center',
		zIndex: 10,
		maxWidth: 140,
	},
	tooltipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
	dangerBarOutline: { borderWidth: 1, borderColor: '#e53935', shadowColor: '#e53935', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
});
