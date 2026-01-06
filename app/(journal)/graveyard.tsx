import TopHeader from '@/components/TopHeader';
import { useGraveyard } from '@/context/GraveyardProvider';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Graveyard() {
	const { graveyard } = useGraveyard();
	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<Text style={styles.header}>🪦 Graveyard</Text>
			<ScrollView contentContainerStyle={{ padding: 12 }}>
				{graveyard.map(g => (
					<View key={g.id} style={styles.card}>
						<Image source={require('@/assets/images/grave-placeholder.png')} style={styles.img} />
						<View style={{ flex: 1 }}>
							<Text style={{ fontWeight: '700' }}>{g.name}</Text>
							<Text style={{ color: '#666' }}>
								{g.date} — Age: {g.age}
							</Text>
							<Text style={{ marginTop: 6 }}>Cause: {g.cause}</Text>
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({ header: { fontSize: 18, fontWeight: '700', padding: 12 }, card: { flexDirection: 'row', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 }, img: { width: 64, height: 64, marginRight: 12 } });
