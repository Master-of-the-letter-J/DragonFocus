import TopHeader from '@/components/TopHeader';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface TutorialSection {
	title: string;
	body?: string[];
	bullets?: string[];
	subsections?: Array<{
		title: string;
		bullets: string[];
	}>;
}

const TUTORIAL_SECTIONS: TutorialSection[] = [
	{
		title: 'Core Loop',
		body: [
			'Dragon Focus is a focus tracker built around a living dragon. You plan the day in the morning, complete goals in the evening, and your choices affect rewards, health, fury, scar levels, currencies, market progression, and prestige systems.',
		],
		bullets: [
			'Morning Survey: plan habit goals, to-do goals, prompts, trivia, mood, journal entries, and daily intent.',
			'Evening Survey: check completed habits, to-dos, sub-goals, prompts, trivia, mood, and journal entries.',
			'Home: view the dragon, summon or revive it, collect click rewards, see surveys, population, death count, and active effects.',
			'Market: buy snacks, coin generators, clickers, cosmetics, themes, soul upgrades, ember upgrades, and black-market bundles.',
			'Lair: review goals, logs, statistics, achievements, graveyard, ascension, and transcension.',
			'Settings: tune surveys, mood options, prompts, trivia, themes, audio, weather, premium, invincibility, and dev tools.',
		],
	},
	{
		title: 'Top Header',
		body: ['The header is the quick status bar shown across the app. It is designed to keep progression visible without opening separate menus.'],
		bullets: [
			'Scar Level and Fire XP show current scar progress. At max level, the bar is filled and marked as maxed.',
			'Health shows current HP and max HP. Health can rise from goals and fall from poor daily conditions or effects.',
			'Fury shows current fury and max fury. Fury can exceed the original cap through Dragon Embers and draconian upgrades.',
			'Coins, shards, souls, embers, and streak are shown as compact currency/status readouts.',
			'Outside the home page, a survey menu appears when morning or evening surveys are still pending.',
			'Premium and settings buttons are available from the header.',
		],
	},
	{
		title: 'Home and Dragon',
		body: ['The home page is the dragon command center. It shows the dragon, daily surveys, population, death count, active effects, and snack backpack.'],
		bullets: [
			'If no dragon is spawned, the app prompts you to summon one. Tapping the egg or Spawn Dragon starts the lifecycle.',
			'If the dragon is alive, tapping the dragon earns click coins. The default click reward starts at 0.01 coins before upgrades.',
			'The dragon animates like a button when tapped.',
			'If the dragon dies, the home page shows the grave image and revive action.',
			'Spawn, death, and revive moments currently use popups until final video assets are ready.',
			'Dragon stages change by age: Egg, Hatchling, Dragonet, Juvenile, Young Adult, Adult, Elder Dragon, and Wyrm.',
			'Death applies Mourning I for 3 days and stores history in the graveyard when revived.',
			'Population and death count update through daily simulation and high-fury effects.',
		],
	},
	{
		title: 'Morning Survey',
		body: ['The morning survey is for planning and setup. It creates or edits the goals and prompts that the evening survey can later evaluate.'],
		bullets: [
			'Mood question can change fury depending on the selected emotion.',
			'Habit goal editor lets you add, delete, edit, reorder, categorize, set importance, and start challenges.',
			'To-do goal editor lets you add, delete, edit, reorder, categorize, set importance, set due dates, add sub-goals, and start challenges.',
			'Short-answer prompts can reward longer thoughtful responses.',
			'Extra prompts can be created in the morning and answered in the evening.',
			'Trivia can be configured by number of questions and category.',
			'Journal entries can be enabled for morning, evening, both, or neither.',
			'Quotes and advice can appear depending on settings.',
			'Same-day retakes are refills. Locked sections stay visible, but the app avoids double rewards.',
		],
	},
	{
		title: 'Evening Survey',
		body: ['The evening survey checks what actually happened and grants most daily progress. It mirrors the morning survey, but focuses on completion.'],
		bullets: [
			'Habit goals are checkboxes. Completed habits can earn coins, reduce fury, add health, and increase streaks.',
			'To-do goals are checkboxes. Sub-goals are also checkboxes.',
			'A to-do cannot be checked until all sub-goals are complete.',
			'A to-do with a due date cannot be completed until it is within 7 days of the due date.',
			'A to-do without a due date requires a 1-day wait after creation before it can be completed.',
			'A to-do less than 1 day long, or already due within 7 days, can be checked immediately.',
			'Normal habit and to-do rewards are blocked if completed less than 1 hour after creation. The app warns you that no normal reward is earned.',
			'Refills keep already rewarded goals locked so the same goal cannot be rewarded twice in one day.',
			'Evening survey logs completed habits, remaining habits, completed to-dos, pending to-dos, failed or late to-dos, prompt answers, trivia, journal text, and rewards.',
		],
	},
	{
		title: 'Habit Goals',
		body: ['Habit goals are recurring daily or scheduled goals. They are used for repeated behaviors and streak building.'],
		bullets: [
			'Each habit has a title, importance, categories, scheduled days, streak, optional challenge status, edit action, delete action, and move action.',
			'Importance appears as a compact tag aligned with category tags.',
			'Categories are compact tags used for organization and suggestion filtering.',
			'The habit editor supports drag reorder, suggestions, rerolls, challenge setup, and direct add/delete/edit.',
			'Standard habit limit is 20 + Scar Level * 3. Premium makes the habit limit unlimited.',
			'Each non-premium account gets 3 habit suggestion rerolls per day. Premium makes rerolls unlimited.',
			'Completing a habit can award normal coins and reduce fury. Streaks increase when scheduled days are completed in sequence.',
			'If a habit streak breaks, the evening survey can ask why it broke.',
		],
	},
	{
		title: 'To-Do Goals',
		body: ['To-do goals are one-off tasks, usually with optional due dates and sub-goals. They are stricter than habits because they can be scheduled and checked for late completion.'],
		bullets: [
			'Each to-do has a title, importance, categories, due date, sub-goals, optional challenge status, edit action, delete action, and move action.',
			'Sub-goals are real checkboxes and can be edited, deleted, and moved in the editor.',
			'To-dos with incomplete sub-goals are grayed out and show a popup if clicked.',
			'To-dos too early for their due-date completion window are grayed out and show a popup if clicked.',
			'Standard to-do limit is 40 + Scar Level * 6. Premium makes the to-do limit unlimited.',
			'Each non-premium account gets 3 to-do suggestion rerolls per day. Premium makes rerolls unlimited.',
			'Late or failed to-dos are tracked in logs and can affect rewards.',
		],
	},
	{
		title: 'Challenges',
		body: ['Challenges are higher-commitment goal modes for habits and to-dos. They cost resources to start and pay larger rewards when completed successfully.'],
		bullets: [
			'Challenge tiers include 7, 14, 30, 60, 90, and 365 day options.',
			'Longer challenge tiers are hidden behind See More Challenges so the editor stays compact.',
			'Challenge goals lock important fields while active.',
			'Habit challenges use streak progress to determine success.',
			'To-do challenges use the goal length and due date to choose a challenge tier.',
			'Deleting a challenge goal removes the challenge without granting the reward.',
			'Challenge rewards can include coins and shards.',
			'The app warns before deleting habit goals, to-do goals, and sub-goals.',
		],
	},
	{
		title: 'Survey Rewards',
		body: ['Survey rewards are intentionally layered. Base rewards come from taking surveys, while goals, prompts, trivia, streaks, snacks, multipliers, and premium can modify the final result.'],
		bullets: [
			'Morning survey completion can grant coins and shards once per day.',
			'Evening survey completion can grant coins and shards once per day.',
			'Completing both surveys in one day can grant a bonus and streak progress.',
			'Habit and to-do completions add their own rewards.',
			'Short-answer prompts can reward responses that meet the word threshold.',
			'Trivia can grant coins for correct answers. Some effects can increase the stakes.',
			'Survey completion can trigger snack bonuses, snack drops, and duplication effects.',
			'Refills preserve the log and update still-open progress but block duplicate daily rewards.',
			'Results screens show currencies, Fire XP, Fury, completed goals, reward notes, and answer summaries.',
		],
	},
	{
		title: 'Currencies',
		body: ['Dragon Focus uses several currencies and progression counters. They are intentionally connected so daily focus feeds long-term growth.'],
		subsections: [
			{
				title: 'Dragon Coins',
				bullets: [
					'Coins come from surveys, goals, prompts, trivia, dragon clicks, generators, market effects, and prestige multipliers.',
					'Dragon clicks default to 0.01 coins per click before upgrades and multipliers.',
					'Header coin display shows two decimals below 100K coins, then uses compact abbreviations.',
				],
			},
			{
				title: 'Dragon Shards',
				bullets: [
					'Shards come from survey completions, challenges, scar level rewards, ascension rewards, black-market packs, and special effects.',
					'Shards are used for premium-like market purchases, snack costs, respec actions, and some unlocks.',
				],
			},
			{
				title: 'Fire XP and Scar Level',
				bullets: [
					'Fire XP levels up Scar Level.',
					'Fire XP is earned from survey coins and idle/click coins.',
					'Leveling up resets the current Fire XP amount toward the next scar level.',
					'Scar Level unlocks market tiers, lair systems, cosmetics, invincibility, ascension, transcension, and larger goal limits.',
				],
			},
			{
				title: 'Dragon Souls',
				bullets: [
					'Souls are earned from ascension.',
					'Souls buy soul prophets, relics, converters, and respec-related systems.',
					'Ascension reward is based on coins earned during the current ascension run.',
				],
			},
			{
				title: 'Dragon Embers',
				bullets: [
					'Embers are earned through transcension.',
					'Every ember earned permanently increases max fury.',
					'Embers buy draconian multipliers and unlock late-game respec tools.',
				],
			},
		],
	},
	{
		title: 'Coin Multipliers',
		body: ['Coin production is affected by multiple systems. The exact implementation can change as balancing improves, but the tutorial-level rule is simple: better progression and upgrades multiply what you earn.'],
		bullets: [
			'Scar Level increases coin multipliers.',
			'Dragon Shards, snacks, premium, soul upgrades, ember upgrades, and temporary effects can raise rewards.',
			'High fury can reduce some coin outcomes depending on the formula.',
			'Generators produce coins per day, while clickers improve dragon tap rewards.',
			'Effects can boost surveys, generators, clickers, or trivia risk/reward.',
		],
	},
	{
		title: 'Dragon Health and Fury',
		body: ['Health and Fury are the dragon mood systems. They reflect app usage, goal completion, missed surveys, snacks, effects, and prestige systems.'],
		bullets: [
			'Health can increase from surveys and completed goals.',
			'Health can fall from skipped usage, ascension sickness, negative effects, and daily penalties.',
			'If Health reaches 0 and invincibility is off, the dragon dies.',
			'Fury can rise from negative moods, missed surveys, missed goals, and some effects.',
			'Fury can fall from completed goals, streak rewards, positive moods, and some snacks.',
			'Dragon Embers and draconian upgrades can increase maximum Fury.',
			'Health and Fury are rounded for readable display.',
		],
	},
	{
		title: 'Population and Death Count',
		body: ['Population is the world-scale dragon consequence system. It gives the dragon lifecycle and Fury stat a larger idle-game flavor.'],
		bullets: [
			'Population can grow each simulated day.',
			'High Fury can reduce population and increase death count.',
			'Death count is used by transcension requirements.',
			'Ascension adds 1 million population and does not reset the current population counter.',
			'Population display abbreviates only at very large values.',
		],
	},
	{
		title: 'Market',
		body: ['The Market is where currencies become power, utility, cosmetics, and long-term scaling. It has multiple modes.'],
		subsections: [
			{
				title: 'Main Market',
				bullets: [
					'Default tab is Dragon Snacks.',
					'Item type filters include Dragon Snacks, Cosmetics, Coin Generators, Dragon Clickers, Background and Themes, and All Items.',
					'Sort options include Scar Level Required, Price High, and Price Low.',
					'Locked items show scar requirements and cannot be bought early.',
					'Failed buys show what resource is missing.',
					'Sell buttons appear for owned generators, clickers, and soul multipliers where applicable.',
				],
			},
			{
				title: 'Snacks',
				bullets: [
					'Snacks create immediate or timed effects.',
					'Snack coin costs increase per purchase. Most snacks use 1.02 growth. Scar Level 10 snacks use 1.1 growth.',
					'Snack prices can be reset through ascension tools once per ascension.',
					'Milk clears normal effects. Super Milk clears all effects including protected ascension sickness.',
				],
			},
			{
				title: 'Coin Generators',
				bullets: [
					'Generators produce coins per day.',
					'Generator formulas can use base output, fury/yin-yang values, streak, scar level, age, population, death count, or total generator count.',
					'Generator output is affected by generator multipliers and effects.',
				],
			},
			{
				title: 'Dragon Clickers',
				bullets: [
					'Clickers improve dragon tap rewards.',
					'Dragon Clicks add click value. Age, demonic, mega, and impossible clickers add later scaling.',
					'Click rewards are affected by click multipliers and coin multipliers.',
				],
			},
			{
				title: "Hade's Market",
				bullets: [
					'Hade\'s Market contains soul prophets, relics, and draconian multipliers.',
					'Soul prophet and relic families stack within their family, while different families multiply together.',
					'Draconian upgrades use Dragon Embers and affect ascension shards, sickness time, survey duplication, max fury, and population growth.',
					'Hade\'s Market uses two-column item layout for easier scanning.',
				],
			},
			{
				title: 'Black Market',
				bullets: [
					'Coin bundles trade shards for coins.',
					'Shard packs represent real-money purchase placeholders.',
					'Checkout is still placeholder-only until billing is wired.',
				],
			},
		],
	},
	{
		title: 'Status Effects',
		body: ['Status effects are temporary modifiers from snacks, ascension, transcension, death events, and special systems.'],
		bullets: [
			'Effects can change survey rewards, generator rewards, click rewards, trivia rewards, fury per day, health per day, or immediate health/fury.',
			'Effects can have durations and queue groups so related effects interact cleanly.',
			'Protected effects, like ascension sickness, resist normal clearing.',
			'Active effects appear on the home page and idle reward popup.',
			'Idle simulation accounts for effects across elapsed time.',
		],
	},
	{
		title: 'Scar Levels',
		body: ['Scar Level is the main non-prestige progression track. It unlocks systems and increases power.'],
		bullets: [
			'Scar Level 0: surveys, challenge goals, journal/log basics, and settings.',
			'Scar Level 1: market access and early survey boosters.',
			'Scar Level 2: dragon graveyard and mood/therapy snacks.',
			'Scar Level 3: random snack survey drops, health/regen snacks, generators, clickers, and lair naming features.',
			'Scar Level 4: ascension page, extra goals, special snacks, and soul systems.',
			'Scar Level 5: dragon invincibility and stronger visual scar status.',
			'Scar Level 6: coin boosters.',
			'Scar Level 7: late dragon naming and advanced click/generator systems.',
			'Scar Level 8: transcension page, more extra goals, cosmetics, ice/fire snacks.',
			'Scar Level 9: more cosmetics.',
			'Scar Level 10+: maximum extra goals, stronger backgrounds/icons, milk and super milk, and advanced systems.',
		],
	},
	{
		title: 'Lair',
		body: ['The Lair is the long-term history and management area. Some sections require coins and scar levels to unlock. Locked sections show a lock and can be clicked to unlock.'],
		subsections: [
			{
				title: 'Habit Goals',
				bullets: ['Check, edit, add, delete, reorder, reroll, and submit habit goals outside the survey flow.'],
			},
			{
				title: 'To-Do Goals',
				bullets: ['Check, edit, add, delete, reorder, reroll, submit to-dos, and manage sub-goals outside the survey flow.'],
			},
			{
				title: 'Logs - Table',
				bullets: ['A table view of survey days with date, moods, goals, to-dos, rewards, and a detail modal for journal/prompt/trivia information.'],
			},
			{
				title: 'Logs - List',
				bullets: ['A card list of survey days with expandable details for moods, rewards, prompt responses, trivia, journal entries, completed goals, and failed goals.'],
			},
			{
				title: 'Achievements and Statistics',
				bullets: ['Shows survey stats, rewards stats, achievement progress, completion percentages, and expanded achievement detail popups.'],
			},
			{
				title: 'Dragon Graveyard',
				bullets: ['Stores previous dragons with name, age, stage, health state, generation, date, and cause of death.'],
			},
			{
				title: 'Ascension',
				bullets: ['Prestige system unlocked at Scar Level 4 after paying the lair unlock cost.'],
			},
			{
				title: 'Transcension',
				bullets: ['Late prestige system unlocked at Scar Level 8 after paying the lair unlock cost.'],
			},
		],
	},
	{
		title: 'Ascension',
		body: ['Ascension resets the coin-production run and converts progress into Dragon Souls and Dragon Shards.'],
		bullets: [
			'Unlock cost: 50 coins after Scar Level 4.',
			'Requirements: ascension unlocked, dragon is Dragonet or older at 20+ days, Scar Level 4+, dragon alive, and no active ascension sickness.',
			'Reward: Dragon Souls based on coins earned during the ascension run.',
			'Reward: Dragon Shards based on coins banked, generators sacrificed, clickers sacrificed, and ascension multipliers.',
			'Resets coins, coin generators, clickers, and coins earned during the ascension run.',
			'Adds 1 million population.',
			'Applies Ascension Sickness: -15 Health per day for 7 days plus extra days from previous ascensions, unless transcension upgrades reduce it.',
			'Soul Converter: converts Dragon Souls into Dragon Shards. Cost starts at 1 soul and grows by 1.02 per conversion.',
			'Snack Market Reset: resets snack prices once per ascension. Cost starts at 1000 souls and 100 shards, with soul cost scaling heavily.',
			'Respec Soul Multipliers: refunds spent souls from soul multipliers and costs Dragon Shards.',
		],
	},
	{
		title: 'Transcension',
		body: ['Transcension is a later prestige layer focused on Dragon Embers, max fury, death count, and draconian upgrades.'],
		bullets: [
			'Unlock cost: 100 coins after Scar Level 8.',
			'Requirements: transcension unlocked, dragon is Juvenile or older at 30+ days, Scar Level 8+, enough deaths since last transcension, and at least 1 ember in the preview.',
			'Death requirement scales from 1 billion deaths times powers of 10 based on transcension count.',
			'Dragon Embers are earned from lifetime Dragon Souls.',
			'Every Dragon Ember earned permanently increases max Fury.',
			'Transcension applies Transcension Fury X for 7 days.',
			'Transcension also applies Transcension Fury I for 30 days.',
			'Asc Sickness Reset: unlock once for 50 embers, then spend 500 shards to reset next ascension sickness time back to 7 days.',
			'Respec All: unlock once for 5 embers, then spend 50 shards to refund spent draconian embers.',
		],
	},
	{
		title: 'Premium Dragon Pact',
		body: ['Premium is currently represented by Dragon Pact. Real checkout is placeholder-only, but pricing and benefits are laid out in the app.'],
		bullets: [
			'Pricing C is active: $1.99 monthly, $4.99 yearly, and $9.99 permanent.',
			'Benefits include 2x coin multiplier, 2x Fire XP multiplier, unlimited to-do goals, premium cosmetics, unlimited goal rerolls, premium early unlocks, expanded logs, and premium backgrounds.',
			'Premium can be toggled in dev/general settings until real billing is connected.',
		],
	},
	{
		title: 'Settings',
		body: ['Settings are split into Survey, General, and Tutorial areas. Most survey settings apply immediately without a save button.'],
		subsections: [
			{
				title: 'Survey Settings',
				bullets: [
					'Enable or disable advice, mood, quotes, short-answer prompts, prompt pools, trivia, and journal sections.',
					'Set morning and evening prompt counts.',
					'Set Morning Trivia Number of Questions and Evening Trivia Number of Questions.',
					'Choose prompt and trivia categories.',
					'Add custom prompts and choose whether they appear in morning, evening, or both.',
					'Add custom mood options with emoji, label, and fury change.',
					'Manage habit and to-do goal categories.',
					'Choose journal placement: none, morning, night, or both.',
				],
			},
			{
				title: 'General Settings',
				bullets: [
					'Adjust music, sound effects, ambient, and dragon sound volumes.',
					'Set light/dark mode, background theme, brightness, and dynamic weather.',
					'Toggle premium Dragon Pact and dragon invincibility.',
					'Reset visible dragon, market inventory, and survey progress.',
					'Enable dev mode for testing day simulation, currencies, streaks, scar XP, health, fury, dragon lifecycle, and effects.',
				],
			},
		],
	},
	{
		title: 'Daily Simulation and Dev Tools',
		body: ['Dev tools are for testing app logic quickly. They are intentionally gated behind Dev Mode.'],
		bullets: [
			'Simulate Day increments dragon age, processes daily generator/effect payouts, updates population, applies skipped-survey fury, applies health penalties, and forces a new survey day.',
			'Force New Day resets the survey-day lockout state without simulating every effect.',
			'Cheat buttons can spawn, kill, revive, age the dragon, change resources, change streak, add Fire XP, alter Fury, and alter HP.',
			'Clear Effects can remove timed effects for testing.',
		],
	},
	{
		title: 'Logs and Data',
		body: ['Logs are how the app turns surveys into a usable history. They are designed for both quick scanning and detailed review.'],
		bullets: [
			'Logs store morning and evening mood, goals planned, goals completed, goals incomplete, to-do counts, failed to-dos, rewards, prompts, trivia, and journal entries.',
			'Table view is best for scanning rows of days.',
			'List view is best for reading one day in detail.',
			'Journal modals show prompt responses, trivia results, and journal entries.',
			'Statistics summarize survey behavior, rewards earned, prompts answered, trivia answered, journal entries, average rewards, and best days.',
		],
	},
	{
		title: 'Achievements',
		body: ['Achievements track progress across surveys, coins, goals, challenges, scar levels, dragon lifecycle, and special systems.'],
		bullets: [
			'Achievements show title, icon or emoji, and progress.',
			'Opening an achievement can show expanded detail.',
			'Some achievements relate to surveys, streaks, perfect days, scar levels, dragon death/revival, market use, and long-term progression.',
		],
	},
	{
		title: 'Visuals and Placeholders',
		body: ['Some art, video, audio, and cosmetic systems are intentionally placeholder-ready while the gameplay logic is built.'],
		bullets: [
			'Dragon stage art uses current placeholder images.',
			'Spawn, death, and revival video moments currently use popup placeholders.',
			'Market cosmetics, themes, backgrounds, and premium backgrounds are structured for future refinement.',
			'Landing page uses a medieval dragon theme and can later swap in final media.',
			'Sound effects and ambience controls exist, while final sound polish can be added later.',
		],
	},
	{
		title: 'Practical Tips',
		bullets: [
			'Do the morning survey first so the app knows what you planned.',
			'Use the evening survey to lock in rewards and keep the logs accurate.',
			'Use refills only to update same-day information, not to farm duplicate rewards.',
			'Keep sub-goals small so to-dos are easier to complete.',
			'Save shards, souls, and embers for unlocks or respecs instead of spending every reward immediately.',
			'Watch active effects before using Milk or Super Milk.',
			'Use the Lair goal pages when you want to update goals without walking through a full survey.',
			'Use dev tools carefully because they can rapidly change progression.',
		],
	},
];

export default function TutorialPage() {
	return (
		<View style={styles.screen}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.container}>
				<Text style={styles.title}>Dragon Focus Complete Tutorial</Text>
				<Text style={styles.lead}>
					This page is the full in-app reference for Dragon Focus. It follows the current Dragon Focus App spec and explains the app systems as a user-facing guide.
				</Text>

				{TUTORIAL_SECTIONS.map(section => (
					<View key={section.title} style={styles.section}>
						<Text style={styles.h1}>{section.title}</Text>
						{section.body?.map(paragraph => (
							<Text key={paragraph} style={styles.p}>
								{paragraph}
							</Text>
						))}
						{section.bullets?.map(bullet => (
							<Text key={bullet} style={styles.bullet}>
								- {bullet}
							</Text>
						))}
						{section.subsections?.map(subsection => (
							<View key={subsection.title} style={styles.subsection}>
								<Text style={styles.h2}>{subsection.title}</Text>
								{subsection.bullets.map(bullet => (
									<Text key={bullet} style={styles.bullet}>
										- {bullet}
									</Text>
								))}
							</View>
						))}
					</View>
				))}

				<Text style={styles.note}>
					This tutorial is intentionally comprehensive. Some items describe planned or placeholder-ready systems as noted in the spec; unavailable checkout, final videos, and final art assets are still placeholders.
				</Text>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: '#fff' },
	container: { padding: 16, paddingBottom: 48 },
	title: { fontSize: 25, fontWeight: '900', marginBottom: 10, color: '#111827' },
	lead: { fontSize: 14, color: '#4B5563', marginBottom: 16, lineHeight: 21 },
	section: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
	subsection: { marginTop: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#E5E7EB' },
	h1: { fontSize: 19, fontWeight: '900', marginBottom: 8, color: '#7C2D12' },
	h2: { fontSize: 15, fontWeight: '800', marginBottom: 6, color: '#111827' },
	p: { fontSize: 13, color: '#374151', marginBottom: 8, lineHeight: 20 },
	bullet: { fontSize: 13, color: '#374151', marginBottom: 5, lineHeight: 19, paddingLeft: 8 },
	note: { fontSize: 12, color: '#4B5563', marginTop: 16, lineHeight: 18, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
});
