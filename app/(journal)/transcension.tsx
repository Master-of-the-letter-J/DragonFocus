import { formatAbbreviatedNumber } from '@/constants/number-abbreviation';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useTranscension } from '@/context/TranscensionProvider';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TranscensionPage() {
	const embers = useDragonEmbers();
	const transcension = useTranscension();
	const requirements = transcension.getTranscensionRequirements();
	const preview = transcension.getTranscensionPreview();
	const canTranscend = transcension.canTranscend();
	const refundPreview = transcension.getDraconianRefundTotal();
	const requiredDeaths = transcension.getRequiredDeathsForNextTranscension();
	const deathsSinceLastTranscension = transcension.getDeathsSinceLastTranscension();

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.header}>Transcension</Text>
			<Text style={styles.embersText}>Dragon Embers: {formatAbbreviatedNumber(embers.embers)}</Text>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Unlock Transcension</Text>
				<Text style={styles.description}>Transcension is a separate lair system from ascension. Unlocking it costs 100 coins once, then the ritual is available whenever the requirements are met.</Text>
				<Pressable
					style={[styles.secondaryButton, transcension.transcensionUnlocked && styles.disabledButton]}
					disabled={transcension.transcensionUnlocked}
					onPress={() => {
						const result = transcension.unlockTranscension();
						if (!result.success) {
							Alert.alert('Unlock blocked', result.message ?? 'Unable to unlock transcension.');
						}
					}}>
					<Text style={styles.secondaryButtonText}>{transcension.transcensionUnlocked ? 'Already Unlocked' : `Unlock for ${formatAbbreviatedNumber(transcension.getTranscensionUnlockCost())} Coins`}</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Transcend Your Dragon</Text>
				<Text style={styles.description}>Transcension now draws Dragon Embers from your lifetime Dragon Souls, while the ritual requirement tracks deaths since your last transcension.</Text>

				<View style={styles.requirementsList}>
					{requirements.map(requirement => (
						<Text key={requirement.label} style={[styles.requirementText, requirement.met ? styles.requirementMet : styles.requirementUnmet]}>
							{requirement.met ? '✅' : '☐'} {requirement.label}
						</Text>
					))}
				</View>

				<View style={styles.previewBox}>
					<Text style={styles.previewTitle}>Transcension Preview</Text>
					<Text style={styles.previewText}>Deaths this transcension: {formatAbbreviatedNumber(deathsSinceLastTranscension)}</Text>
					<Text style={styles.previewText}>Deaths required: {formatAbbreviatedNumber(requiredDeaths)}</Text>
					<Text style={styles.previewText}>Dragon Embers: +{formatAbbreviatedNumber(preview.embersEarned)}</Text>
					<Text style={styles.previewText}>Permanent Max Fury: +{formatAbbreviatedNumber(preview.permanentMaxFuryGain)}</Text>
					<Text style={styles.previewText}>Immediate Fury Surge: +55</Text>
				</View>

				<Pressable
					style={[styles.primaryButton, !canTranscend && styles.disabledButton]}
					disabled={!canTranscend}
					onPress={() => {
						const result = transcension.transcend();
						if (!result.success) {
							Alert.alert('Transcension blocked', result.message ?? 'Requirements not met.');
							return;
						}
						Alert.alert('Transcension complete', `You earned ${result.preview?.embersEarned ?? 0} Dragon Embers and permanently raised max fury by ${result.preview?.permanentMaxFuryGain ?? 0}.`);
					}}>
					<Text style={styles.primaryButtonText}>Transcend</Text>
				</Pressable>
			</View>

			<View style={styles.bottomActionRow}>
				<View style={[styles.card, styles.bottomActionCard]}>
					<Text style={styles.cardTitle}>Asc Sickness Reset</Text>
					<Text style={styles.description}>Unlock once for 50 embers, then spend 500 shards to reset the next ascension sickness timer to 7 days.</Text>
					<View style={styles.actions}>
						<Pressable
							style={styles.secondaryButton}
							onPress={() => {
								const result = transcension.unlockAscensionSicknessReset();
								if (!result.success) {
									Alert.alert('Unlock blocked', result.message ?? 'Unable to unlock the reset.');
								}
							}}>
							<Text style={styles.secondaryButtonText}>Unlock</Text>
						</Pressable>
						<Pressable
							style={styles.secondaryButton}
							onPress={() => {
								const result = transcension.resetAscensionSicknessTime();
								if (!result.success) {
									Alert.alert('Reset blocked', result.message ?? 'Unable to reset ascension sickness time.');
								}
							}}>
							<Text style={styles.secondaryButtonText}>Reset</Text>
						</Pressable>
					</View>
				</View>

				<View style={[styles.card, styles.bottomActionCard]}>
					<Text style={styles.cardTitle}>Respec All</Text>
					<Text style={styles.description}>Unlock once for 5 embers, then spend 50 shards to refund all spent embers from draconian multipliers.</Text>
					<Text style={styles.previewText}>Refund: {formatAbbreviatedNumber(refundPreview)} Embers</Text>
					<View style={styles.actions}>
						<Pressable
							style={styles.secondaryButton}
							onPress={() => {
								const result = transcension.unlockDraconianRespec();
								if (!result.success) {
									Alert.alert('Unlock blocked', result.message ?? 'Unable to unlock draconian respec.');
								}
							}}>
							<Text style={styles.secondaryButtonText}>Unlock</Text>
						</Pressable>
						<Pressable
							style={[styles.secondaryButton, refundPreview <= 0 && styles.disabledButton]}
							disabled={refundPreview <= 0}
							onPress={() => {
								const result = transcension.respecDraconianMultipliers();
								if (!result.success) {
									Alert.alert('Respec blocked', result.message ?? 'Unable to respec draconian multipliers.');
									return;
								}
								Alert.alert('Draconian reset', `Refunded ${result.refundedEmbers} Dragon Embers.`);
							}}>
							<Text style={styles.secondaryButtonText}>Respec</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, paddingBottom: 36 },
	header: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
	embersText: { fontSize: 18, fontWeight: '700', color: '#C2410C', marginBottom: 12 },
	card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 16 },
	bottomActionRow: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
	bottomActionCard: { flex: 1 },
	cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
	description: { fontSize: 13, lineHeight: 20, color: '#4B5563', marginBottom: 12 },
	requirementsList: { gap: 6, marginBottom: 14 },
	requirementText: { fontSize: 13, fontWeight: '700' },
	requirementMet: { color: '#15803D' },
	requirementUnmet: { color: '#B91C1C' },
	previewBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 14 },
	previewTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6, color: '#111827' },
	previewText: { fontSize: 13, color: '#374151', marginBottom: 4 },
	actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
	primaryButton: { backgroundColor: '#C2410C', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
	primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
	secondaryButton: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', marginTop: 8 },
	secondaryButtonText: { color: '#fff', fontWeight: '800' },
	disabledButton: { opacity: 0.55 },
});
