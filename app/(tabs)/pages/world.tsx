import { ActionButton, EmptyState, Panel, SectionTabs, StatTile } from '@/components/DragonFocusUI';
import TopHeader from '@/components/TopHeader';
import { images } from '@/constants';
import { formatAbbreviatedNumber, formatPopulationNumber } from '@/constants/number-abbreviation';
import { DRAGON_FOCUS_GAMEMODES } from '@/data/dragon-focus-2-data';
import { useAscension } from '@/context/AscensionProvider';
import { useDragonAttacks } from '@/context/DragonAttacksProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useDragonFocus } from '@/context/DragonFocusProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { useTranscension } from '@/context/TranscensionProvider';
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

type WorldTab = 'world' | 'production' | 'darkEnergy' | 'armageddon' | 'transcension' | 'blackMarket';

const WORLD_TABS: Array<{ key: WorldTab; label: string }> = [
	{ key: 'world', label: 'World' },
	{ key: 'production', label: 'Production' },
	{ key: 'darkEnergy', label: 'Dark Energy' },
	{ key: 'armageddon', label: 'Armageddon' },
	{ key: 'transcension', label: 'Deities' },
	{ key: 'blackMarket', label: 'Black Market' },
];

export default function WorldPage() {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const [tab, setTab] = useState<WorldTab>('world');
	const population = usePopulation();
	const focus = useDragonFocus();
	const coins = useDragonCoins();
	const orbs = useDragonOrbs();
	const souls = useDragonSouls();
	const embers = useDragonEmbers();
	const shards = useShards();
	const itemEconomy = useItemEconomy();
	const ascension = useAscension();
	const transcension = useTranscension();
	const attacks = useDragonAttacks();
	const { showToast } = useToast();

	const activeMode = DRAGON_FOCUS_GAMEMODES.find(mode => mode.id === focus.activeGameMode) ?? DRAGON_FOCUS_GAMEMODES[0];
	const productionPerDay = itemEconomy.getTotalGeneratorProductionPerDay();
	const lockWorld = activeMode.locksWorld;

	const buyGenerator = (id: string) => {
		if (!itemEconomy.purchaseItem(id)) Alert.alert('Purchase blocked', 'Not enough energy or requirements are not met.');
	};

	const tradeShards = (kind: 'energy' | 'dark') => {
		const cost = kind === 'energy' ? 10 : 15;
		if (!shards.spendShards(cost)) {
			Alert.alert('Need Crimson Shards', `This exchange costs ${cost} crimson shards.`);
			return;
		}
		if (kind === 'energy') coins.addCoins(1000);
		else orbs.earnOrbs(75, 'other');
		showToast({
			title: 'Black Market Exchange',
			message: kind === 'energy' ? 'Converted shards into 1,000 energy.' : 'Converted shards into 75 dark energy.',
			backgroundColor: '#F0FDF4',
			textColor: '#166534',
			shadowColor: '#15803D',
		});
	};

	const renderWorld = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<View style={styles.statGrid}>
				<StatTile label="Population" value={formatPopulationNumber(population.population)} />
				<StatTile label="Deaths" value={formatPopulationNumber(population.deathCount)} accent={theme.colors.danger} />
				<StatTile label="Energy / Day" value={formatAbbreviatedNumber(productionPerDay)} />
				<StatTile label="Mode" value={activeMode.name} accent={lockWorld ? theme.colors.warning : undefined} />
			</View>
			<Panel style={styles.earthPanel}>
				<Image source={images.earth} style={styles.earth} />
				<Text style={styles.sectionTitle}>Containment World</Text>
				<Text style={styles.bodyText}>Energy capacity is tied to civilization. If fury breaks containment, population losses reduce long-term production and can eventually kill the dragon.</Text>
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Current Gamemode</Text>
				<Text style={styles.bodyText}>{activeMode.description}</Text>
				<View style={styles.statGridNested}>
					<StatTile label="Energy Multiplier" value={`${activeMode.energyMultiplier}x`} />
					<StatTile label="Dark Energy Multiplier" value={`${activeMode.darkEnergyMultiplier}x`} />
					<StatTile label="Fury Pressure" value={`${activeMode.furyMultiplier}x`} />
					<StatTile label="World Access" value={lockWorld ? 'Hidden' : 'Open'} />
				</View>
			</Panel>
		</ScrollView>
	);

	const renderProduction = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<View style={styles.statGrid}>
				<StatTile label="Energy" value={formatAbbreviatedNumber(coins.coins)} />
				<StatTile label="Production / Day" value={formatAbbreviatedNumber(productionPerDay)} />
			</View>
			{itemEconomy.generatorItems.slice(0, 12).map(item => {
				const owned = itemEconomy.ownedItems[item.id] ?? 0;
				return (
					<Panel key={item.id}>
						<Text style={styles.cardTitle}>{item.name}</Text>
						<Text style={styles.bodyText}>{item.description}</Text>
						<Text style={styles.metaText}>Owned {formatAbbreviatedNumber(owned)} | Cost {formatAbbreviatedNumber(itemEconomy.getItemCoinCost(item.id))} energy</Text>
						<View style={styles.actionRow}>
							<ActionButton label="Buy Source" onPress={() => buyGenerator(item.id)} />
							<ActionButton label="Sell 1" variant="secondary" onPress={() => itemEconomy.sellItem(item.id)} disabled={owned <= 0} />
						</View>
					</Panel>
				);
			})}
		</ScrollView>
	);

	const renderDarkEnergy = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<View style={styles.statGrid}>
				<StatTile label="Dark Energy" value={formatAbbreviatedNumber(orbs.orbs, 1000)} />
				<StatTile label="Dragon Damage" value={formatAbbreviatedNumber(attacks.rates.damage, 1000)} />
				<StatTile label="Population Lost / Day" value={formatAbbreviatedNumber(attacks.rates.populationDestroyedPerDay, 1000)} />
				<StatTile label="Dark Energy / Day" value={formatAbbreviatedNumber(attacks.rates.orbsPerDay, 1000)} />
			</View>
			{attacks.upgradeDefinitions.map(upgrade => {
				const level = attacks.getUpgradeLevel(upgrade.id);
				return (
					<Panel key={upgrade.id}>
						<Text style={styles.cardTitle}>{upgrade.name}</Text>
						<Text style={styles.bodyText}>{upgrade.description}</Text>
						<Text style={styles.metaText}>Level {formatAbbreviatedNumber(level)} | Cost {formatAbbreviatedNumber(attacks.getUpgradeOrbCost(upgrade.id), 1000)} dark energy</Text>
						<ActionButton
							label="Buy Upgrade"
							onPress={() => {
								const result = attacks.purchaseUpgrade(upgrade.id);
								if (!result.success) Alert.alert('Upgrade blocked', result.message ?? 'Unable to buy this upgrade.');
							}}
						/>
					</Panel>
				);
			})}
		</ScrollView>
	);

	const renderArmageddon = () => {
		const rewards = ascension.getAscensionRewards();
		return (
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.statGrid}>
					<StatTile label="Plasma" value={formatAbbreviatedNumber(souls.souls)} />
					<StatTile label="Armageddons" value={formatAbbreviatedNumber(ascension.ascensionCount)} />
					<StatTile label="Preview Plasma" value={formatAbbreviatedNumber(rewards.souls)} />
					<StatTile label="Preview Shards" value={formatAbbreviatedNumber(rewards.shards)} />
				</View>
				<Panel>
					<Text style={styles.sectionTitle}>Armageddon Protocol</Text>
					<Text style={styles.bodyText}>Sacrifice current energy production to earn plasma and crimson shards. This resets energy and generator momentum, then adds temporary sickness pressure.</Text>
					{ascension.getAscensionRequirements().map(requirement => (
						<Text key={requirement.label} style={[styles.requirement, requirement.met && styles.requirementMet]}>{requirement.met ? 'Met: ' : 'Missing: '}{requirement.label}</Text>
					))}
					<View style={styles.actionRow}>
						<ActionButton label="Unlock Armageddon" variant="secondary" onPress={() => {
							const result = ascension.unlockAscension();
							if (!result.success) Alert.alert('Unlock blocked', result.message ?? 'Unable to unlock Armageddon.');
						}} disabled={ascension.ascensionUnlocked} />
						<ActionButton label="Commit Armageddon" onPress={() => {
							const result = ascension.ascend();
							if (!result.success) Alert.alert('Armageddon blocked', result.message ?? 'Requirements are not met.');
						}} />
					</View>
				</Panel>
			</ScrollView>
		);
	};

	const renderTranscension = () => {
		const preview = transcension.getTranscensionPreview();
		return (
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.statGrid}>
					<StatTile label="Anomalies" value={formatAbbreviatedNumber(embers.embers)} />
					<StatTile label="Transcensions" value={formatAbbreviatedNumber(transcension.transcensionCount)} />
					<StatTile label="Preview Anomalies" value={formatAbbreviatedNumber(preview.embersEarned)} />
					<StatTile label="Max Fury Bonus" value={formatAbbreviatedNumber(transcension.getPermanentMaxFuryBonus())} />
				</View>
				<Panel>
					<Text style={styles.sectionTitle}>Transcension</Text>
					{transcension.getTranscensionRequirements().map(requirement => (
						<Text key={requirement.label} style={[styles.requirement, requirement.met && styles.requirementMet]}>{requirement.met ? 'Met: ' : 'Missing: '}{requirement.label}</Text>
					))}
					<View style={styles.actionRow}>
						<ActionButton label="Unlock Transcension" variant="secondary" onPress={() => {
							const result = transcension.unlockTranscension();
							if (!result.success) Alert.alert('Unlock blocked', result.message ?? 'Unable to unlock Transcension.');
						}} disabled={transcension.transcensionUnlocked} />
						<ActionButton label="Transcend" onPress={() => {
							const result = transcension.transcend();
							if (!result.success) Alert.alert('Transcension blocked', result.message ?? 'Requirements are not met.');
						}} />
					</View>
				</Panel>
				<Text style={styles.listHeader}>Deities</Text>
				{transcension.getDraconianDefinitions().slice(0, 14).map(deity => (
					<Panel key={deity.id}>
						<Text style={styles.cardTitle}>{deity.name}</Text>
						<Text style={styles.bodyText}>{deity.description}</Text>
						<Text style={styles.metaText}>Owned {formatAbbreviatedNumber(transcension.draconianLevels[deity.id] ?? 0)} | Cost {formatAbbreviatedNumber(transcension.getDraconianCost(deity.id))} anomalies</Text>
						<ActionButton label="Fund Deity" onPress={() => {
							const result = transcension.buyDraconianMultiplier(deity.id);
							if (!result.success) Alert.alert('Deity blocked', result.message ?? 'Unable to fund this deity.');
						}} />
					</Panel>
				))}
			</ScrollView>
		);
	};

	const renderBlackMarket = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<View style={styles.statGrid}>
				<StatTile label="Crimson Shards" value={formatAbbreviatedNumber(shards.shards)} />
				<StatTile label="Energy" value={formatAbbreviatedNumber(coins.coins)} />
				<StatTile label="Dark Energy" value={formatAbbreviatedNumber(orbs.orbs, 1000)} />
			</View>
			<Panel>
				<Text style={styles.sectionTitle}>Shard Exchanges</Text>
				<Text style={styles.bodyText}>Shopping, not gambling. These exchanges are placeholders for later pricing and account checkout.</Text>
				<View style={styles.actionRow}>
					<ActionButton label="10 shards -> 1,000 energy" onPress={() => tradeShards('energy')} />
					<ActionButton label="15 shards -> 75 dark energy" onPress={() => tradeShards('dark')} />
				</View>
			</Panel>
			<Panel>
				<Text style={styles.sectionTitle}>Boost Inventory</Text>
				<Text style={styles.bodyText}>Energy Boost, Dark Energy Boost, Calm Boost, and Mega Boost slots are reserved here for the next balance pass.</Text>
			</Panel>
		</ScrollView>
	);

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<SectionTabs tabs={WORLD_TABS} active={tab} onChange={setTab} />
			{lockWorld && tab !== 'world' ? (
				<ScrollView contentContainerStyle={styles.content}>
					<EmptyState title="World Locked" body="Lock In modes hide the world economy until the mode ends or is exited from Options." />
				</ScrollView>
			) : null}
			{(!lockWorld || tab === 'world') && tab === 'world' ? renderWorld() : null}
			{!lockWorld && tab === 'production' ? renderProduction() : null}
			{!lockWorld && tab === 'darkEnergy' ? renderDarkEnergy() : null}
			{!lockWorld && tab === 'armageddon' ? renderArmageddon() : null}
			{!lockWorld && tab === 'transcension' ? renderTranscension() : null}
			{!lockWorld && tab === 'blackMarket' ? renderBlackMarket() : null}
		</View>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.background },
		content: { padding: 14, paddingBottom: 36 },
		statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
		statGridNested: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
		earthPanel: { alignItems: 'center' },
		earth: { width: 190, height: 190, resizeMode: 'contain', marginBottom: 8 },
		sectionTitle: { color: colors.headerText, fontSize: 18, fontWeight: '900', marginBottom: 8 },
		cardTitle: { color: colors.titleText, fontSize: 16, fontWeight: '900' },
		bodyText: { color: colors.text, fontSize: 13, lineHeight: 20 },
		metaText: { color: colors.secondaryText, fontSize: 12, fontWeight: '800', marginTop: 8, marginBottom: 10 },
		actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
		requirement: { color: colors.danger, fontSize: 12, fontWeight: '800', marginTop: 6 },
		requirementMet: { color: colors.success },
		listHeader: { color: colors.titleText, fontSize: 17, fontWeight: '900', marginVertical: 10 },
	});
