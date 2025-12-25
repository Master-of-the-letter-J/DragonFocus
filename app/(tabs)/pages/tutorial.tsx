import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function TutorialPage() {
	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.title}>Quick Guide — Surveys & Game Basics</Text>

				<Text style={styles.sectionTitle}>What are Surveys?</Text>
				<Text style={styles.paragraph}>Surveys are short Morning and Night workflows to capture mood, goals, and short reflections. Completing them grants coins, XP and small health/mood adjustments.</Text>

				<Text style={styles.sectionTitle}>How surveys work</Text>
				<Text style={styles.paragraph}>- Morning: set intentions — mood, project choice, add or edit day goals, and quick checklists. Rewards: coins + XP.</Text>
				<Text style={styles.paragraph}>- Night: review the day — how many goals completed, reflections, and optional short answers. Shows results and earned rewards.</Text>
				<Text style={styles.paragraph}>- Save for Later: you can save partial answers and finish later. Use Submit to finalize and claim rewards. Some trivia questions reveal the answer only after submission.</Text>

				<Text style={styles.title}>Quick Tutorial</Text>

				<Text style={styles.sectionTitle}>Currencies</Text>
				<Text style={styles.paragraph}>- Coins: The common currency. Earned by completing surveys, clicks, and generators. Spent in the Shop for items and cosmetics.</Text>
				<Text style={styles.paragraph}>- Shards: Rare currency used for special generators and upgrades. Earned by certain achievements and by selling generators.</Text>
				<Text style={styles.paragraph}>- Fury / Mood / HP: Fury is your mood meter; it can be changed by snacks, surveys, and events. HP is your dragon's health — keep it high to avoid penalties.</Text>

				<Text style={styles.sectionTitle}>Scar Levels</Text>
				<Text style={styles.paragraph}>Scar Levels unlock features as you gain XP. Each level raises your multipliers and unlocks new shop items, dragon upgrades, and game modes. Check the Scar screen for exact unlocks.</Text>

				<Text style={styles.sectionTitle}>Invincible Dragon</Text>
				<Text style={styles.paragraph}>Invincible mode prevents your dragon from dying. It becomes available at higher Scar Levels and is intended as a safety toggle rather than a gameplay exploit.</Text>

				<Text style={styles.sectionTitle}>Pages Overview</Text>
				<Text style={styles.paragraph}>- Home: Your dragon, active effects, and quick access to surveys.</Text>
				<Text style={styles.paragraph}>- Shop: Buy snacks, generators, and cosmetics. Generators produce coins daily.</Text>
				<Text style={styles.paragraph}>- Journal: Write and track notes (unlocked at mid Scar Levels).</Text>
				<Text style={styles.paragraph}>- Settings: Tweak survey options, alarms, and game modes.</Text>

				<Text style={styles.sectionTitle}>Tips</Text>
				<Text style={styles.paragraph}>- Complete surveys daily to earn coins and streak bonuses.</Text>
				<Text style={styles.paragraph}>- Generators and click upgrades compound over time — consider them long-term investments.</Text>
				<Text style={styles.paragraph}>- Use the Tutorial for quick reminders, and visit Settings to customize your experience.</Text>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: 16, paddingBottom: 40 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
	sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
	paragraph: { fontSize: 14, color: '#444', marginBottom: 8 },
});
