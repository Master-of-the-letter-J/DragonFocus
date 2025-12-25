import ProgressBar from '@/components/ProgressBar';
import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { images } from '@/constants';
import { useDragonClicking } from '@/context/DragonClickingProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useItems } from '@/context/ItemsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function HomePage() {
	const scar = useScarLevel();
	const shards = useShards();
	const coins = useDragonCoins();
	const streak = useStreak();
	const fury = useFury();
	const dragon = useDragon();
	const items = useItems();
	const dragonClicking = useDragonClicking();
	const router = useRouter();
	const survey = useSurvey();

	// saved progress shortcuts
	const savedMorning = survey.loadProgress('morning');
	const morningPercent = savedMorning?.progressPercent ?? survey.getMorningProgress();
	const savedNight = survey.loadProgress('night');
	const nightPercent = savedNight?.progressPercent ?? survey.getNightProgress();

	useEffect(() => {
		// process generator daily payouts and show popup if any
		if (typeof items.processDailyPayouts === 'function') {
			const added = items.processDailyPayouts();
			if (added && added > 0) {
				Alert.alert('Daily Payout', `Your generators produced ${added} coins while you were away.`);
			}
		}
	}, []);

	// Calculate remaining time for active snack effects
	const activeSnackTimers = useMemo(() => {
		if (!items.activeEffects) return [];
		const now = new Date();
		return items.activeEffects
			.filter(effect => effect.expiresAt && effect.type === 'regen')
			.map(effect => {
				const expiresAt = new Date(effect.expiresAt!);
				const msRemaining = expiresAt.getTime() - now.getTime();
				const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
				return {
					...effect,
					daysRemaining: Math.max(0, daysRemaining),
				};
			})
			.filter(t => t.daysRemaining > 0);
	}, [items.activeEffects]);

	const handleMorningSurvey = () => {
		const saved = survey.loadProgress('morning');
		if (saved) {
			router.push('/surveyMorning' as any);
			return;
		}
		if (!survey.canTakeMorningSurvey()) {
			Alert.alert('Already Completed', 'You have already completed the morning survey today.');
			return;
		}
		router.push('/surveyMorning' as any);
	};

	const handleNightSurvey = () => {
		const saved = survey.loadProgress('night');
		if (saved) {
			router.push('/surveyNight' as any);
			return;
		}
		if (!survey.canTakeNightSurvey()) {
			Alert.alert('Already Completed', 'You have already completed the night survey today.');
			return;
		}
		router.push('/surveyNight' as any);
	};

	const handleDragonDeath = () => {
		Alert.alert('😔 Your Dragon Has Passed', `${dragon.dragonName} lived for ${dragon.age} days.\n\nClick OK to pay respects and continue.`, [{ text: 'OK', onPress: () => dragon.revive() }]);
	};

	const handleRevive = () => {
		Alert.alert('✨ Revive Your Dragon?', `Welcome a new generation: Dragon Jr. ${dragon.dragonJrCount + 1}!`, [
			{ text: 'Revive', onPress: () => dragon.revive() },
			{ text: 'Not yet', onPress: () => {} },
		]);
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={true} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.topBar}>
					<View style={styles.leftTop}></View>
					<View style={styles.rightTop}>
						{activeSnackTimers.length > 0 && (
							<View style={styles.timerSection}>
								<Text selectable={false} style={[styles.small, { fontWeight: '600', marginTop: 8, color: '#4CAF50' }]}>
									🟢 Active Effects:
								</Text>
								{activeSnackTimers.map(timer => (
									<Text key={timer.id} selectable={false} style={[styles.small, { color: '#2196F3', marginTop: 2 }]}>
										⏱️ {timer.daysRemaining}d remaining
									</Text>
								))}
							</View>
						)}
					</View>
				</View>

				<View style={styles.dragonArea}>
					<Text selectable={false} style={styles.dragonName}>
						{dragon.dragonName}
					</Text>
					{dragon.dragonState === 'alive' && (
						<>
							<Text selectable={false} style={styles.dragonStats}>
								HP: {dragon.hp}/{dragon.maxHP} • Age: {dragon.age} • {dragon.currentStage.name}
							</Text>
							<Pressable
								onPress={() => {
									// Register click and award coins based on owned click upgrades
									dragonClicking.addClick();
									const qty = items.ownedItems['click_dragon_clicks'] || 1;
									const perClick = 0.01 * Math.max(1, qty);
									coins.addCoins(perClick);
								}}>
								<Image source={images.dragon} style={styles.dragonImage} />
							</Pressable>
						</>
					)}
					{dragon.dragonState === 'dead' && (
						<>
							<Text selectable={false} style={[styles.dragonStats, { color: '#999' }]}>
								Lived {dragon.age} days • {dragon.currentStage.name}
							</Text>
							<Pressable onPress={handleDragonDeath}>
								<Image source={images.dragon} style={[styles.dragonImage, { opacity: 0.5 }]} />
							</Pressable>
							<Text selectable={false} style={{ fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center' }}>
								Tap to pay respects
							</Text>
						</>
					)}
					{dragon.dragonState === 'awaiting revival' && (
						<>
							<Text selectable={false} style={[styles.dragonStats, { color: '#888' }]}>
								Generation {dragon.dragonJrCount + 1} awaits...
							</Text>
							<Image source={images.dragon} style={[styles.dragonImage, { opacity: 0.4 }]} />
							<Pressable style={styles.reviveButton} onPress={handleRevive}>
								<Text selectable={false} style={styles.reviveButtonText}>
									✨ Revive Dragon Jr. {dragon.dragonJrCount + 1}
								</Text>
							</Pressable>
						</>
					)}
					<Text selectable={false} style={styles.surveyLabel}>
						Daily Surveys
					</Text>
					<Pressable style={[styles.largeButton, savedMorning || survey.canTakeMorningSurvey() ? styles.buttonActive : styles.buttonCompleted]} onPress={handleMorningSurvey} disabled={!savedMorning && !survey.canTakeMorningSurvey()}>
						<Text selectable={false} style={styles.largeButtonTitle}>
							🌅 Morning Survey
						</Text>
						<ProgressBar progress={morningPercent} outerStyle={styles.progressBarSmall} innerStyle={styles.progressFillSmall} />
						<Text selectable={false} style={styles.largeButtonStatus}>
							{savedMorning ? 'Continue' : survey.canTakeMorningSurvey() ? 'Ready' : 'Completed'}
						</Text>
					</Pressable>

					<Pressable style={[styles.largeButton, savedNight || survey.canTakeNightSurvey() ? styles.buttonActive : styles.buttonCompleted]} onPress={handleNightSurvey} disabled={!savedNight && !survey.canTakeNightSurvey()}>
						<Text selectable={false} style={styles.largeButtonTitle}>
							🌙 Night Survey
						</Text>
						<ProgressBar progress={nightPercent} outerStyle={styles.progressBarSmall} innerStyle={styles.progressFillSmall} />
						<Text selectable={false} style={styles.largeButtonStatus}>
							{savedNight ? 'Continue' : survey.canTakeNightSurvey() ? 'Ready' : 'Completed'}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12 },
	scrollContent: { paddingBottom: 40 },
	topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
	leftTop: {},
	rightTop: { alignItems: 'flex-end' },
	small: { fontSize: 12 },
	furyBar: { flexDirection: 'row', width: 120, height: 8, backgroundColor: '#eee', borderRadius: 6, marginTop: 6, overflow: 'hidden' },
	furyFill: { height: '100%', backgroundColor: '#ff7043' },
	timerSection: { marginTop: 8 },
	dragonArea: { alignItems: 'center', marginTop: 24 },
	dragonName: { fontSize: 22, fontWeight: '700', userSelect: 'none' },
	dragonStats: { fontSize: 14, color: '#555', marginTop: 6, userSelect: 'none' },
	dragonImage: { width: 200, height: 200, marginTop: 12, resizeMode: 'contain' },
	reviveButton: { paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#FFB74D', borderRadius: 8, marginTop: 16 },
	reviveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', userSelect: 'none' },
	surveyButtonsSection: { marginTop: 32, paddingHorizontal: 8 },
	surveyLabel: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center', userSelect: 'none' },
	largeButton: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2 },
	buttonActive: { borderColor: '#4CAF50', backgroundColor: '#f1f8f4' },
	buttonCompleted: { borderColor: '#ccc', backgroundColor: '#f5f5f5', opacity: 0.6 },
	largeButtonTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, userSelect: 'none' },
	progressBarSmall: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
	progressFillSmall: { height: '100%', backgroundColor: '#4CAF50' },
	largeButtonStatus: { fontSize: 14, color: '#666', userSelect: 'none' },
});
