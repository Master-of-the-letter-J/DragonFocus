import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { useItemStyle } from '@/context/ItemStyleProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useToast } from '@/context/ToastProvider';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

type MarketFilter = 'all' | 'snack' | 'generator' | 'cosmetic' | 'clicker' | 'theme' | 'soulMultiplier';
type SortMode = 'scar' | 'priceHigh' | 'priceLow';

const formatMarketCost = (coinCost: number, shardCost: number, soulCost: number) => {
	const costParts: string[] = [];
	if (coinCost > 0) costParts.push(`${coinCost.toFixed(0)} Coins`);
	if (shardCost > 0) costParts.push(`${shardCost} Shards`);
	if (soulCost > 0) costParts.push(`${soulCost.toFixed(0)} Souls`);
	return costParts.join(' | ') || 'Free';
};

export default function MarketPage() {
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const itemStyle = useItemStyle();
	const coins = useDragonCoins();
	const shards = useShards();
	const souls = useDragonSouls();
	const scarLevel = useScarLevel();
	const { showToast } = useToast();
	const [filterType, setFilterType] = useState<MarketFilter>('all');
	const [sortMode, setSortMode] = useState<SortMode>('scar');

	const marketItems = useMemo(
		() => [...itemSnacks.snackItems, ...itemEconomy.generatorItems, ...itemEconomy.clickerItems, ...itemEconomy.soulMultiplierItems, ...itemStyle.cosmeticItems, ...itemStyle.themeItems],
		[itemEconomy.clickerItems, itemEconomy.generatorItems, itemEconomy.soulMultiplierItems, itemSnacks.snackItems, itemStyle.cosmeticItems, itemStyle.themeItems],
	);

	type MarketEntry = (typeof marketItems)[number];

	const totalPriceMetric = (itemId: string) => {
		return itemEconomy.getItemCoinCost(itemId) + itemEconomy.getItemShardCost(itemId) * 250 + itemEconomy.getItemSoulCost(itemId) * 1000;
	};

	const filteredItems = useMemo(() => {
		const base = marketItems.filter(item => (filterType === 'all' ? true : item.type === filterType));
		return [...base].sort((a, b) => {
			if (sortMode === 'scar') {
				const scarDiff = (a.scarLevelRequired ?? 0) - (b.scarLevelRequired ?? 0);
				if (scarDiff !== 0) return scarDiff;
				return totalPriceMetric(a.id) - totalPriceMetric(b.id);
			}

			if (sortMode === 'priceHigh') return totalPriceMetric(b.id) - totalPriceMetric(a.id);
			return totalPriceMetric(a.id) - totalPriceMetric(b.id);
		});
	}, [filterType, marketItems, sortMode]);

	const purchaseMarketItem = (item: MarketEntry) => {
		if (item.type === 'snack') return itemSnacks.purchaseSnack(item.id);
		return itemEconomy.purchaseItem(item.id);
	};

	const handlePurchaseAttempt = (item: MarketEntry) => {
		if (item.scarLevelRequired && scarLevel.currentScarLevel < item.scarLevelRequired) {
			showToast({
				title: 'Market Locked',
				message: `Need Scar Level ${item.scarLevelRequired}+ to buy ${item.name}.`,
				backgroundColor: '#FEF2F2',
				textColor: '#991B1B',
				shadowColor: '#DC2626',
				shadowAmount: 18,
			});
			return;
		}

		const coinCost = itemEconomy.getItemCoinCost(item.id);
		const shardCost = itemEconomy.getItemShardCost(item.id);
		const soulCost = itemEconomy.getItemSoulCost(item.id);
		const missingParts: string[] = [];

		if (coins.getCoins() < coinCost) missingParts.push(`${(coinCost - coins.getCoins()).toFixed(0)} coins`);
		if (shards.getShards() < shardCost) missingParts.push(`${Math.max(0, shardCost - shards.getShards())} shards`);
		if (souls.getSouls() < soulCost) missingParts.push(`${Math.max(0, soulCost - souls.getSouls()).toFixed(0)} souls`);

		if (missingParts.length > 0) {
			showToast({
				title: 'Need More Resources',
				message: `Need ${missingParts.join(', ')} to buy ${item.name}.`,
				backgroundColor: '#FFF7ED',
				textColor: '#9A3412',
				shadowColor: '#EA580C',
				shadowAmount: 18,
			});
			return;
		}

		purchaseMarketItem(item);
	};

	const renderItem = ({ item }: { item: MarketEntry }) => {
		const owned = itemEconomy.ownedItems[item.id] || itemSnacks.ownedItems[item.id] || itemStyle.ownedItems[item.id] || 0;
		const isLocked = item.scarLevelRequired ? scarLevel.currentScarLevel < item.scarLevelRequired : false;
		const coinCost = itemEconomy.getItemCoinCost(item.id);
		const shardCost = itemEconomy.getItemShardCost(item.id);
		const soulCost = itemEconomy.getItemSoulCost(item.id);
		const unitProduction = item.type === 'generator' ? itemEconomy.getGeneratorProductionPerDay(item.id) : 0;
		const canUse = item.type === 'snack' && owned > 0 && !isLocked;
		const canSell = (item.type === 'generator' || item.type === 'clicker' || item.type === 'soulMultiplier') && owned > 0 && !isLocked;

		return (
			<View style={[styles.card, isLocked && styles.cardLocked]}>
				<Text style={styles.itemName}>{item.name}</Text>
				{isLocked && <Text style={styles.lockBadge}>Unlocks at Scar Level {item.scarLevelRequired}</Text>}
				{!!item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
				{item.type === 'generator' && <Text style={styles.itemDesc}>Production: {unitProduction.toFixed(2)}/day each | {(unitProduction * owned).toFixed(2)}/day total</Text>}
				{item.type === 'clicker' && <Text style={styles.itemDesc}>Owned clicker upgrades: {owned}</Text>}
				{item.type === 'soulMultiplier' && <Text style={styles.itemDesc}>Owned soul multipliers: {owned}</Text>}

				<View style={styles.priceRow}>
					<Text style={styles.priceText}>Cost</Text>
					<Text style={styles.priceValue}>{formatMarketCost(coinCost, shardCost, soulCost)}</Text>
				</View>

				<View style={styles.actions}>
					<Pressable onPress={() => handlePurchaseAttempt(item)} style={[styles.buyButton, isLocked && styles.buyButtonDisabled]}>
						<Text style={styles.buyText}>Buy</Text>
					</Pressable>
					{canUse && (
						<Pressable onPress={() => itemSnacks.useSnack(item.id)} style={styles.useButton}>
							<Text style={styles.useText}>Use ({owned})</Text>
						</Pressable>
					)}
					{canSell && (
						<Pressable onPress={() => itemEconomy.sellItem(item.id)} style={[styles.useButton, styles.sellButton]}>
							<Text style={styles.useText}>Sell 1</Text>
						</Pressable>
					)}
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			<FlatList
				data={filteredItems}
				keyExtractor={item => item.id}
				renderItem={renderItem}
				numColumns={2}
				contentContainerStyle={styles.list}
				ListHeaderComponent={
					<View>
						<Text style={styles.title}>Stats & Market</Text>
						<View style={styles.summaryGrid}>
							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>Coins</Text>
								<Text style={styles.summaryValue}>{coins.getCoins().toFixed(0)}</Text>
							</View>
							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>Shards</Text>
								<Text style={styles.summaryValue}>{shards.getShards()}</Text>
							</View>
							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>Souls</Text>
								<Text style={[styles.summaryValue, styles.soulValue]}>{souls.getSouls()}</Text>
							</View>
							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>Generators / Day</Text>
								<Text style={styles.summaryValue}>{itemEconomy.getTotalGeneratorProductionPerDay().toFixed(2)}</Text>
							</View>
						</View>

						<View style={styles.sortRow}>
							{([
								{ key: 'all', label: 'All' },
								{ key: 'snack', label: 'Snacks' },
								{ key: 'generator', label: 'Generators' },
								{ key: 'clicker', label: 'Clickers' },
								{ key: 'soulMultiplier', label: 'Soul Mults' },
								{ key: 'cosmetic', label: 'Cosmetics' },
								{ key: 'theme', label: 'Themes' },
							] as { key: MarketFilter; label: string }[]).map(filter => (
								<Pressable key={filter.key} style={[styles.filterButton, filterType === filter.key && styles.filterActive]} onPress={() => setFilterType(filter.key)}>
									<Text style={[styles.filterText, filterType === filter.key && styles.filterTextActive]}>{filter.label}</Text>
								</Pressable>
							))}
						</View>

						<View style={styles.sortRow}>
							{([
								{ key: 'scar', label: 'Scar Unlock' },
								{ key: 'priceHigh', label: 'Price High' },
								{ key: 'priceLow', label: 'Price Low' },
							] as { key: SortMode; label: string }[]).map(option => (
								<Pressable key={option.key} style={[styles.filterButton, sortMode === option.key && styles.filterActive]} onPress={() => setSortMode(option.key)}>
									<Text style={[styles.filterText, sortMode === option.key && styles.filterTextActive]}>{option.label}</Text>
								</Pressable>
							))}
						</View>
					</View>
				}
				ListFooterComponent={<Text style={styles.footerNote}>Market subtitle: generators, clickers, and soul multipliers can be sold one at a time, and snack prices keep climbing until you use the Snack Price Reset action on the Ascension page.</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	title: { fontSize: 24, fontWeight: '800', marginBottom: 12, paddingHorizontal: 12, paddingTop: 12 },
	summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 12 },
	summaryCard: { width: '47%', backgroundColor: '#F5F7FB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
	summaryLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
	summaryValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 4 },
	soulValue: { color: 'rgb(153, 102, 204)' },
	sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
	filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff' },
	filterActive: { backgroundColor: '#166534', borderColor: '#166534' },
	filterText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
	filterTextActive: { color: '#fff' },
	list: { paddingBottom: 36, paddingHorizontal: 4 },
	card: { flex: 1, margin: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
	cardLocked: { opacity: 0.7, backgroundColor: '#F9FAFB' },
	itemName: { fontSize: 16, fontWeight: '800', color: '#111827' },
	lockBadge: { fontSize: 11, color: '#7C3AED', marginTop: 4, fontWeight: '700' },
	itemDesc: { fontSize: 12, color: '#4B5563', marginTop: 8, lineHeight: 18 },
	priceRow: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
	priceText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
	priceValue: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 4 },
	actions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
	buyButton: { backgroundColor: '#15803D', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
	buyButtonDisabled: { backgroundColor: '#D1D5DB' },
	buyText: { color: '#fff', fontWeight: '800' },
	useButton: { backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
	sellButton: { backgroundColor: '#7C3AED' },
	useText: { color: '#fff', fontWeight: '800' },
	footerNote: { fontSize: 12, color: '#6B7280', lineHeight: 18, paddingHorizontal: 12, paddingTop: 8 },
});
