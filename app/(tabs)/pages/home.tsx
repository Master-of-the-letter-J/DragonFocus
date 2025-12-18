import { Text, View } from '@/components/Themed';
import { images } from '@/constants';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useFury } from '@/context/FuryProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

export default function HomePage() {
  const scar = useScarLevel();
  const coins = useDragonCoins();
  const streak = useStreak();
  const fury = useFury();
  const dragon = useDragon();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.leftTop}>
          <Text style={styles.small}>Scar: {scar.currentScarLevel} ({scar.getCurrentLevelInfo().name})</Text>
        </View>
        <View style={styles.rightTop}>
          <Text style={styles.small}>Coins: {coins.getCoins()}</Text>
          <Text style={styles.small}>Streak: {streak.streak}</Text>
          <View style={styles.furyBar}>
            <Text style={styles.small}>Fury: {fury.furyMeter}% </Text>
            <View style={[styles.furyFill, { width: `${fury.furyMeter}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.dragonArea}>
        <Text style={styles.dragonName}>{dragon.dragonName}</Text>
        <Text style={styles.dragonStats}>HP: {dragon.hp}/{dragon.maxHP} • Age: {dragon.age} • {dragon.currentStage.name}</Text>
        <Image source={images.dragon} style={styles.dragonImage} />
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>Morning Survey</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>Night Survey</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftTop: {},
  rightTop: { alignItems: 'flex-end' },
  small: { fontSize: 12 },
  furyBar: { flexDirection: 'row', width: 120, height: 8, backgroundColor: '#eee', borderRadius: 6, marginTop: 6, overflow: 'hidden' },
  furyFill: { height: '100%', backgroundColor: '#ff7043' },
  dragonArea: { alignItems: 'center', marginTop: 24 },
  dragonName: { fontSize: 22, fontWeight: '700' },
  dragonStats: { fontSize: 14, color: '#555', marginTop: 6 },
  dragonImage: { width: 200, height: 200, marginTop: 12, resizeMode: 'contain' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 },
  actionButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  actionText: { color: '#fff', fontWeight: '700' },
});
