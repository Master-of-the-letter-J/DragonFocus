import { images } from '@/constants';
import { useAscension } from '@/context/AscensionProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useShards } from '@/context/DragonShardsProvider';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AscensionPage() {
	const ascension = useAscension();
	const souls = useDragonSouls();
	const shards = useShards();
	const itemEconomy = useItemEconomy();

	const requirements = ascension.getAscensionRequirements();
	const rewards = ascension.getAscensionRewards();
	const soulConverterCost = ascension.getSoulConverterCost();
	const soulRespecCost = ascension.getSoulRespecCost();
	const soulRespecRefund = Math.floor(itemEconomy.getSoulMultiplierRefundTotal());
	const snackResetCost = ascension.getSnackResetCost();
	const canAscend = ascension.canAscend();

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.header}>Ascension</Text>
			<Text style={styles.soulsText}>Dragon Souls: {souls.getSouls()}</Text>
			<Image source={images.dragonHeart} style={styles.heartImage} />

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Ascend Your Dragon</Text>
				<Text style={styles.description}>Ascension sacrifices coins, generators, and clickers, then converts that run into Dragon Souls and Dragon Shards.</Text>

				<View style={styles.requirementsList}>
					{requirements.map(requirement => (
						<Text key={requirement.label} style={[styles.requirementText, requirement.met ? styles.requirementMet : styles.requirementUnmet]}>
							{requirement.met ? '[x]' : '[ ]'} {requirement.label}
						</Text>
					))}
				</View>

				<View style={styles.previewBox}>
					<Text style={styles.previewTitle}>Ascension Preview</Text>
					<Text style={styles.previewText}>Souls: +{rewards.souls}</Text>
					<Text style={styles.previewText}>Shards: +{rewards.shards}</Text>
					<Text style={styles.previewText}>Generators sacrificed: {rewards.generatorsSacrificed}</Text>
					<Text style={styles.previewText}>Clickers sacrificed: {rewards.clickersSacrificed}</Text>
					<Text style={styles.previewText}>Coin bank used: {rewards.coinsBanked}</Text>
				</View>

				<Pressable
					style={[styles.primaryButton, !canAscend && styles.disabledButton]}
					disabled={!canAscend}
					onPress={() => {
						const result = ascension.ascend();
						if (!result.success) {
							Alert.alert('Ascension blocked', result.message ?? 'Requirements not met.');
							return;
						}
						Alert.alert('Ascension complete', `You earned ${result.rewards?.souls ?? 0} Dragon Souls and ${result.rewards?.shards ?? 0} Dragon Shards.`);
					}}>
					<Text style={styles.primaryButtonText}>Ascend</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Soul Converter</Text>
				<Text style={styles.description}>Convert Dragon Souls into Dragon Shards one click at a time. This price never resets.</Text>
				<Text style={styles.previewText}>Current cost: {soulConverterCost} Dragon Souls for 1 Dragon Shard</Text>
				<Pressable
					style={styles.secondaryButton}
					onPress={() => {
						const result = ascension.convertSoulToShard();
						if (!result.success) {
							Alert.alert('Need more souls', result.message ?? 'Not enough Dragon Souls.');
							return;
						}
						Alert.alert('Conversion complete', `Spent ${result.cost} Dragon Souls and gained 1 Dragon Shard.`);
					}}>
					<Text style={styles.secondaryButtonText}>Convert Soul</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Soul Multiplier Respec</Text>
				<Text style={styles.description}>Refund 100% of your spent Dragon Souls from soul multipliers, then clear those upgrades. This always costs 50 Dragon Shards.</Text>
				<Text style={styles.previewText}>Refund preview: {soulRespecRefund} Dragon Souls</Text>
				<Text style={styles.previewText}>Current Shards: {shards.getShards()}</Text>
				<Pressable
					style={[styles.secondaryButton, soulRespecRefund <= 0 && styles.disabledButton]}
					disabled={soulRespecRefund <= 0}
					onPress={() => {
						Alert.alert(
							'Respec Soul Multipliers',
							`Spend ${soulRespecCost} Dragon Shards to refund ${soulRespecRefund} Dragon Souls and remove all owned soul multipliers?`,
							[
								{ text: 'Cancel', style: 'cancel' },
								{
									text: 'Respec',
									style: 'destructive',
									onPress: () => {
										const result = ascension.respecSoulMultipliers();
										if (!result.success) {
											Alert.alert('Respec blocked', result.message ?? 'Unable to respec soul multipliers.');
											return;
										}
										Alert.alert('Soul multipliers reset', `Spent ${result.cost} Dragon Shards and refunded ${result.refundedSouls} Dragon Souls.`);
									},
								},
							],
						);
					}}>
					<Text style={styles.secondaryButtonText}>{soulRespecRefund > 0 ? 'Respec Soul Multipliers' : 'No Soul Multipliers Owned'}</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Snack Market Reset</Text>
				<Text style={styles.description}>Reset snack prices in the market back to their default values. You can only do this once per ascension.</Text>
				<Text style={styles.previewText}>Cost: {snackResetCost.souls} Dragon Souls + {snackResetCost.shards} Dragon Shards</Text>
				<Text style={styles.previewText}>Current Shards: {shards.getShards()}</Text>
				<Pressable
					style={[styles.secondaryButton, ascension.snackResetUsedThisAscension && styles.disabledButton]}
					disabled={ascension.snackResetUsedThisAscension}
					onPress={() => {
						const result = ascension.resetSnackMarket();
						if (!result.success) {
							Alert.alert('Market reset blocked', result.message ?? 'Unable to reset snack prices.');
							return;
						}
						Alert.alert('Snack prices reset', 'Snack prices are back to their default market values for this ascension.');
					}}>
					<Text style={styles.secondaryButtonText}>{ascension.snackResetUsedThisAscension ? 'Already Used This Ascension' : 'Reset Snack Prices'}</Text>
				</Pressable>
			</View>

			<Text style={styles.footerText}>Lair subtitle: ascension adds 1 million population, applies Ascension Sickness, and unlocks soul systems that shape future market runs.</Text>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, paddingBottom: 36 },
	header: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
	soulsText: { fontSize: 18, fontWeight: '700', color: 'rgb(153, 102, 204)', marginBottom: 12 },
	heartImage: { width: 92, height: 92, alignSelf: 'center', marginBottom: 16, resizeMode: 'contain' },
	card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 16 },
	cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
	description: { fontSize: 13, lineHeight: 20, color: '#4B5563', marginBottom: 12 },
	requirementsList: { gap: 6, marginBottom: 14 },
	requirementText: { fontSize: 13, fontWeight: '700' },
	requirementMet: { color: '#15803D' },
	requirementUnmet: { color: '#B91C1C' },
	previewBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 14 },
	previewTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6, color: '#111827' },
	previewText: { fontSize: 13, color: '#374151', marginBottom: 4 },
	primaryButton: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
	primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
	secondaryButton: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
	secondaryButtonText: { color: '#fff', fontWeight: '800' },
	disabledButton: { opacity: 0.55 },
	footerText: { fontSize: 12, lineHeight: 18, color: '#6B7280' },
});
