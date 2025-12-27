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

				<Text style={styles.sectionTitle}>Revivals</Text>
				<Text style={styles.paragraph}>When your dragon's HP reaches 0, it enters the "dead" state. You can pay respects to your fallen dragon, which allows you to revive it as a new generation (Dragon Jr.). Each revival increases the generation counter and adds 1 million to the world population. Your dragon revives with full health and a small 2-day death debuff.</Text>

				<Text style={styles.sectionTitle}>Snacks</Text>
				<Text style={styles.paragraph}>- Health Snacks: Restore your dragon's HP immediately (small, medium, large tiers available).</Text>
				<Text style={styles.paragraph}>- Regeneration Snacks: Provide daily HP recovery for multiple days (great for long-term health).</Text>
				<Text style={styles.paragraph}>- Mood Snacks: Reduce your Fury meter (Nugget, Bar, Feast with varying potency).</Text>
				<Text style={styles.paragraph}>- Coin Boosters: Double, triple, or quadruple coin gains for 1 day (powerful temporary multipliers).</Text>
				<Text style={styles.paragraph}>- Double Jeopardy: Double both gains AND losses for a day (high risk, high reward).</Text>

				<Text style={styles.sectionTitle}>Idlers & Generators</Text>
				<Text style={styles.paragraph}>Generators passively produce coins every day based on your multipliers. Each has unique scaling:</Text>
				<Text style={styles.paragraph}>- Treasury: +1 coins/day (basic generator).</Text>
				<Text style={styles.paragraph}>- Forge: +2 + (Yang/50) coins/day (scales with yang stat).</Text>
				<Text style={styles.paragraph}>- Freezer: +2 + (Yin/50) coins/day (scales with yin stat).</Text>
				<Text style={styles.paragraph}>- Dragon NFT: +3 + (Streak/30) coins/day (scales with streak).</Text>
				<Text style={styles.paragraph}>- Advanced Generators: Anti-Treasury, Black Hole, Golden Saddle, etc., unlock at higher Scar Levels with exponential growth.</Text>

				<Text style={styles.sectionTitle}>Dragon Clickers</Text>
				<Text style={styles.paragraph}>Clicker upgrades enhance your dragon click rewards:</Text>
				<Text style={styles.paragraph}>- Dragon Clicks: Each click +0.01 coins (foundational upgrade).</Text>
				<Text style={styles.paragraph}>- Age Multiplier: Click gains × 0.01 × Age (scales with dragon age).</Text>
				<Text style={styles.paragraph}>- Demonic Clicks: Each click +0.001% of daily generation (percentage-based).</Text>
				<Text style={styles.paragraph}>- Mega-Dragon Clicks: Each click +0.1 coins (powerful endgame clicker).</Text>
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
