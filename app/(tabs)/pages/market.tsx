import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useItems } from '@/context/ItemsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';

export default function ShopPage() {
	const { shopItems, purchaseItem, ownedItems, useItem, sellItem } = useItems();
	const coins = useDragonCoins();
	const scarLevel = useScarLevel();
	const [filterType, setFilterType] = useState<'all' | 'snack' | 'generator' | 'cosmetic' | 'clicker' | 'theme'>('all');
	const [sortPriceAsc, setSortPriceAsc] = useState(true);

	const filteredItems = shopItems
		.filter(item => {
			const isClicker = item.id.startsWith('click_');
			const isTheme = item.id.startsWith('theme_');
			if (filterType === 'clicker') return isClicker;
			if (filterType === 'theme') return isTheme;
			if (filterType !== 'all' && item.type !== filterType) return false;
			return true;
		})
		.sort((a, b) => (sortPriceAsc ? a.price - b.price : b.price - a.price));

	const handlePurchaseAttempt = (item: (typeof shopItems)[number]) => {
		if (item.scarLevelRequired && scarLevel.currentScarLevel < item.scarLevelRequired) {
			Alert.alert('Locked', `This item requires Scar Level ${item.scarLevelRequired}+ (You have Level ${scarLevel.currentScarLevel})`, [{ text: 'OK' }]);
			return;
		}
		purchaseItem(item.id);
	};

	const renderItem = ({ item }: { item: (typeof shopItems)[number] }) => {
		const owned = ownedItems[item.id] || 0;
		const isLocked = item.scarLevelRequired ? scarLevel.currentScarLevel < item.scarLevelRequired : false;

		return (
			<View style={[styles.card, isLocked && styles.cardLocked]}>
				<Text style={styles.itemName}>{item.name}</Text>
				{isLocked && <Text style={styles.lockBadge}>🔒 L{item.scarLevelRequired}+</Text>}
				<Text style={styles.itemDesc}>{item.description}</Text>
				<View style={styles.cardFooter}>
					<Text style={styles.price}>{item.price} 🪙</Text>
					<View style={styles.actions}>
						<Pressable onPress={() => handlePurchaseAttempt(item)} style={[styles.buyButton, isLocked && styles.buyButtonDisabled]} disabled={isLocked}>
							<Text style={styles.buyText}>Buy</Text>
						</Pressable>
						{owned > 0 && !isLocked && (
							<Pressable onPress={() => useItem(item.id)} style={styles.useButton}>
								<Text style={styles.useText}>Use ({owned})</Text>
							</Pressable>
						)}
						{owned > 0 && !isLocked && item.type === 'generator' && (
							<Pressable
								onPress={() => {
									if (sellItem) sellItem(item.id);
								}}
								style={[styles.useButton, { backgroundColor: '#9C27B0' }]}>
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
			<Text style={styles.coins}>Coins: {coins.getCoins()}</Text>

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
				<Pressable style={[styles.filterButton, styles.sortButton]} onPress={() => setSortPriceAsc(s => !s)}>
					<Text style={styles.filterText}>{sortPriceAsc ? 'Price ↑' : 'Price ↓'}</Text>
				</Pressable>
			</View>

			<FlatList data={filteredItems} keyExtractor={i => i.id} renderItem={renderItem} numColumns={2} contentContainerStyle={styles.list} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
	coins: { fontSize: 14, marginBottom: 12 },
	filterBar: {
		flexDirection: 'row',
		marginBottom: 12,
		gap: 8,
		flexWrap: 'wrap',
	},
	filterButton: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	filterActive: {
		backgroundColor: '#4CAF50',
		borderColor: '#4CAF50',
	},
	filterText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#666',
	},
	filterTextActive: {
		color: '#fff',
	},
	sortButton: {
		borderStyle: 'dashed',
		borderColor: '#bbb',
	},
	list: { paddingBottom: 40 },
	card: {
		flex: 1,
		margin: 8,
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#ddd',
		backgroundColor: '#fff',
	},
	cardLocked: {
		opacity: 0.6,
		borderColor: '#aaa',
	},
	itemName: { fontSize: 16, fontWeight: '700' },
	lockBadge: {
		fontSize: 11,
		color: '#666',
		marginVertical: 4,
		fontWeight: '600',
	},
	itemDesc: { fontSize: 12, color: '#555', marginVertical: 8 },
	cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
	price: { fontSize: 14, fontWeight: '700' },
	actions: { flexDirection: 'row', gap: 8 },
	buyButton: {
		backgroundColor: '#4CAF50',
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 8,
		flex: 1,
		alignItems: 'center',
	},
	buyButtonDisabled: {
		backgroundColor: '#ccc',
	},
	buyText: { color: '#fff', fontWeight: '700' },
	useButton: {
		backgroundColor: '#1976D2',
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 8,
		marginLeft: 8,
		flex: 1,
		alignItems: 'center',
	},
	useText: { color: '#fff', fontWeight: '700' },
});
