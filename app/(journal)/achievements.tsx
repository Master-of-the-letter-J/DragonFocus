import TopHeader from '@/components/TopHeader';
import { useAchievements } from '@/context/AchievementsProvider';
import { useTheme } from '@/context/ThemeProvider';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Achievements() {
	const theme = useTheme();
	const { achievements } = useAchievements();
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const isUnlocked = (achievement: any) => !!achievement.unlockedAt;

	const styles = StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.colors.background },
		header: { fontSize: 20, fontWeight: '700', padding: 16, color: theme.colors.text, textAlign: 'center' },
		grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 16 },
		achievementCard: { width: '25%', aspectRatio: 1, padding: 8 },
		card: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, position: 'relative' },
		cardIncomplete: { opacity: 0.5 },
		cardHovered: { borderColor: theme.colors.tint, backgroundColor: theme.colors.tint, opacity: 1 },
		icon: { fontSize: 32, marginBottom: 8 },
		name: { fontSize: 13, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
		nameHovered: { color: theme.colors.background },
		tooltip: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.9)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, minWidth: 120, top: -60, zIndex: 100 },
		tooltipText: { color: '#fff', fontSize: 12, textAlign: 'center', lineHeight: 16 },
	});

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<Text style={styles.header}>🏆 Achievements</Text>
			<ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
				<View style={styles.grid}>
					{achievements.map(achievement => {
						const unlocked = isUnlocked(achievement);
						const hovered = hoveredId === achievement.id;
						return (
							<View key={achievement.id} style={styles.achievementCard}>
								<Pressable style={[styles.card, !unlocked && styles.cardIncomplete, hovered && styles.cardHovered]} onPress={() => setHoveredId(hovered ? null : achievement.id)}>
									{hovered && (
										<View style={styles.tooltip}>
											<Text style={styles.tooltipText}>{achievement.description}</Text>
										</View>
									)}
									<Text style={styles.icon}>{achievement.emoji}</Text>
									<Text style={[styles.name, hovered && styles.nameHovered]}>{achievement.title}</Text>
								</Pressable>
							</View>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}
