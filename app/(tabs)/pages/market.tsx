import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useItems } from '@/context/ItemsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';

export default function ShopPage() {
	const { shopItems, purchaseItem, ownedItems, useItem, sellItem, getItemCoinCost, getItemShardCost, getGeneratorProductionPerDay } = useItems();
	const coins = useDragonCoins();
	const scarLevel = useScarLevel();
	const [filterType, setFilterType] = useState<'all' | 'snack' | 'generator' | 'cosmetic' | 'clicker' | 'theme'>('all');
	const [sortPriceAsc, setSortPriceAsc] = useState(true);

	const filteredItems = shopItems
		.filter(item => {
			if (filterType === 'all') return true;
			if (filterType === 'clicker') return item.type === 'clicker';
			return item.type === filterType;
		})
		.sort((a, b) => {
			const aPrice = getItemCoinCost(a.id);
			const bPrice = getItemCoinCost(b.id);
			return sortPriceAsc ? aPrice - bPrice : bPrice - aPrice;
		});

	const handlePurchaseAttempt = (item: (typeof shopItems)[number]) => {
		if (item.scarLevelRequired && scarLevel.currentScarLevel < item.scarLevelRequired) {
			Alert.alert('Locked', `This item requires Scar Level ${item.scarLevelRequired}+ (you have ${scarLevel.currentScarLevel}).`, [{ text: 'OK' }]);
			return;
		}
		purchaseItem(item.id);
	};

	const renderItem = ({ item }: { item: (typeof shopItems)[number] }) => {
		const owned = ownedItems[item.id] || 0;
		const isLocked = item.scarLevelRequired ? scarLevel.currentScarLevel < item.scarLevelRequired : false;
		const coinCost = getItemCoinCost(item.id);
		const shardCost = getItemShardCost(item.id);
		const unitProduction = item.type === 'generator' ? getGeneratorProductionPerDay(item.id) : 0;
		const canUse = item.type === 'snack' && owned > 0 && !isLocked;
		const canSell = (item.type === 'generator' || item.type === 'clicker') && owned > 0 && !isLocked;

		return (
			<View style={[styles.card, isLocked && styles.cardLocked]}>
				<Text style={styles.itemName}>{item.name}</Text>
				{isLocked && <Text style={styles.lockBadge}>Locked: L{item.scarLevelRequired}+</Text>}
				<Text style={styles.itemDesc}>{item.description}</Text>
				{item.type === 'generator' && (
					<Text style={styles.itemDesc}>
						Gen/day: {unitProduction.toFixed(2)} each ({(unitProduction * owned).toFixed(2)} total)
					</Text>
				)}
				<View style={styles.cardFooter}>
					<Text style={styles.price}>
						{coinCost} C{shardCost > 0 ? ` + ${shardCost} S` : ''}
					</Text>
					<View style={styles.actions}>
						<Pressable onPress={() => handlePurchaseAttempt(item)} style={[styles.buyButton, isLocked && styles.buyButtonDisabled]} disabled={isLocked}>
							<Text style={styles.buyText}>Buy</Text>
						</Pressable>
						{canUse && (
							<Pressable onPress={() => useItem(item.id)} style={styles.useButton}>
								<Text style={styles.useText}>Use ({owned})</Text>
							</Pressable>
						)}
						{canSell && (
							<Pressable onPress={() => sellItem(item.id)} style={[styles.useButton, styles.sellButton]}>
								<Text style={styles.useText}>Sell</Text>
							</Pressable>
						)}
					</View>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<Text style={styles.title}>Shop</Text>
			<Text style={styles.coins}>Coins: {coins.getCoins().toFixed(2)}</Text>

			<View style={styles.filterBar}>
				<Pressable style={[styles.filterButton, filterType === 'all' && styles.filterActive]} onPress={() => setFilterType('all')}>
					<Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>All</Text>
				</Pressable>
				<Pressable style={[styles.filterButton, filterType === 'snack' && styles.filterActive]} onPress={() => setFilterType('snack')}>
					<Text style={[styles.filterText, filterType === 'snack' && styles.filterTextActive]}>Snacks</Text>
				</Pressable>
				<Pressable style={[styles.filterButton, filterType === 'generator' && styles.filterActive]} onPress={() => setFilterType('generator')}>
					<Text style={[styles.filterText, filterType === 'generator' && styles.filterTextActive]}>Generators</Text>
				</Pressable>
				<Pressable style={[styles.filterButton, filterType === 'clicker' && styles.filterActive]} onPress={() => setFilterType('clicker')}>
					<Text style={[styles.filterText, filterType === 'clicker' && styles.filterTextActive]}>Clickers</Text>
				</Pressable>
				<Pressable style={[styles.filterButton, filterType === 'cosmetic' && styles.filterActive]} onPress={() => setFilterType('cosmetic')}>
					<Text style={[styles.filterText, filterType === 'cosmetic' && styles.filterTextActive]}>Cosmetics</Text>
				</Pressable>
				<Pressable style={[styles.filterButton, filterType === 'theme' && styles.filterActive]} onPress={() => setFilterType('theme')}>
					<Text style={[styles.filterText, filterType === 'theme' && styles.filterTextActive]}>Themes</Text>
				</Pressable>
				<Pressable style={[styles.filterButton, styles.sortButton]} onPress={() => setSortPriceAsc(prev => !prev)}>
					<Text style={styles.filterText}>{sortPriceAsc ? 'Price Up' : 'Price Down'}</Text>
				</Pressable>
			</View>

			<FlatList data={filteredItems} keyExtractor={item => item.id} renderItem={renderItem} numColumns={2} contentContainerStyle={styles.list} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
	coins: { fontSize: 14, marginBottom: 12 },
	filterBar: { flexDirection: 'row', marginBottom: 12, gap: 8, flexWrap: 'wrap' },
	filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
	filterActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
	filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
	filterTextActive: { color: '#fff' },
	sortButton: { borderStyle: 'dashed', borderColor: '#bbb' },
	list: { paddingBottom: 40 },
	card: { flex: 1, margin: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
	cardLocked: { opacity: 0.6, borderColor: '#aaa' },
	itemName: { fontSize: 16, fontWeight: '700' },
	lockBadge: { fontSize: 11, color: '#666', marginVertical: 4, fontWeight: '600' },
	itemDesc: { fontSize: 12, color: '#555', marginVertical: 8 },
	cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
	price: { fontSize: 14, fontWeight: '700' },
	actions: { flexDirection: 'row', gap: 8 },
	buyButton: { backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center' },
	buyButtonDisabled: { backgroundColor: '#ccc' },
	buyText: { color: '#fff', fontWeight: '700' },
	useButton: { backgroundColor: '#1976D2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
	sellButton: { backgroundColor: '#9C27B0' },
	useText: { color: '#fff', fontWeight: '700' },
});
