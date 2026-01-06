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
import { usePopulation } from '@/context/PopulationProvider';
import { usePremium } from '@/context/PremiumProvider';
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
	const premium = usePremium();
	const dragonClicking = useDragonClicking();
	const router = useRouter();
	const survey = useSurvey();
	const population = usePopulation();

	const today = new Date().toISOString().split('T')[0];

	const savedMorning = survey.loadProgress('morning');
	const savedNight = survey.loadProgress('night');

	const morningPercent = survey.morningSurveyCompleted && survey.lastMorningSurveyDate === today ? 100 : savedMorning?.progressPercent ?? 0;
	const nightPercent = survey.nightSurveyCompleted && survey.lastNightSurveyDate === today ? 100 : savedNight?.progressPercent ?? 0;

	useEffect(() => {
		if (typeof items.processDailyPayouts === 'function') {
			const added = items.processDailyPayouts();
			if (added && added > 0) {
				Alert.alert('Daily Payout', `Your generators produced ${added} coins while you were away.`);
			}
		}
	}, []);

	const activeSnackTimers = useMemo(() => {
		if (!items.activeEffects) return [];
		const now = new Date();
		return items.activeEffects
			.filter(effect => effect.expiresAt && effect.type === 'regen')
			.map(effect => {
				const expiresAt = new Date(effect.expiresAt!);
				const msRemaining = expiresAt.getTime() - now.getTime();
				const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
				return { ...effect, daysRemaining: Math.max(0, daysRemaining) };
			})
			.filter(t => t.daysRemaining > 0);
	}, [items.activeEffects]);

	const getSurveyButtonState = (type: 'morning' | 'night') => {
		const isCompleted = type === 'morning' ? survey.morningSurveyCompleted && survey.lastMorningSurveyDate === today : survey.nightSurveyCompleted && survey.lastNightSurveyDate === today;

		const hasSaved = type === 'morning' ? !!savedMorning : !!savedNight;

		if (isCompleted) return 'Retake';
		if (hasSaved) return 'Continue';
		return 'Ready';
	};

	const morningStatus = getSurveyButtonState('morning');
	const nightStatus = getSurveyButtonState('night');

	// Helper to ensure button is clickable if we want to Retake or Continue
	const isMorningClickable = (survey.canTakeMorningSurvey() || morningStatus === 'Retake' || !!savedMorning) && dragon.dragonState === 'alive';
	const isNightClickable = (survey.canTakeNightSurvey() || nightStatus === 'Retake' || !!savedNight) && dragon.dragonState === 'alive';

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={true} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Population Stats Section */}
				<View style={styles.statsHeader}>
					<View style={styles.statBox}>
						<Text style={styles.statLabel}>🌍 World Population</Text>
						<Text style={styles.statValue}>{(population.population / 1_000_000_000).toFixed(2)}B</Text>
					</View>
					<View style={styles.statBox}>
						<Text style={styles.statLabel}>💀 Death Count</Text>
						<Text style={styles.statValue}>{(population.deathCount || 0).toLocaleString()}</Text>
					</View>
				</View>

				{/* Active Effects Section */}
				{activeSnackTimers.length > 0 && (
					<View style={styles.timerContainer}>
						{activeSnackTimers.map(timer => (
							<Text key={timer.id} style={styles.timerText}>
								🟢 {timer.daysRemaining}d Regen Active
							</Text>
						))}
					</View>
				)}

				<View style={styles.dragonArea}>
					<Text style={styles.dragonName}>{dragon.dragonName}</Text>

					{dragon.dragonState === 'alive' && (
						<>
							<Text style={styles.dragonStats}>
								HP: {dragon.hp}/{dragon.maxHP} • Age: {dragon.age} • {dragon.currentStage.name}
							</Text>
							<Pressable
								onPress={() => {
									dragonClicking.addClick();
									const qty = items.ownedItems['click_dragon_clicks'] || 1;
									// Use provider's clicking coins method so multipliers apply
									coins.addClickingCoins(fury.furyMeter, shards.shards ?? 0, scar.currentScarLevel ?? 0, items.getActiveCoinMultiplier ? items.getActiveCoinMultiplier() : 1, premium.isPremium ?? false);
								}}>
								<Image source={images.dragon} style={styles.dragonImage} />
							</Pressable>
						</>
					)}

					{dragon.dragonState === 'dead' && (
						<Pressable onPress={() => Alert.alert('😔 Respects Paid', 'Dragon revived!', [{ text: 'OK', onPress: () => dragon.revive() }])}>
							<Image source={images.dragon} style={[styles.dragonImage, { opacity: 0.5 }]} />
							<Text style={styles.deadText}>Tap to pay respects & revive</Text>
						</Pressable>
					)}

					<View style={styles.surveySection}>
						<Text style={styles.surveyLabel}>📋 Daily Surveys</Text>
						<View style={styles.surveysContainer}>
							{/* Morning Survey */}
							<Pressable style={[styles.largeButton, styles.surveyButton, isMorningClickable ? styles.buttonActive : styles.buttonDisabled]} onPress={() => router.push('/surveyMorning' as any)} disabled={!isMorningClickable}>
								<View style={styles.buttonTop}>
									<Text style={styles.largeButtonTitle}>🌅 Morning Survey</Text>
									<Text style={styles.statusBadge}>{morningStatus}</Text>
								</View>
								<ProgressBar progress={morningPercent} outerStyle={styles.progressBarSmall} innerStyle={styles.progressFillSmall} />
							</Pressable>

							{/* Night Survey */}
							<Pressable style={[styles.largeButton, styles.surveyButton, isNightClickable ? styles.buttonActive : styles.buttonDisabled]} onPress={() => router.push('/surveyNight' as any)} disabled={!isNightClickable}>
								<View style={styles.buttonTop}>
									<Text style={styles.largeButtonTitle}>🌙 Night Survey</Text>
									<Text style={styles.statusBadge}>{nightStatus}</Text>
								</View>
								<ProgressBar progress={nightPercent} outerStyle={styles.progressBarSmall} innerStyle={styles.progressFillSmall} />
							</Pressable>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	scrollContent: { paddingBottom: 40, paddingHorizontal: 16 },
	statsHeader: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 12 },
	statBox: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
	statLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 4 },
	statValue: { fontSize: 20, fontWeight: '800', color: '#333' },
	timerContainer: { marginTop: 10, alignItems: 'flex-end' },
	timerText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
	dragonArea: { alignItems: 'center', marginTop: 20 },
	dragonName: { fontSize: 24, fontWeight: '800' },
	dragonStats: { fontSize: 14, color: '#666', marginTop: 4 },
	dragonImage: { width: 220, height: 220, resizeMode: 'contain', marginVertical: 20 },
	deadText: { color: '#999', fontSize: 14, fontStyle: 'italic' },
	surveySection: { width: '100%', marginTop: 20 },
	surveyLabel: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
	surveysContainer: { flexDirection: 'row', gap: 12 },
	surveyButton: { flex: 1, marginBottom: 0 },
	largeButton: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5 },
	buttonActive: { borderColor: '#4CAF50', backgroundColor: '#F0F9F1' },
	buttonDisabled: { borderColor: '#E0E0E0', backgroundColor: '#FAFAFA', opacity: 0.6 },
	buttonTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
	largeButtonTitle: { fontSize: 17, fontWeight: '700' },
	statusBadge: { fontSize: 12, fontWeight: '600', color: '#4CAF50', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
	progressBarSmall: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
	progressFillSmall: { height: '100%', backgroundColor: '#4CAF50' },
});
