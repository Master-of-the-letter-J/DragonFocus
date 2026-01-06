import TopHeader from '@/components/TopHeader';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TutorialPage() {
	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>DragonFocus — Complete Tutorial & Reference</Text>

				<Text style={styles.lead}>This document is the in-game canonical reference for DragonFocus. It covers surveys, alarms, the graveyard, fury mechanics, journal views, shop items (including every snack), idlers (generators), clickers, ascension, scar levels, and miscellaneous systems. Use this as a full manual.</Text>

				{/* ==================== SURVEYS ==================== */}
				<Text style={styles.h1}>Surveys (Morning & Evening)</Text>
				<Text style={styles.p}>Surveys are the primary daily interaction. There are two surveys: Morning and Evening. Each survey is a short sequence of questions that may award coins, fireXP, shards, or other rewards. Surveys serve both as gameplay loops (earn small rewards) and as the player's daily log which feeds the journal.</Text>

				<Text style={styles.h2}>Survey Flow</Text>
				<Text style={styles.p}>A typical survey flow is: Advice (optional) → Mood → Habit Goals → To-Do Goals → Prompts → Trivia → End Quote → Journal Entry (if enabled). The exact order may vary slightly between Morning and Evening templates, but settings determine enabled questions.</Text>

				<Text style={styles.h2}>Retake Mode & Rewards</Text>
				<Text style={styles.p}>Retake mode occurs when you retake the same survey on the same day. In retake mode, surveys generally do not grant full coin rewards to prevent farming. Prompt rewards and small consolation coins might still apply depending on settings. The app detects same-day completion via saved date stamps in the SurveyProvider.</Text>

				<Text style={styles.h2}>Survey Settings</Text>
				<Text style={styles.p}>The survey settings control which questions appear and how they behave. The key options are:</Text>
				<Text style={styles.bullet}>• Advice types (Inspirational / Witty / Philosophical)</Text>
				<Text style={styles.bullet}>• End-of-survey Quotes (same types as Advice)</Text>
				<Text style={styles.bullet}>• Mood options (toggle and custom emotions)</Text>
				<Text style={styles.bullet}>• Habit goal categories and custom categories</Text>
				<Text style={styles.bullet}>• To-do goal categories and custom categories</Text>
				<Text style={styles.bullet}>• Custom Prompts (randomized or fixed; apply to morning/evening/both)</Text>
				<Text style={styles.bullet}>• Trivia counts (0–3 per survey)</Text>
				<Text style={styles.bullet}>• Journal entry placement and template</Text>

				{/* ==================== ALARMS ==================== */}
				<Text style={styles.h1}>Alarms & Notifications</Text>
				<Text style={styles.p}>Alarms allow scheduling reminders to take surveys. They are configured in the Alarms section (journal area). Alarms will trigger local notifications at the configured times. The system respects device notification permissions; ensure permissions are granted for consistent reminders. You can set multiple alarms per day for morning and evening surveys at any time you prefer.</Text>

				{/* ==================== FURY & EMOTIONS ==================== */}
				<Text style={styles.h1}>Fury, Emotions, and Mood</Text>
				<Text style={styles.p}>Fury is a core resource that tracks the dragon's emotional volatility. Fury increases when negative emotions are selected and decreases with positive emotions, snacks, and passive effects. Fury affects gameplay in several ways:</Text>
				<Text style={styles.bullet}>• High Fury increases chance of population decline events and negative outcomes.</Text>
				<Text style={styles.bullet}>• Fury modifies coin multipliers and can reduce survey rewards when extreme.</Text>
				<Text style={styles.bullet}>• Fury thresholds can trigger death conditions if unchecked.</Text>
				<Text style={styles.bullet}>• Fury can reach 0 (perfect calm) or 100 (total rage), affecting dragon wellness.</Text>

				<Text style={styles.h2}>Emotions Table (Default)</Text>
				<Text style={styles.p}>The default emotion set contains a range from very negative to very positive. Each emotion has a Fury delta that modifies the player's current fury when selected. For example: Devastated (+10 Fury), Sad (+6), Worried (+3), Confused (+1), Neutral (0), Okay (-1), Content (-3), Happy (-5), Cheerful (-7), Excited (-8), Frustrated (+5), Angry (+9). Custom emotions can be added with emoji and 50-character descriptions.</Text>

				{/* ==================== GRAVEYARD & DRAGON LIFECYCLE ==================== */}
				<Text style={styles.h1}>Graveyard & Dragon Age Cycle</Text>
				<Text style={styles.p}>The Graveyard stores records of fallen dragons and their legacies. When a dragon dies (from Fury exceeding thresholds, critical failures, or other mechanics), a permanent record is added with age, date, achievements earned, coins generated, and other milestone data. Revivals let you restore a dragon at a cost (coins or shards depending on the revival option chosen).</Text>

				<Text style={styles.h2}>Dragon Age & Lifecycle</Text>
				<Text style={styles.p}>Dragons age continuously in the game. Age affects several systems: clicker multipliers scale with age, some achievements require specific ages, and ascension typically requires a minimum age (commonly 30 days). Dragon age is visible on the home screen and progresses by 1 day each time the "Simulate Day" action is triggered or a full day passes in real time.</Text>

				<Text style={styles.h2}>Death & Revival Mechanics</Text>
				<Text style={styles.p}>When a dragon dies, it enters a "dead" state. The Graveyard UI displays:</Text>
				<Text style={styles.bullet}>• Dragon name and final age</Text>
				<Text style={styles.bullet}>• Date of death</Text>
				<Text style={styles.bullet}>• Total coins earned in lifetime</Text>
				<Text style={styles.bullet}>• Achievements completed</Text>
				<Text style={styles.bullet}>• Revival cost options (coins, shards, or combination)</Text>

				<Text style={styles.p}>Revivals restore a dragon as a new generation with full HP. You can choose a revival cost tier: cheaper revivals restore less progress, while expensive revivals preserve more of your assets. Each revival increments the generation counter (Dragon Jr., Dragon III, etc.) and may apply a temporary debuff.</Text>

				<Text style={styles.h2}>Death Count & Achievements</Text>
				<Text style={styles.p}>Death Count is visible on the home screen and increments each time a dragon dies. Certain achievements require multiple deaths or revivals to unlock. Death Count persists across generations and serves as a legacy stat.</Text>

				{/* ==================== JOURNAL ==================== */}
				<Text style={styles.h1}>Journal Views & Entry System</Text>
				<Text style={styles.p}>Journal entries are created automatically from surveys (if enabled in settings). You can configure whether Morning, Evening, Both, or None create automatic journal entries. Entries include: answered survey questions, selected emotion, any prompt text, mood/fury delta, and optional custom notes.</Text>

				<Text style={styles.h2}>Journal Organization</Text>
				<Text style={styles.p}>The journal supports two primary views: List View and Table View. List View shows entries chronologically with full details per entry. Table View groups entries by date and shows both morning and evening entries side-by-side, allowing comparison across days. You can filter by date range and search by mood or emotion.</Text>

				{/* ==================== GOALS ==================== */}
				<Text style={styles.h1}>Goal Types: Habits & To-Dos</Text>
				<Text style={styles.p}>There are two primary user goals: Habit Goals (recurring, trackable behaviors) and To-Do Goals (one-off tasks). Both are required survey questions and can be configured with suggested categories (Health, Work, Learning, etc.). Habit goals can be set as challenges (7/14/30 days) with costs and rewards.</Text>

				<Text style={styles.h2}>Goal Categories</Text>
				<Text style={styles.p}>Default categories include: Health, Work, Learning, Hobbies, Social, and Fitness. You can add custom categories in survey settings. Each survey asks you to select up to N habit goals and M to-do goals (limits increase at higher scar levels).</Text>

				<Text style={styles.h2}>Challenges</Text>
				<Text style={styles.p}>Challenge lengths and associated costs/rewards are:</Text>
				<Text style={styles.bullet}>• 7 days — cost: 10 coins; reward: 100 coins</Text>
				<Text style={styles.bullet}>• 14 days — cost: 25 coins; reward: 250 coins</Text>
				<Text style={styles.bullet}>• 30 days — cost: 50 coins + 5 shards; reward: 750 coins + 60 shards</Text>

				{/* ==================== CURRENCIES ==================== */}
				<Text style={styles.h1}>Currencies & Progression</Text>
				<Text style={styles.p}>There are three main currencies in DragonFocus:</Text>
				<Text style={styles.h2}>Coins</Text>
				<Text style={styles.p}>The primary currency. Earned by completing surveys, passive generators, and clicker upgrades. Coins are spent on shop items (snacks, cosmetics, generators). Coin earnings are modified by a global multiplier that considers: Yang value, Shards owned, Scar Level, active snack buffs, and Premium status.</Text>

				<Text style={styles.h2}>Shards</Text>
				<Text style={styles.p}>A rarer, premium currency used for meaningful upgrades: ascension conversions, special cosmetics, and high-tier generators. Shards are earned by completing high-difficulty challenges, ascensions, and rare achievements.</Text>

				<Text style={styles.h2}>fireXP</Text>
				<Text style={styles.p}>Experience points earned from completing surveys and actions. Used for leveling mechanics and unlocking scar-level milestones. Higher scar levels unlock new features and increase goal count limits.</Text>

				<Text style={styles.h2}>Coin Multiplier Formula</Text>
				<Text style={styles.p}>Coin earnings are calculated as: (1 - Yang * 0.005) * (Shards * 0.01) * (1 + 0.1 * ScarLevel) * SnackMultiplier * (2 if Premium) This is a multiplicative formula. Yang above 50 can significantly reduce earnings. Shards provide a 1% multiplier per shard. Scar Level provides a 10% multiplier per level.</Text>

				{/* ==================== GENERATORS & IDLERS ==================== */}
				<Text style={styles.h1}>Generators (Idlers) — Passive Income</Text>
				<Text style={styles.p}>Generators produce coins passively over time. Each generator has: • Base coins-per-second rate • Upgrade cost curve (increasing coins or shards with each upgrade) • Tier unlock requirements (scar level, shards required) • Synergy bonuses with other generators and stats</Text>

				<Text style={styles.h2}>Tier 1 Generators (Basic)</Text>
				<Text style={styles.bullet}>• Treasury: +1 coins/sec (foundational generator)</Text>
				<Text style={styles.bullet}>• Forge: +2 coins/sec + (Yang/50) scaling (scales with Yang stat)</Text>
				<Text style={styles.bullet}>• Freezer: +2 coins/sec + (Yin/50) scaling (scales with Yin stat)</Text>
				<Text style={styles.bullet}>• Dragon NFT: +3 coins/sec + (Streak/30) scaling (scales with streak)</Text>

				<Text style={styles.h2}>Tier 2 Generators (Advanced)</Text>
				<Text style={styles.bullet}>• Anti-Treasury: Coins-per-sec = 5 * (Age / 100), scales with dragon age</Text>
				<Text style={styles.bullet}>• Black Hole: Coins-per-sec = 0.5 * ScarLevel^1.5, exponential scar scaling</Text>
				<Text style={styles.bullet}>• Golden Saddle: Coins-per-sec = 10 + (Shards * 2), scales with shards</Text>

				<Text style={styles.h2}>Tier 3+ Generators (Elite & Mythic)</Text>
				<Text style={styles.p}>Higher tier generators unlock at Scar Levels 4, 8, and 10. They have exponential growth and powerful synergies. Each requires a mix of coins and shards for upgrades. The exact names, rates, and scaling are visible in the Shop.</Text>

				{/* ==================== CLICKERS ==================== */}
				<Text style={styles.h1}>Dragon Clickers — Active Income</Text>
				<Text style={styles.p}>Clicker upgrades enhance your dragon tap rewards. Each click to the dragon yields a coin burst determined by: clicker level, active multipliers, and modifiers. Clickers may have cooldowns or charges depending on type. Clicker output scales with scar level, shards, and active snack buffs.</Text>

				<Text style={styles.h2}>Clicker Types & Scaling</Text>
				<Text style={styles.bullet}>• Dragon Clicks: Each click +0.01 coins (foundational upgrade)</Text>
				<Text style={styles.bullet}>• Age Multiplier: Click gains × 0.01 × Age (scales with dragon age)</Text>
				<Text style={styles.bullet}>• Demonic Clicks: Each click +0.001% of daily generation (percentage-based, powerful late-game)</Text>
				<Text style={styles.bullet}>• Mega-Dragon Clicks: Each click +0.1 coins (powerful endgame clicker)</Text>
				<Text style={styles.bullet}>• Shard Clicker: Click gains scale with shards owned</Text>

				{/* ==================== SHOP & SNACKS ==================== */}
				<Text style={styles.h1}>Shop & Items — Complete List</Text>
				<Text style={styles.p}>The shop contains cosmetics, generators, clickers, and snacks. Below are canonical snack and item behaviors. All items are gated by Scar Level tiers. Snacks are consumables with timed effects; cosmetics are permanent.</Text>

				<Text style={styles.h2}>Snacks (Comprehensive List & Effects)</Text>
				<Text style={styles.p}>Snacks are consumable items that grant timed effects. They are grouped by Scar Level tiers and have standard naming conventions: Basic (L1), Advanced (L2+), Elite (L4+), Legendary (L8+), Mythic (L10).</Text>

				<Text style={styles.h3}>Survey Boosters</Text>
				<Text style={styles.p}>Survey Boosters increase coin rewards from surveys for a duration. Typical variants and effects:</Text>
				<Text style={styles.bullet}>• Booster I (1 day): +25% survey coin earnings</Text>
				<Text style={styles.bullet}>• Booster II (3 days): +50% survey coin earnings</Text>
				<Text style={styles.bullet}>• Booster III (7 days): +100% survey coin earnings</Text>

				<Text style={styles.h3}>Mood Snacks (Fury Reduction)</Text>
				<Text style={styles.p}>Reduce Fury gain from negative emotions and may convert a portion to coins. Examples:</Text>
				<Text style={styles.bullet}>• Calmberry: -50% negative Fury for duration</Text>
				<Text style={styles.bullet}>• Brightleaf: -25% Fury and +5% coin conversion from negative moods</Text>
				<Text style={styles.bullet}>• Serenity Potion: -75% Fury, +10% positive mood boost</Text>

				<Text style={styles.h3}>Health & Regen Snacks</Text>
				<Text style={styles.p}>Restore HP immediately or gradually. Useful before ascension or when dragon HP is low.</Text>
				<Text style={styles.bullet}>• Health Potion (Small): Restore 10 HP immediately</Text>
				<Text style={styles.bullet}>• Health Potion (Medium): Restore 25 HP immediately</Text>
				<Text style={styles.bullet}>• Health Potion (Large): Restore 50 HP immediately</Text>
				<Text style={styles.bullet}>• Regen Draught: +5 HP per day for 7 days</Text>
				<Text style={styles.bullet}>• Healing Elixir: +10 HP per day for 14 days</Text>

				<Text style={styles.h3}>Generator Boosters</Text>
				<Text style={styles.p}>Temporarily increase generator output by a multiplier for the snack duration. Examples:</Text>
				<Text style={styles.bullet}>• Generator Boost (1.5x): ×1.5 all generator output for 1 day</Text>
				<Text style={styles.bullet}>• Generator Boost (2x): ×2 all generator output for 3 days</Text>
				<Text style={styles.bullet}>• Generator Boost (3x): ×3 all generator output for 7 days</Text>

				<Text style={styles.h3}>Clicker Boosts</Text>
				<Text style={styles.p}>Increase per-click rewards, clicker critical chance, or reduce cooldowns. Examples:</Text>
				<Text style={styles.bullet}>• Click Amplifier: +50% click damage for 1 day</Text>
				<Text style={styles.bullet}>• Click Overdrive: +100% click damage for 3 days</Text>
				<Text style={styles.bullet}>• Lucky Clicks: +20% crit chance for 7 days</Text>

				<Text style={styles.h3}>Special Event Snacks</Text>
				<Text style={styles.bullet}>• Double Jeopardy: Double both gains AND losses for 1 day (high risk, high reward)</Text>
				<Text style={styles.bullet}>• Premium Boost: 2x coin multiplier for 3 days (premium-only)</Text>
				<Text style={styles.bullet}>• Ascension Prep: Reduce ascension sickness duration by 50%</Text>

				<Text style={styles.h2}>Cosmetics & Permanent Items</Text>
				<Text style={styles.p}>Cosmetics include: Dragon skins, backgrounds (unlock at Scar Level 4), UI themes, and emotes. These are permanent purchases and do not expire. Some cosmetics are locked behind scar levels.</Text>

				{/* ==================== ASCENSION ==================== */}
				<Text style={styles.h1}>Ascension</Text>
				<Text style={styles.p}>Ascension is an end-game mechanic that allows sacrificing coins/generators/clickers for shards and resetting certain progress while granting permanent bonuses. Ascension is gated by Scar Level (unlocked at L4) and requires a minimum dragon age (commonly 30 days). Ascension applies Ascension Sickness (HP loss for several days) and has cooldowns between ascensions.</Text>

				<Text style={styles.h2}>Ascension Flow</Text>
				<Text style={styles.p}>1. Reach Scar Level 4 and dragon age 30+ 2. Visit Shop and confirm Ascension 3. Choose what to sacrifice (coins → shards, generators → shards, etc.) 4. Receive ascension bonus multiplier and permanent shard conversion 5. Apply Ascension Sickness debuff (reduces HP for 3-7 days) 6. Enter cooldown before next ascension (typically 14 days)</Text>

				{/* ==================== SCAR LEVELS ==================== */}
				<Text style={styles.h1}>Scar Levels & Progression Milestones</Text>
				<Text style={styles.p}>Scar Levels are progression milestones that unlock features and increase max goal counts. Advance by earning fireXP through surveys. Notable unlocks by scar level:</Text>
				<Text style={styles.bullet}>• L1 (Start) — Basic surveys and generators</Text>
				<Text style={styles.bullet}>• L2 — Dragon Graveyard access and death mechanics</Text>
				<Text style={styles.bullet}>• L3 — Challenges and advanced goal tracking</Text>
				<Text style={styles.bullet}>• L4 — Ascension, Background customization, Weather System</Text>
				<Text style={styles.bullet}>• L5 — Advanced journal queries and filtering</Text>
				<Text style={styles.bullet}>• L6 — Permanent stat boosts and legacy bonuses</Text>
				<Text style={styles.bullet}>• L7 — Double ascension unlocks</Text>
				<Text style={styles.bullet}>• L8 — Advanced Ascension features and elite generators</Text>
				<Text style={styles.bullet}>• L9 — Ultimate cosmetics and prestige items</Text>
				<Text style={styles.bullet}>• L10 — Ultimate Ascension and endgame content</Text>

				<Text style={styles.p}>Each scar level also increases: max habit goals (from 1 to 5), max to-do goals (from 1 to 5), goal rename limits, and shard passive income.</Text>

				{/* ==================== POPULATION & YANG ==================== */}
				<Text style={styles.h1}>Population & Yang System</Text>
				<Text style={styles.p}>The world population is a tracked stat that changes daily. Yang is an abstract meter that affects population growth and coin multipliers. High Yang (above 50) may cause population decreases (representing unrest), up to special penalties at 100.</Text>

				<Text style={styles.h2}>Yang Mechanics</Text>
				<Text style={styles.p}>Yang increases with: negative emotions, high fury, failed goals, and certain events. Yang decreases with: positive emotions, successful goals, snacks, and passive healing. Yang above 50 applies a coin multiplier penalty: (1 - Yang * 0.005). At Yang = 100, the penalty is severe (-50% coin multiplier).</Text>

				<Text style={styles.h2}>Population Tracking</Text>
				<Text style={styles.p}>Population starts at a baseline (e.g., 7 billion). It changes daily based on Yang, deaths, and revivals. High population may unlock cosmetics or achievements. Population resets on ascension or at game milestones.</Text>

				{/* ==================== WEATHER & BACKGROUNDS ==================== */}
				<Text style={styles.h1}>Weather & Backgrounds</Text>
				<Text style={styles.p}>Weather is a cosmetic system that adds visual variety to the home screen. Options include: Sunny, Rainy, Snowy, Stormy, and Twilight. Weather is unlocked by Scar Level and may provide minor atmosphere effects. Background customization unlocks at Scar Level 4; custom images can be applied if unlocked. Some backgrounds are event-exclusive or achievement-locked.</Text>

				{/* ==================== PREMIUM ==================== */}
				<Text style={styles.h1}>Premium Status</Text>
				<Text style={styles.p}>Premium status applies a 2x coin multiplier to all earnings (surveys, generators, clickers). It also unlocks: premium-only snacks, exclusive cosmetics, doubled shard passive income, and early access to new features. Premium can be purchased via in-app shop and typically renews monthly.</Text>

				{/* ==================== CHEATS & DEBUG ==================== */}
				<Text style={styles.h1}>Cheats & Debug Tools</Text>
				<Text style={styles.p}>The General Settings include debug actions for testing and progression:</Text>
				<Text style={styles.bullet}>• Simulate Day: Advances the game by one day (ages dragon, processes daily payouts, updates population/yang without alerts)</Text>
				<Text style={styles.bullet}>• Age +/- Buttons: Adjust the dragon's age for testing. Age will never go below 0</Text>
				<Text style={styles.bullet}>• Reset Coins / Shards: Reset currency to test multiplier formulas</Text>
				<Text style={styles.bullet}>• Toggle Invincible Mode: Prevents death (testing only)</Text>

				<Text style={styles.p}>Use these tools with caution in saved progression. They are intended for developers and testers, not casual play.</Text>

				{/* ==================== TIPS & BEST PRACTICES ==================== */}
				<Text style={styles.h1}>Tips & Best Practices</Text>
				<Text style={styles.bullet}>• Complete surveys daily to earn coins and maintain streaks</Text>
				<Text style={styles.bullet}>• Use Survey Boosters before doing many surveys to maximize coins</Text>
				<Text style={styles.bullet}>• Keep Fury low with mood snacks and positive habits to avoid penalties and deaths</Text>
				<Text style={styles.bullet}>• Save shards for meaningful upgrades or ascension — shards are rare</Text>
				<Text style={styles.bullet}>• Use the Inventory modal to inspect item stats, durations, and stack rules</Text>
				<Text style={styles.bullet}>• Generators and click upgrades compound over time — consider them long-term investments</Text>
				<Text style={styles.bullet}>• Plan ascensions around dragon age milestones (30, 60, 90 days)</Text>
				<Text style={styles.bullet}>• Monitor Yang to ensure coin multiplier doesn't exceed -50%</Text>
				<Text style={styles.bullet}>• Set regular alarms for morning and evening surveys to maintain consistency</Text>

				{/* ==================== FAQ & TROUBLESHOOTING ==================== */}
				<Text style={styles.h1}>FAQ & Troubleshooting</Text>

				<Text style={styles.h2}>Q: Why did my survey not give coins?</Text>
				<Text style={styles.p}>A: If retake mode is active (same-day retake), rewards may be reduced. Check survey timestamps in the SurveyProvider. Yang penalties may also apply if Yang is high. Check your multipliers on the Dragon Coins screen.</Text>

				<Text style={styles.h2}>Q: Where are snack details?</Text>
				<Text style={styles.p}>A: Open Inventory; each snack includes exact duration, potency, and stack rules. Snack stacking follows additive rules up to a cap—overlapping snacks will combine their effects.</Text>

				<Text style={styles.h2}>Q: How do I increase max goals?</Text>
				<Text style={styles.p}>A: Increase your Scar Level. Each scar level increases max habit and to-do goal counts by 1 (up to 5 each at L5+).</Text>

				<Text style={styles.h2}>Q: What happens if my dragon dies?</Text>
				<Text style={styles.p}>A: Your dragon enters the Graveyard. A record is saved with age, achievements, and coins earned. You can then choose a revival cost (coins or shards) to restore your dragon as a new generation. Death Count increments.</Text>

				<Text style={styles.h2}>Q: Can I prevent death?</Text>
				<Text style={styles.p}>A: Yes, at higher Scar Levels, Invincible Mode is unlocked (debug tool in General Settings). Toggle it on to prevent deaths. This is intended for testing and is not a permanent gameplay feature.</Text>

				{/* ==================== ACKNOWLEDGEMENTS ==================== */}
				<Text style={styles.h1}>Acknowledgements & Closing Notes</Text>
				<Text style={styles.p}>DragonFocus was developed with careful attention to daily habit design and light incremental mechanics. Every system is designed to encourage consistent, positive behavior: surveys prompt daily reflection, fury mechanics reward emotional awareness, and generators provide passive reward for long-term commitment. This tutorial is exhaustive and will expand as the game grows.</Text>

				<Text style={styles.note}>End of the full tutorial. For exact per-item numbers see the in-game Inventory tooltips and the constants files in the repository. Report any discrepancies between this guide and in-game values via the feedback system.</Text>
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
	h3: { fontSize: 14, fontWeight: '700', marginTop: 10, marginBottom: 6, color: '#444' },
	p: { fontSize: 13, color: '#333', marginBottom: 10, lineHeight: 20 },
	bullet: { fontSize: 13, color: '#333', marginBottom: 6, marginLeft: 12 },
	note: { fontSize: 12, color: '#666', marginTop: 20, fontStyle: 'italic', padding: 12, backgroundColor: '#F5F5F5', borderRadius: 6 },
});
