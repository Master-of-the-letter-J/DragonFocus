import { Text, View } from '@/components/Themed';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useItems } from '@/context/ItemsProvider';
import React from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

export default function ShopPage() {
  const { shopItems, purchaseItem, ownedItems, useItem } = useItems();
  const coins = useDragonCoins();

  const renderItem = ({ item }: { item: typeof shopItems[number] }) => {
    const owned = ownedItems[item.id] || 0;
    return (
      <View style={styles.card}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{item.price} 🪙</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => purchaseItem(item.id)}
              style={styles.buyButton}
            >
              <Text style={styles.buyText}>Buy</Text>
            </Pressable>
            {owned > 0 && (
              <Pressable onPress={() => useItem(item.id)} style={styles.useButton}>
                <Text style={styles.useText}>Use ({owned})</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop</Text>
      <Text style={styles.coins}>Coins: {coins.getCoins()}</Text>
      <FlatList
        data={shopItems}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  coins: { fontSize: 14, marginBottom: 12 },
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
  itemName: { fontSize: 16, fontWeight: '700' },
  itemDesc: { fontSize: 12, color: '#555', marginVertical: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  buyButton: { backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  buyText: { color: '#fff', fontWeight: '700' },
  useButton: { backgroundColor: '#1976D2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginLeft: 8 },
  useText: { color: '#fff', fontWeight: '700' },
});
