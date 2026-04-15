import ProgressBar from '@/components/ProgressBar';
import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { images } from '@/constants';
import { useDragonClicking } from '@/context/DragonClickingProvider';
import { useDragon } from '@/context/DragonProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useToast } from '@/context/ToastProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

const formatDuration = (seconds: number) => {
	if (seconds <= 0) return '0s';
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${mins}m`;
	if (mins > 0) return `${mins}m ${secs}s`;
	return `${secs}s`;
};

export default function HomePage() {
	const dragon = useDragon();
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const dragonClicking = useDragonClicking();
	const router = useRouter();
	const survey = useSurvey();
	const population = usePopulation();
	const { showToast } = useToast();

	const [snackModalOpen, setSnackModalOpen] = useState(false);
	const [idleModalOpen, setIdleModalOpen] = useState(false);
	const [eventModal, setEventModal] = useState<{ title: string; message: string } | null>(null);

	const today = new Date().toISOString().split('T')[0];
	const savedMorning = survey.loadProgress('morning');
	const savedNight = survey.loadProgress('night');

	const morningPercent = survey.morningSurveyCompleted && survey.lastMorningSurveyDate === today ? 100 : (savedMorning?.progressPercent ?? 0);
	const nightPercent = survey.nightSurveyCompleted && survey.lastNightSurveyDate === today ? 100 : (savedNight?.progressPercent ?? 0);

	const ownedSnacks = useMemo(() => itemSnacks.snackItems.filter(item => (itemSnacks.ownedItems[item.id] || 0) > 0), [itemSnacks.ownedItems, itemSnacks.snackItems]);
	const totalSnackCount = ownedSnacks.reduce((sum, snack) => sum + (itemSnacks.ownedItems[snack.id] || 0), 0);
	const effectList = itemSnacks.getEffectDisplayList();

	useEffect(() => {
		if (!itemSnacks.snackToast) return;
		showToast(
			{
				title: itemSnacks.snackToast.name,
				message: itemSnacks.snackToast.topEffect,
				shadowColor: '#0EA5E9',
				textColor: '#111827',
				shadowAmount: 16,
				backgroundColor: '#F0F9FF',
			},
			{ durationMs: 1600 },
		);
		itemSnacks.consumeSnackToast();
	}, [itemSnacks, showToast]);

	useEffect(() => {
		if (itemEconomy.pendingIdleSummary) setIdleModalOpen(true);
	}, [itemEconomy.pendingIdleSummary]);

	useEffect(() => {
		if (!dragon.lastLifecycleEvent) return;

		if (dragon.lastLifecycleEvent.type === 'spawned') {
			setEventModal({
				title: 'Dragon Spawned',
				message: 'A new dragon has entered the lair. The full spawn video is still a placeholder, so enjoy this temporary hype popup.',
			});
		}

		if (dragon.lastLifecycleEvent.type === 'died') {
			itemSnacks.addCustomEffect?.({
				sourceItemId: 'status_mourning_1',
				name: 'Mourning I',
				furyPerDay: 20,
				generatorMultiplier: 0.5,
				days: 3,
				effectTag: 'mourning',
			});
			setEventModal({
				title: 'Dragon Death',
				message: 'Your dragon has fallen. The death video is still a placeholder, and Mourning I has been applied for 3 days.',
			});
		}

		if (dragon.lastLifecycleEvent.type === 'revived') {
			setEventModal({
				title: 'Dragon Revived',
				message: 'A new generation rises from the grave. The revive art is still placeholder for now, but the graveyard log is ready.',
			});
		}

		dragon.clearLifecycleEvent();
	}, [dragon, itemSnacks]);

	const getSurveyButtonState = (type: 'morning' | 'night') => {
		const isCompleted = type === 'morning' ? survey.morningSurveyCompleted && survey.lastMorningSurveyDate === today : survey.nightSurveyCompleted && survey.lastNightSurveyDate === today;
		const hasSaved = type === 'morning' ? !!savedMorning : !!savedNight;
		if (isCompleted) return 'Retake';
		if (hasSaved) return 'Continue';
		return 'Ready';
	};

	const morningStatus = getSurveyButtonState('morning');
	const nightStatus = getSurveyButtonState('night');
	const canUseSurveys = dragon.dragonState === 'alive';
	const stageImage = dragon.dragonState === 'dead' ? images.grave : images.stages[dragon.currentStage.name];

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={true} />

			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.statsHeader}>
					<Pressable style={styles.statBox} onPress={() => showToast({ title: 'World Population', message: `${(population.population / 1_000_000_000).toFixed(2)}B dragonside estimate`, shadowColor: '#16A34A', backgroundColor: '#ECFDF5' })}>
						<Text style={styles.statLabel}>World Population</Text>
						<Text style={styles.statValue}>{(population.population / 1_000_000_000).toFixed(2)}B</Text>
					</Pressable>
					<Pressable style={styles.statBox} onPress={() => showToast({ title: 'Death Count', message: `${(population.deathCount || 0).toLocaleString()} recorded losses`, shadowColor: '#DC2626', backgroundColor: '#FEF2F2' })}>
						<Text style={styles.statLabel}>Death Count</Text>
						<Text style={styles.statValue}>{(population.deathCount || 0).toLocaleString()}</Text>
					</Pressable>
				</View>

				<View style={styles.utilityRow}>
					<View style={styles.effectsWrap}>
						{effectList.slice(0, 6).map(effect => (
							<View key={effect.id} style={styles.effectCard}>
								<Text style={styles.effectTitle}>{effect.name}</Text>
								<Text style={styles.effectText}>{effect.topEffect}</Text>
								<Text style={styles.effectTime}>{effect.startsInSeconds > 0 ? `Starts in ${formatDuration(effect.startsInSeconds)}` : `Ends in ${formatDuration(effect.remainingSeconds)}`}</Text>
							</View>
						))}
						{effectList.length === 0 && (
							<View style={styles.effectCardMuted}>
								<Text style={styles.effectTitleMuted}>No active effects</Text>
								<Text style={styles.effectTextMuted}>Snacks, mourning, and ascension sickness will show up here.</Text>
							</View>
						)}
					</View>
					<Pressable style={styles.snackButton} onPress={() => setSnackModalOpen(true)}>
						<Text style={styles.snackButtonText}>Backpack ({totalSnackCount})</Text>
					</Pressable>
				</View>

				<View style={styles.dragonArea}>
					<Text style={styles.dragonName}>{dragon.dragonName}</Text>
					<Text style={styles.dragonStats}>
						Stage: {dragon.currentStage.name} • Age: {dragon.age} days • HP {dragon.hp}/{dragon.maxHP}
					</Text>

					<View style={styles.dragonArtShell}>
						<Image source={stageImage} style={[styles.dragonImage, dragon.dragonState === 'dead' && styles.deadDragonImage, dragon.dragonState === 'unspawned' && styles.eggImage]} />
					</View>

					{dragon.dragonState === 'alive' && (
						<Pressable
							style={styles.tapDragonButton}
							hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
							onPress={() => {
								dragonClicking.addClick();
								const reward = itemEconomy.processDragonClick();
								if (reward > 0) {
									showToast({ title: 'Dragon Click', message: `+${reward.toFixed(2)} coins`, shadowColor: '#F59E0B', backgroundColor: '#FFFBEB' }, { durationMs: 900 });
								}
							}}>
							<Text style={styles.tapDragonText}>Tap Dragon</Text>
						</Pressable>
					)}

					{dragon.dragonState === 'unspawned' && (
						<Pressable style={styles.lifecycleButton} onPress={() => dragon.spawnDragon()}>
							<Text style={styles.lifecycleButtonText}>Spawn Dragon</Text>
						</Pressable>
					)}

					{dragon.dragonState === 'dead' && (
						<Pressable style={[styles.lifecycleButton, styles.reviveButton]} onPress={() => dragon.revive()}>
							<Text style={styles.lifecycleButtonText}>Revive Dragon</Text>
						</Pressable>
					)}

					<View style={styles.surveySection}>
						<Text style={styles.surveyLabel}>Daily Surveys</Text>
						<View style={styles.surveysContainer}>
							<Pressable style={[styles.largeButton, canUseSurveys ? styles.buttonActive : styles.buttonDisabled]} onPress={() => router.push('/surveyMorning')} disabled={!canUseSurveys}>
								<View style={styles.buttonTop}>
									<Text style={styles.largeButtonTitle}>Morning Survey</Text>
									<Text style={styles.statusBadge}>{morningStatus}</Text>
								</View>
								<ProgressBar progress={morningPercent} outerStyle={styles.progressBarSmall} innerStyle={styles.progressFillSmall} />
							</Pressable>

							<Pressable style={[styles.largeButton, canUseSurveys ? styles.buttonActive : styles.buttonDisabled]} onPress={() => router.push('/surveyNight')} disabled={!canUseSurveys}>
								<View style={styles.buttonTop}>
									<Text style={styles.largeButtonTitle}>Night Survey</Text>
									<Text style={styles.statusBadge}>{nightStatus}</Text>
								</View>
								<ProgressBar progress={nightPercent} outerStyle={styles.progressBarSmall} innerStyle={styles.progressFillSmall} />
							</Pressable>
						</View>
						{!canUseSurveys && <Text style={styles.surveyHint}>Spawn or revive your dragon to continue surveys.</Text>}
					</View>
				</View>
			</ScrollView>

			<Modal visible={snackModalOpen} transparent animationType="fade" onRequestClose={() => setSnackModalOpen(false)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Dragon Backpack</Text>
						<ScrollView style={{ maxHeight: 340 }}>
							{ownedSnacks.length === 0 && <Text style={styles.modalText}>No snacks owned yet.</Text>}
							{ownedSnacks.map(snack => (
								<View key={snack.id} style={styles.snackRow}>
									<View style={{ flex: 1 }}>
										<Text style={styles.snackName}>{snack.name}</Text>
										<Text style={styles.modalText}>{snack.description}</Text>
										<Text style={styles.modalText}>Owned: {itemSnacks.ownedItems[snack.id] || 0}</Text>
									</View>
									<Pressable style={styles.useSnackBtn} onPress={() => itemSnacks.useSnack(snack.id)}>
										<Text style={styles.useSnackBtnText}>Use</Text>
									</Pressable>
								</View>
							))}
						</ScrollView>
						<Pressable style={styles.closeModalBtn} onPress={() => setSnackModalOpen(false)}>
							<Text style={styles.closeModalBtnText}>Close</Text>
						</Pressable>
					</View>
				</View>
			</Modal>

			<Modal visible={idleModalOpen && !!itemEconomy.pendingIdleSummary} transparent animationType="fade" onRequestClose={() => {
				setIdleModalOpen(false);
				itemEconomy.consumeIdleSummary();
			}}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Idle Rewards</Text>
						{itemEconomy.pendingIdleSummary && (
							<View>
								<Text style={styles.modalText}>Away for: {formatDuration(itemEconomy.pendingIdleSummary.elapsedSeconds)}</Text>
								<Text style={styles.modalText}>Coins earned: +{itemEconomy.pendingIdleSummary.coins.toFixed(2)}</Text>
								<Text style={styles.modalText}>Fire XP earned: +{itemEconomy.pendingIdleSummary.fireXp.toFixed(2)}</Text>
								<Text style={styles.modalText}>Shards earned: +{itemEconomy.pendingIdleSummary.shards}</Text>
								<Text style={styles.modalText}>Fury earned: +{itemEconomy.pendingIdleSummary.furyEarned.toFixed(2)}</Text>
								<Text style={styles.modalText}>Fury lost: -{itemEconomy.pendingIdleSummary.furyLost.toFixed(2)}</Text>
								<Text style={styles.modalText}>Health earned: +{itemEconomy.pendingIdleSummary.healthEarned.toFixed(2)}</Text>
								<Text style={styles.modalText}>Health lost: -{itemEconomy.pendingIdleSummary.healthLost.toFixed(2)}</Text>
							</View>
						)}
						<Pressable style={styles.closeModalBtn} onPress={() => {
							setIdleModalOpen(false);
							itemEconomy.consumeIdleSummary();
						}}>
							<Text style={styles.closeModalBtnText}>Collect</Text>
						</Pressable>
					</View>
				</View>
			</Modal>

			<Modal visible={!!eventModal} transparent animationType="fade" onRequestClose={() => setEventModal(null)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>{eventModal?.title}</Text>
						<Text style={styles.modalText}>{eventModal?.message}</Text>
						<Pressable style={styles.closeModalBtn} onPress={() => setEventModal(null)}>
							<Text style={styles.closeModalBtnText}>Continue</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	scrollContent: { paddingBottom: 40, paddingHorizontal: 16 },
	utilityRow: { marginBottom: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
	effectsWrap: { flex: 1, gap: 6 },
	snackButton: { backgroundColor: '#0F766E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignSelf: 'flex-start' },
	snackButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
	effectCard: { backgroundColor: '#111827', borderRadius: 8, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
	effectCardMuted: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10 },
	effectTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
	effectTitleMuted: { color: '#111827', fontSize: 11, fontWeight: '700' },
	effectText: { color: '#E5E7EB', fontSize: 10, marginTop: 2 },
	effectTextMuted: { color: '#6B7280', fontSize: 10, marginTop: 2 },
	effectTime: { color: '#93C5FD', fontSize: 10, marginTop: 2 },
	statsHeader: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 12 },
	statBox: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
	statLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 4 },
	statValue: { fontSize: 20, fontWeight: '800', color: '#333' },
	dragonArea: { alignItems: 'center', marginTop: 8 },
	dragonName: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
	dragonStats: { fontSize: 14, color: '#666', marginTop: 4, textAlign: 'center' },
	dragonArtShell: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
	dragonImage: { width: 220, height: 220, resizeMode: 'contain' },
	deadDragonImage: { opacity: 0.7 },
	eggImage: { opacity: 0.95 },
	tapDragonButton: { backgroundColor: '#F59E0B', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginBottom: 10 },
	tapDragonText: { color: '#fff', fontWeight: '800' },
	lifecycleButton: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
	reviveButton: { backgroundColor: '#16A34A' },
	lifecycleButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
	surveySection: { width: '100%', marginTop: 12 },
	surveyLabel: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#333' },
	surveysContainer: { flexDirection: 'row', gap: 12 },
	largeButton: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1.5 },
	buttonActive: { borderColor: '#4CAF50', backgroundColor: '#F0F9F1' },
	buttonDisabled: { borderColor: '#E0E0E0', backgroundColor: '#FAFAFA', opacity: 0.6 },
	buttonTop: { backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
	largeButtonTitle: { fontSize: 17, fontWeight: '700' },
	statusBadge: { fontSize: 12, fontWeight: '600', color: '#4CAF50', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
	progressBarSmall: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
	progressFillSmall: { height: '100%', backgroundColor: '#4CAF50' },
	surveyHint: { fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' },
	modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
	modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
	modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
	modalText: { fontSize: 14, color: '#333', marginBottom: 6, lineHeight: 20 },
	snackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
	snackName: { fontSize: 15, fontWeight: '700', color: '#111' },
	useSnackBtn: { backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
	useSnackBtnText: { color: '#fff', fontWeight: '700' },
	closeModalBtn: { marginTop: 12, backgroundColor: '#111827', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
	closeModalBtnText: { color: '#fff', fontWeight: '700' },
});
