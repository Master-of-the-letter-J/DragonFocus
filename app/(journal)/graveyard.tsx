import { useGraveyard } from '@/context/GraveyardProvider';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Graveyard() {
	const { graveyard } = useGraveyard();
	return (
		<View style={{ flex: 1 }}>
			<Text style={styles.header}>Dragon Graveyard</Text>
			<ScrollView contentContainerStyle={{ padding: 12 }}>
				{graveyard.length === 0 && <Text style={styles.emptyText}>No dragons have been laid to rest yet.</Text>}
				{graveyard.map(entry => (
					<View key={entry.id} style={styles.card}>
						<Image source={require('@/assets/images/grave-placeholder.png')} style={styles.img} />
						<View style={{ flex: 1 }}>
							<Text style={styles.name}>{entry.name}</Text>
							<Text style={styles.meta}>
								{entry.date} • Age {entry.age} • {entry.stage}
							</Text>
							<Text style={styles.detail}>Generation {entry.generation}</Text>
							<Text style={styles.detail}>Cause: {entry.cause}</Text>
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { fontSize: 18, fontWeight: '800', padding: 12 },
	emptyText: { fontSize: 13, color: '#6B7280', paddingHorizontal: 12 },
	card: { flexDirection: 'row', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 10, backgroundColor: '#fff' },
	img: { width: 64, height: 64, marginRight: 12, resizeMode: 'contain' },
	name: { fontWeight: '800', fontSize: 15, color: '#111827' },
	meta: { color: '#6B7280', marginTop: 4 },
	detail: { marginTop: 6, color: '#374151' },
});
