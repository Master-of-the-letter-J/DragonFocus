import TopHeader from '@/components/TopHeader';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TutorialPage() {
	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>Dragon Focus - Complete Tutorial & Reference</Text>

				<Text style={styles.lead}>
					Dragon Focus is built around two daily surveys, a dragon companion, and long-term progression through habits, to-dos, currencies, scar levels, and ascension.
				</Text>

				<Text style={styles.h1}>Daily Surveys</Text>
				<Text style={styles.p}>
					The morning survey helps plan the day. The evening survey checks what was finished and grants the main completion rewards. Settings can enable or disable advice, prompts,
					trivia, quotes, and journal sections.
				</Text>
				<Text style={styles.bullet}>- Same-day survey refills count as refills, not fresh full surveys.</Text>
				<Text style={styles.bullet}>- Refilled surveys avoid double rewards by graying out or hiding already rewarded content.</Text>
				<Text style={styles.bullet}>- Journal logs can still update so your day history remains complete.</Text>

				<Text style={styles.h2}>Survey Order</Text>
				<Text style={styles.p}>Survey sections can include advice, mood, habit planning, to-do planning or completion, prompts, trivia, journal notes, extra prompts, and a closing quote.</Text>

				<Text style={styles.h1}>Habits, To-Dos, and Challenges</Text>
				<Text style={styles.p}>
					Habits are recurring goals. To-dos are one-off goals that can also include sub-goals. Both support categories, importance, editing, deleting, and reordering.
				</Text>
				<Text style={styles.bullet}>- Goal limits are much higher than the earlier prototype versions.</Text>
				<Text style={styles.bullet}>- Each goal type gets 3 rerolls per day, unless premium is active.</Text>
				<Text style={styles.bullet}>- Challenge goals lock title and due-date editing once started.</Text>
				<Text style={styles.bullet}>- Deleting a challenge reward removes that challenge without claiming the reward.</Text>

				<Text style={styles.h2}>Challenge Rewards</Text>
				<Text style={styles.bullet}>- 7-day challenge: 100 coins and 10 shards</Text>
				<Text style={styles.bullet}>- 14-day challenge: 250 coins and 25 shards</Text>
				<Text style={styles.bullet}>- 30-day challenge: 750 coins and 60 shards</Text>

				<Text style={styles.h1}>Dragon Lifecycle</Text>
				<Text style={styles.p}>
					The dragon begins unspawned, can be spawned into the lair, can die when HP reaches zero, and can later be revived. Spawn, death, and revival currently use temporary popup
					moments until final video assets are added.
				</Text>
				<Text style={styles.bullet}>- Dragon stage art changes with age.</Text>
				<Text style={styles.bullet}>- Death adds Mourning I for 3 days.</Text>
				<Text style={styles.bullet}>- The graveyard stores prior dragons and revival history.</Text>

				<Text style={styles.h1}>Currencies</Text>
				<Text style={styles.p}>Dragon Focus currently uses coins, shards, fire XP, and dragon souls.</Text>
				<Text style={styles.bullet}>- Coins come from surveys, goals, clickers, and generators.</Text>
				<Text style={styles.bullet}>- Shards come from stronger rewards like challenges and prestige systems.</Text>
				<Text style={styles.bullet}>- Fire XP is earned at 10 times the coins gained from reward actions.</Text>
				<Text style={styles.bullet}>- Dragon souls come from ascension and power late-game conversion tools.</Text>

				<Text style={styles.h1}>Shop and Status Effects</Text>
				<Text style={styles.p}>
					The market includes snacks, generators, clickers, soul multipliers, cosmetics, and backgrounds. Some items require scar levels or mixed currency costs.
				</Text>
				<Text style={styles.bullet}>- Failed purchases show the missing resources instead of silently disabling the button.</Text>
				<Text style={styles.bullet}>- Sell buttons only appear for owned generators, clickers, and soul multipliers.</Text>
				<Text style={styles.bullet}>- Milk clears normal effects.</Text>
				<Text style={styles.bullet}>- Super Milk clears normal effects and protected effects like ascension sickness.</Text>

				<Text style={styles.h1}>Scar Levels</Text>
				<Text style={styles.p}>
					Scar levels are now based on current Fire XP toward the next level. When you level up, the current bar resets for the next scar tier. At the maximum tier, the UI shows the
					bar as maxed.
				</Text>

				<Text style={styles.h1}>Ascension</Text>
				<Text style={styles.p}>
					Ascension requires a Juvenile dragon that is at least 30 days old, Scar Level 4 or higher, and a 7-day wait between ascensions. It converts progress into dragon souls and
					shards while resetting major coin-production progress.
				</Text>
				<Text style={styles.bullet}>- Coins, generators, and clickers are reset after ascension.</Text>
				<Text style={styles.bullet}>- Ascension sickness removes 15 HP per day for 7 days, plus 1 extra day per ascension.</Text>
				<Text style={styles.bullet}>- The Soul Convertor turns souls into shards with a permanently scaling cost.</Text>
				<Text style={styles.bullet}>- The Shop Resetor resets snack prices once per ascension.</Text>

				<Text style={styles.h1}>Journal and Logs</Text>
				<Text style={styles.p}>
					The journal stores survey data by day and keeps both list and table views readable. Entries can include mood, notes, prompt answers, trivia results, rewards, completed goals,
					and to-do results so the lair logs reflect real progression.
				</Text>

				<Text style={styles.h1}>Settings and Dev Tools</Text>
				<Text style={styles.p}>
					Survey settings update the live survey configuration automatically. General settings also include dev-only tools to test new days, currencies, dragon age, and other
					progression flows.
				</Text>
				<Text style={styles.bullet}>- Force New Day clears the survey-day lockout state.</Text>
				<Text style={styles.bullet}>- Dev mode helps keep cheat actions gated and intentional.</Text>

				<Text style={styles.h1}>Tips</Text>
				<Text style={styles.bullet}>- Do the morning survey before heavily editing goals so the planned day is clear.</Text>
				<Text style={styles.bullet}>- Use refills to update the same day without reclaiming the same base rewards.</Text>
				<Text style={styles.bullet}>- Save shards and dragon souls for major upgrades instead of early impulse buys.</Text>
				<Text style={styles.bullet}>- Watch active effects carefully, especially protected ones that survive normal clears.</Text>

				<Text style={styles.note}>This reference is intentionally practical and current. Placeholder art and popup moments are temporary until the final media assets are ready.</Text>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, paddingBottom: 40 },
	title: { fontSize: 24, fontWeight: '800', marginBottom: 12, color: '#222' },
	lead: { fontSize: 14, color: '#555', marginBottom: 20, fontStyle: 'italic', lineHeight: 20 },
	h1: { fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 10, color: '#1976D2' },
	h2: { fontSize: 16, fontWeight: '700', marginTop: 14, marginBottom: 8, color: '#333' },
	p: { fontSize: 13, color: '#333', marginBottom: 10, lineHeight: 20 },
	bullet: { fontSize: 13, color: '#333', marginBottom: 6, marginLeft: 12 },
	note: { fontSize: 12, color: '#666', marginTop: 20, fontStyle: 'italic', padding: 12, backgroundColor: '#F5F5F5', borderRadius: 6 },
});
