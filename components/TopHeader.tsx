import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';

interface TopHeaderProps {
	isHomePage?: boolean;
}

export default function TopHeader({ isHomePage = true }: TopHeaderProps) {
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const streak = useStreak();
	const coins = useDragonCoins();
	const shards = useShards();
	const fury = useFury();

	const [activeStat, setActiveStat] = useState<string | null>(null);

	useEffect(() => {
		if (!activeStat) return;
		const timer = setTimeout(() => setActiveStat(null), 10000);
		return () => clearTimeout(timer);
	}, [activeStat]);

	// HEALTH
	const healthPercent = (dragon.hp / dragon.maxHP) * 100;
	const healthColor = healthPercent < 33 ? '#e74c3c' : healthPercent < 67 ? '#f39c12' : '#27ae60';

	// XP
	const currentLevel = scarLevel.getCurrentLevelInfo();
	const nextLevel = scarLevel.getNextLevelInfo() ?? currentLevel;
	const xpForNextLevel = Math.max(1, nextLevel.requiredXP - currentLevel.requiredXP);
	const xpInCurrentLevel = scarLevel.currentXP - currentLevel.requiredXP;
	const xpPercent = Math.min(1, xpInCurrentLevel / xpForNextLevel) * 100;

	// FURY
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
				{/* XP / SCAR LEVEL */}
				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Scar Level')}>
						<ProgressBar progress={xpPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: '#3cc8e7' }} />
						<Text style={styles.progressText}>
							Scar {scarLevel.currentScarLevel} ({currentLevel.name}) — {Math.floor(xpInCurrentLevel)} / {xpForNextLevel} XP
						</Text>
					</Pressable>
					{activeStat === 'Scar Level' && <Tooltip text="Scar Level" />}
				</View>

				{/* HP */}
				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Health Bar')}>
						<ProgressBar progress={healthPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: healthColor }} />
						<Text style={styles.progressText}>
							{dragon.hp} / {dragon.maxHP} HP
						</Text>
					</Pressable>
					{activeStat === 'Health Bar' && <Tooltip text="Health Bar" />}
				</View>

				{/* FURY */}
				<View style={styles.statWrapper}>
					<Pressable onPress={() => setActiveStat('Fury Meter')}>
						<ProgressBar progress={furyPercent} outerStyle={[styles.progressOuter, dangerOutline && styles.dangerBarOutline]} innerStyle={{ backgroundColor: furyColor }} />
						<Text style={[styles.progressText, furyPercent > 67 && styles.textLight]}>
							{Math.round(furyPercent)}% {furyPercent < 50 ? 'Fury (Yin)' : 'Fury (Yang)'}
						</Text>
					</Pressable>
					{activeStat === 'Fury Meter' && <Tooltip text="Fury Meter" />}
				</View>

				{/* COINS */}
				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Coins')}>
						<Text style={styles.coinIcon}>💰</Text>
						<Text style={styles.statText}>{Number(coins.coins).toFixed(2)}</Text>
					</Pressable>
					{activeStat === 'Coins' && <Tooltip text="Coins" />}
				</View>

				{/* SHARDS */}
				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Shards')}>
						<MaterialIcons name="diamond" size={18} color="#3498db" />
						<Text style={styles.statText}>{shards.getShards()}</Text>
					</Pressable>
					{activeStat === 'Shards' && <Tooltip text="Shards" />}
				</View>

				{/* STREAK */}
				<View style={styles.statWrapperSmall}>
					<Pressable style={styles.stat} onPress={() => setActiveStat('Streak')}>
						<MaterialIcons name="local-fire-department" size={18} color="#f39c12" />
						<Text style={styles.statText}>{streak.streak}</Text>
					</Pressable>
					{activeStat === 'Streak' && <Tooltip text="Streak" />}
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap', gap: 10, overflow: 'hidden' },
	statWrapper: { flexShrink: 1, minWidth: 120, maxWidth: 180 },
	statWrapperSmall: { flexShrink: 1, minWidth: 60 },
	progressOuter: { height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: '#ecf0f1' },
	progressText: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2, color: '#333' },
	textLight: { color: '#fff' },
	stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	statText: { fontSize: 12, fontWeight: '700', color: '#333' },
	coinIcon: { fontSize: 16 },
	tooltipBox: { position: 'absolute', bottom: 'auto', top: 'auto', marginTop: 4, backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'center', zIndex: 10, maxWidth: 120 },
	tooltipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
	dangerBarOutline: { borderWidth: 1, borderColor: '#e53935', shadowColor: '#e53935', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
});
