import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { formatAbbreviatedNumber, formatCoinNumber } from '@/constants/number-abbreviation';
import { BLACK_MARKET_COIN_BUNDLES, BLACK_MARKET_ORB_BUNDLES, BLACK_MARKET_SHARD_BUNDLES } from '@/data/black-market-data';
import { useDragonAttacks } from '@/context/DragonAttacksProvider';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useDragonOrbs } from '@/context/DragonOrbsProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { useItemStyle } from '@/context/ItemStyleProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useToast } from '@/context/ToastProvider';
import { useTranscension } from '@/context/TranscensionProvider';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';

type MarketMode = 'market' | 'dragonAttacks' | 'blackMarket' | 'hadesMarket';
type MarketFilter = 'all' | 'snack' | 'generator' | 'cosmetic' | 'clicker' | 'theme';
type HadesFilter = 'all' | 'soulProphets' | 'emberMultipliers';
type SortMode = 'scar' | 'priceHigh' | 'priceLow';

const formatMarketCost = (coinCost: number, shardCost: number, soulCost: number, orbCost = 0) => {
	const costParts: string[] = [];
	if (orbCost > 0) costParts.push(`${formatAbbreviatedNumber(orbCost)} Orbs`);
	if (coinCost > 0) costParts.push(`🪙 ${formatCoinNumber(coinCost)}`);
	if (shardCost > 0) costParts.push(`💎 ${formatAbbreviatedNumber(shardCost)}`);
	if (soulCost > 0) costParts.push(`🔮 ${formatAbbreviatedNumber(soulCost)}`);
	return costParts.join(' | ') || 'Free';
};

export default function MarketPage() {
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const itemStyle = useItemStyle();
	const attacks = useDragonAttacks();
	const coins = useDragonCoins();
	const embers = useDragonEmbers();
	const orbs = useDragonOrbs();
	const shards = useShards();
	const souls = useDragonSouls();
	const population = usePopulation();
	const scarLevel = useScarLevel();
	const transcension = useTranscension();
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	const { showToast } = useToast();

	const [marketMode, setMarketMode] = useState<MarketMode>('market');
	const [filterType, setFilterType] = useState<MarketFilter>('snack');
	const [hadesFilter, setHadesFilter] = useState<HadesFilter>('soulProphets');
	const [sortMode, setSortMode] = useState<SortMode>('scar');

	type MarketEntry =
		| (typeof itemSnacks.snackItems)[number]
		| (typeof itemEconomy.generatorItems)[number]
		| (typeof itemEconomy.clickerItems)[number]
		| (typeof itemEconomy.soulMultiplierItems)[number]
		| (typeof itemStyle.cosmeticItems)[number]
		| (typeof itemStyle.themeItems)[number];

	const totalPriceMetric = (itemId: string) => {
		return itemEconomy.getItemCoinCost(itemId) + itemEconomy.getItemOrbCost(itemId) * 500 + itemEconomy.getItemShardCost(itemId) * 250 + itemEconomy.getItemSoulCost(itemId) * 1000;
	};

	const marketItems = useMemo(
		() => [...itemSnacks.snackItems, ...itemEconomy.generatorItems, ...itemEconomy.clickerItems, ...itemStyle.cosmeticItems, ...itemStyle.themeItems],
		[itemEconomy.clickerItems, itemEconomy.generatorItems, itemSnacks.snackItems, itemStyle.cosmeticItems, itemStyle.themeItems],
	);
	const hadesSoulItems = useMemo(
		() =>
			[...itemEconomy.soulMultiplierItems].sort((a, b) => {
				const scarDiff = (a.scarLevelRequired ?? 0) - (b.scarLevelRequired ?? 0);
				if (scarDiff !== 0) return scarDiff;
				return totalPriceMetric(a.id) - totalPriceMetric(b.id);
			}),
		[itemEconomy.soulMultiplierItems],
	);

	const filteredItems = useMemo(() => {
		const base = marketItems.filter(item => (filterType === 'all' ? true : item.type === filterType));
		return [...base].sort((a, b) => {
			if (sortMode === 'scar') {
				const scarDiff = (a.scarLevelRequired ?? 0) - (b.scarLevelRequired ?? 0);
				if (scarDiff !== 0) return scarDiff;
				return totalPriceMetric(a.id) - totalPriceMetric(b.id);
			}
			if (sortMode === 'priceHigh') return totalPriceMetric(b.id) - totalPriceMetric(a.id);
			return totalPriceMetric(a.id) - totalPriceMetric(b.id);
		});
	}, [filterType, marketItems, sortMode]);
	const showHadesSoulItems = hadesFilter === 'all' || hadesFilter === 'soulProphets';
	const showEmberMultipliers = hadesFilter === 'all' || hadesFilter === 'emberMultipliers';

	const isSinglePurchaseItem = (item: MarketEntry) => item.type === 'cosmetic' || item.type === 'theme';

	const purchaseMarketItem = (item: MarketEntry) => {
		if (item.type === 'snack') return itemSnacks.purchaseSnack(item.id);
		if (isSinglePurchaseItem(item)) return itemStyle.purchaseItem(item.id);
		return itemEconomy.purchaseItem(item.id);
	};

	const handlePurchaseAttempt = (item: MarketEntry) => {
		const ownedCount = itemEconomy.ownedItems[item.id] || itemSnacks.ownedItems[item.id] || itemStyle.ownedItems[item.id] || 0;
		if (item.scarLevelRequired && scarLevel.currentScarLevel < item.scarLevelRequired) {
			showToast({
				title: 'Market Locked',
				message: `Need Scar Level ${item.scarLevelRequired}+ to buy ${item.name}.`,
				backgroundColor: '#FEF2F2',
				textColor: '#991B1B',
				shadowColor: '#DC2626',
				shadowAmount: 18,
			});
			return;
		}

		if (isSinglePurchaseItem(item) && ownedCount > 0) {
			showToast({
				title: 'Already Owned',
				message: `${item.name} is a one-time unlock and has already been purchased.`,
				backgroundColor: '#EFF6FF',
				textColor: '#1D4ED8',
				shadowColor: '#2563EB',
				shadowAmount: 18,
			});
			return;
		}

		const coinCost = itemEconomy.getItemCoinCost(item.id);
		const shardCost = itemEconomy.getItemShardCost(item.id);
		const orbCost = itemEconomy.getItemOrbCost(item.id);
		const soulCost = itemEconomy.getItemSoulCost(item.id);
		const missingParts: string[] = [];

		if (coins.getCoins() < coinCost) missingParts.push(`${formatAbbreviatedNumber(coinCost - coins.getCoins())} coins`);
		if (orbs.getOrbs() < orbCost) missingParts.push(`${formatAbbreviatedNumber(Math.max(0, orbCost - orbs.getOrbs()), 1000)} orbs`);
		if (shards.getShards() < shardCost) missingParts.push(`${formatAbbreviatedNumber(Math.max(0, shardCost - shards.getShards()))} shards`);
		if (souls.getSouls() < soulCost) missingParts.push(`${formatAbbreviatedNumber(Math.max(0, soulCost - souls.getSouls()))} souls`);

		if (missingParts.length > 0) {
			showToast({
				title: 'Need More Resources',
				message: `Need ${missingParts.join(', ')} to buy ${item.name}.`,
				backgroundColor: '#FFF7ED',
				textColor: '#9A3412',
				shadowColor: '#EA580C',
				shadowAmount: 18,
			});
			return;
		}

		purchaseMarketItem(item);
	};

	const handleBlackMarketCoinTrade = (bundle: (typeof BLACK_MARKET_COIN_BUNDLES)[number]) => {
		if (!shards.spendShards(bundle.shardCost)) {
			showToast({
				title: 'Not Enough Shards',
				message: `Need ${formatAbbreviatedNumber(bundle.shardCost)} shards to buy this coin bundle.`,
				backgroundColor: '#FEF2F2',
				textColor: '#991B1B',
				shadowColor: '#DC2626',
				shadowAmount: 18,
			});
			return;
		}

		const instantCoinReward = Math.max(0, itemEconomy.getTotalGeneratorProductionPerDay() * bundle.instantCoinDays);
		const totalCoinReward = bundle.coinReward + instantCoinReward;
		coins.addCoins(totalCoinReward);
		showToast({
			title: 'Black Market Deal',
			message: `Spent ${formatAbbreviatedNumber(bundle.shardCost)} shards for ${formatAbbreviatedNumber(totalCoinReward)} coins.`,
			backgroundColor: '#F0FDF4',
			textColor: '#166534',
			shadowColor: '#15803D',
			shadowAmount: 18,
		});
	};

	const handleBlackMarketOrbTrade = (bundle: (typeof BLACK_MARKET_ORB_BUNDLES)[number]) => {
		if (!shards.spendShards(bundle.shardCost)) {
			showToast({
				title: 'Not Enough Shards',
				message: `Need ${formatAbbreviatedNumber(bundle.shardCost)} shards to buy this orb bundle.`,
				backgroundColor: '#FEF2F2',
				textColor: '#991B1B',
				shadowColor: '#DC2626',
				shadowAmount: 18,
			});
			return;
		}

		const deathBonus = Math.max(0, (population.deathCount || 0) / bundle.deathCountDivisor);
		const totalOrbReward = bundle.orbReward + deathBonus;
		orbs.earnOrbs(totalOrbReward, 'other');
		showToast({
			title: 'Black Market Deal',
			message: `Spent ${formatAbbreviatedNumber(bundle.shardCost)} shards for ${formatAbbreviatedNumber(totalOrbReward, 1000)} Dragon Orbs.`,
			backgroundColor: '#F0FDF4',
			textColor: '#166534',
			shadowColor: '#15803D',
			shadowAmount: 18,
		});
	};

	const renderMarketItem = ({ item }: { item: MarketEntry }) => {
		const owned = itemEconomy.ownedItems[item.id] || itemSnacks.ownedItems[item.id] || itemStyle.ownedItems[item.id] || 0;
		const isLocked = item.scarLevelRequired ? scarLevel.currentScarLevel < item.scarLevelRequired : false;
		const coinCost = itemEconomy.getItemCoinCost(item.id);
		const shardCost = itemEconomy.getItemShardCost(item.id);
		const orbCost = itemEconomy.getItemOrbCost(item.id);
		const soulCost = itemEconomy.getItemSoulCost(item.id);
		const unitProduction = item.type === 'generator' ? itemEconomy.getGeneratorProductionPerDay(item.id) : 0;
		const canUse = item.type === 'snack' && owned > 0 && !isLocked;
		const canSell = (item.type === 'generator' || item.type === 'clicker' || item.type === 'soulMultiplier') && owned > 0 && !isLocked;
		const singlePurchaseOwned = isSinglePurchaseItem(item) && owned > 0;
		const needsSoulSummon = item.type === 'soulMultiplier' && !itemEconomy.isSoulMultiplierSummoned(item.id);
		const buyLabel = singlePurchaseOwned ? 'Owned' : needsSoulSummon ? 'Summon' : 'Buy';
		const buyDisabled = isLocked || singlePurchaseOwned;

		return (
			<View style={[styles.card, isLocked && styles.cardLocked]}>
				<Text style={styles.itemName}>{item.name}</Text>
				{isLocked ? <Text style={styles.lockBadge}>Unlocks at Scar Level {item.scarLevelRequired}</Text> : null}
				{!!item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
				{item.type === 'generator' ? <Text style={styles.itemDesc}>Production: {unitProduction.toFixed(2)}/day each | {formatAbbreviatedNumber(unitProduction * owned)}/day total</Text> : null}
				{item.type === 'clicker' ? <Text style={styles.itemDesc}>Owned clicker upgrades: {formatAbbreviatedNumber(owned)}</Text> : null}
				{item.type === 'soulMultiplier' ? <Text style={styles.itemDesc}>{needsSoulSummon ? 'Summon this prophet before upgrades apply.' : `Owned soul prophet/relic upgrades: ${formatAbbreviatedNumber(owned)}`}</Text> : null}
				{singlePurchaseOwned ? <Text style={styles.itemDesc}>Owned permanently.</Text> : null}

				<View style={styles.priceRow}>
					<Text style={styles.priceText}>Cost</Text>
					<Text style={styles.priceValue}>{formatMarketCost(coinCost, shardCost, soulCost, orbCost)}</Text>
				</View>

				<View style={styles.actions}>
					<ActionButton label={buyLabel} variant="buy" disabled={buyDisabled} onPress={() => handlePurchaseAttempt(item)} />
					{canUse ? <ActionButton label={`Use (${formatAbbreviatedNumber(owned)})`} variant="use" onPress={() => itemSnacks.useSnack(item.id)} /> : null}
					{canSell ? <ActionButton label="Sell 1" variant="sell" onPress={() => itemEconomy.sellItem(item.id)} /> : null}
				</View>
			</View>
		);
	};

	const renderMarketMode = () => (
		<FlatList
			data={filteredItems}
			keyExtractor={item => item.id}
			renderItem={renderMarketItem}
			numColumns={2}
			contentContainerStyle={styles.list}
			ListHeaderComponent={
				<View>
					<View style={styles.summaryGrid}>
						<SummaryCard label="Coins" value={`🪙 ${formatCoinNumber(coins.getCoins())}`} />
						<SummaryCard label="Shards" value={formatAbbreviatedNumber(shards.getShards())} />
						<SummaryCard label="Orbs" value={formatAbbreviatedNumber(orbs.getOrbs(), 1000)} accent={theme.colors.success} />
						<SummaryCard label="Souls" value={formatAbbreviatedNumber(souls.getSouls())} accent="rgb(153, 102, 204)" />
						<SummaryCard label="Coin Production/Day" value={formatAbbreviatedNumber(itemEconomy.getTotalGeneratorProductionPerDay())} />
					</View>

					<Text style={styles.controlLabel}>Type of Item</Text>
					<View style={styles.sortRow}>
						{([
							{ key: 'snack', label: 'Dragon Snacks' },
							{ key: 'cosmetic', label: 'Cosmetics' },
							{ key: 'generator', label: 'Coin Generators' },
							{ key: 'clicker', label: 'Dragon Clickers' },
							{ key: 'theme', label: 'Background & Themes' },
							{ key: 'all', label: 'All Items' },
						] as { key: MarketFilter; label: string }[]).map(filter => (
							<FilterPill key={filter.key} selected={filterType === filter.key} onPress={() => setFilterType(filter.key)} label={filter.label} />
						))}
					</View>

					<Text style={styles.controlLabel}>Sort By</Text>
					<View style={styles.sortRow}>
						{([
							{ key: 'scar', label: 'Scar Level Required' },
							{ key: 'priceHigh', label: 'Price High' },
							{ key: 'priceLow', label: 'Price Low' },
						] as { key: SortMode; label: string }[]).map(option => (
							<FilterPill key={option.key} selected={sortMode === option.key} onPress={() => setSortMode(option.key)} label={option.label} compact />
						))}
					</View>

					<Text style={styles.marketNote}>
						The main market covers snacks, generators, clickers, cosmetics, and themes. Soul prophet and relic upgrades now live in Hade&apos;s Market.
					</Text>
				</View>
			}
			ListFooterComponent={<Text style={styles.footerNote}>Snack prices still reset through the ascension page. Generators and clickers can be sold one at a time.</Text>}
		/>
	);

	const renderBlackMarketMode = () => (
		<ScrollView contentContainerStyle={styles.scrollContent}>
			<View style={styles.summaryGrid}>
				<SummaryCard label="Coins" value={formatCoinNumber(coins.getCoins())} />
				<SummaryCard label="Shards" value={formatAbbreviatedNumber(shards.getShards())} />
				<SummaryCard label="Orbs" value={formatAbbreviatedNumber(orbs.getOrbs(), 1000)} accent={theme.colors.success} />
				<SummaryCard label="Total Death Count" value={formatAbbreviatedNumber(population.deathCount || 0, 1000)} accent={theme.colors.danger} />
			</View>

			<Text style={styles.sectionTitle}>Shard for Coin Deals</Text>
			{BLACK_MARKET_COIN_BUNDLES.map(bundle => (
				<View key={bundle.id} style={styles.featureCard}>
					<View style={styles.featureHeader}>
						<Text style={styles.featureTitle}>{formatAbbreviatedNumber(bundle.shardCost)} Shards</Text>
						{bundle.label ? <Text style={styles.featureBadge}>{bundle.label}</Text> : null}
					</View>
					<Text style={styles.itemDesc}>
						{formatAbbreviatedNumber(bundle.coinReward)} Coins + {formatAbbreviatedNumber(bundle.instantCoinDays)} Day{bundle.instantCoinDays === 1 ? '' : 's'} of Coins Instantly
					</Text>
					<View style={styles.actions}>
						<ActionButton label="Trade Shards" variant="buy" onPress={() => handleBlackMarketCoinTrade(bundle)} />
					</View>
				</View>
			))}

			<Text style={styles.sectionTitle}>Shard for Orb Deals</Text>
			{BLACK_MARKET_ORB_BUNDLES.map(bundle => {
				const deathBonus = Math.max(0, (population.deathCount || 0) / bundle.deathCountDivisor);
				return (
					<View key={bundle.id} style={styles.featureCard}>
						<View style={styles.featureHeader}>
							<Text style={styles.featureTitle}>{formatAbbreviatedNumber(bundle.shardCost)} Shards</Text>
							{bundle.label ? <Text style={styles.featureBadge}>{bundle.label}</Text> : null}
						</View>
						<Text style={styles.itemDesc}>
							{formatAbbreviatedNumber(bundle.orbReward, 1000)} Orbs + {formatAbbreviatedNumber(deathBonus, 1000)} from Total Death Count
						</Text>
						<View style={styles.actions}>
							<ActionButton label="Trade Shards" variant="buy" onPress={() => handleBlackMarketOrbTrade(bundle)} />
						</View>
					</View>
				);
			})}

			<Text style={styles.sectionTitle}>Premium Shard Packs</Text>
			{BLACK_MARKET_SHARD_BUNDLES.map(bundle => (
				<View key={bundle.id} style={styles.featureCard}>
					<View style={styles.featureHeader}>
						<Text style={styles.featureTitle}>{bundle.priceLabel}</Text>
						{bundle.label ? <Text style={styles.featureBadge}>{bundle.label}</Text> : null}
					</View>
					<Text style={styles.itemDesc}>{formatAbbreviatedNumber(bundle.shardReward)} Dragon Shards</Text>
					<View style={styles.actions}>
						<ActionButton
							label="Open Purchase"
							variant="use"
							onPress={() => Alert.alert('Black Market Purchase', `The real-money checkout for ${bundle.priceLabel} is still a placeholder. This bundle would grant ${formatAbbreviatedNumber(bundle.shardReward)} shards.`)}
						/>
					</View>
				</View>
			))}
		</ScrollView>
	);

	const renderHadesMarketMode = () => {
		const definitions = transcension.getDraconianDefinitions();
		const refundPreview = transcension.getDraconianRefundTotal();
		return (
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.summaryGrid}>
					<SummaryCard label="Souls" value={formatAbbreviatedNumber(souls.getSouls())} accent="rgb(153, 102, 204)" />
					<SummaryCard label="Embers" value={formatAbbreviatedNumber(embers.embers)} accent="#C2410C" />
					<SummaryCard label="Max Fury Bonus" value={`+${formatAbbreviatedNumber(transcension.getPermanentMaxFuryBonus())}`} />
					<SummaryCard label="Survey Duplication" value={`x${formatAbbreviatedNumber(transcension.getSurveyDuplicationMultiplier(), 0)}`} />
					<SummaryCard label="Ascension Shards" value={`x${formatAbbreviatedNumber(transcension.getAscensionShardMultiplier(), 0)}`} />
				</View>

				<Text style={styles.marketNote}>
					Hade&apos;s Market houses your soul prophets, relics, and draconian multipliers. Soul multiplier families stack within their own family, while different families multiply together.
				</Text>

				<View style={styles.sortRow}>
					{([
						{ key: 'soulProphets', label: 'Soul Prophets & Relics' },
						{ key: 'emberMultipliers', label: 'Ember Multipliers' },
						{ key: 'all', label: 'All Items' },
					] as { key: HadesFilter; label: string }[]).map(filter => (
						<FilterPill key={filter.key} selected={hadesFilter === filter.key} onPress={() => setHadesFilter(filter.key)} label={filter.label} />
					))}
				</View>

				{showHadesSoulItems ? <Text style={styles.sectionTitle}>Soul Prophets & Relics</Text> : null}
				{showHadesSoulItems
					? (
						<View style={styles.twoColumnGrid}>
							{hadesSoulItems.map(item => (
								<View key={item.id} style={styles.twoColumnCell}>
									{renderMarketItem({ item })}
								</View>
							))}
						</View>
					)
					: null}

				{showEmberMultipliers ? <Text style={styles.sectionTitle}>Ember Multipliers</Text> : null}
				{showEmberMultipliers ? (
					<Text style={styles.marketNote}>Ember multipliers are powered by Dragon Embers from transcension. Ember income itself ignores draconian bonuses, while the shard, sickness, survey, fury, and growth effects are wired live.</Text>
				) : null}

				{showEmberMultipliers ? (
					<View style={styles.twoColumnGrid}>
						{definitions.map(definition => {
							const owned = transcension.draconianLevels[definition.id] ?? 0;
							const cost = transcension.getDraconianCost(definition.id);
							return (
								<View key={definition.id} style={[styles.featureCard, styles.twoColumnCell]}>
									<View style={styles.featureHeader}>
										<Text style={styles.featureTitle}>{definition.name}</Text>
										<Text style={styles.featureBadge}>Owned {formatAbbreviatedNumber(owned)}</Text>
									</View>
									<Text style={styles.itemDesc}>{definition.description}</Text>
									<Text style={styles.priceValue}>Cost: {formatAbbreviatedNumber(cost)} Embers</Text>
									<View style={styles.actions}>
										<ActionButton
											label="Buy Upgrade"
											variant="buy"
											onPress={() => {
												const result = transcension.buyDraconianMultiplier(definition.id);
												if (!result.success) {
													Alert.alert('Purchase blocked', result.message ?? 'Unable to buy this ember multiplier.');
												}
											}}
										/>
									</View>
								</View>
							);
						})}
					</View>
				) : null}

				{showEmberMultipliers ? (
					<View style={styles.featureCard}>
						<Text style={styles.featureTitle}>Respec Ember Multipliers</Text>
						<Text style={styles.itemDesc}>Refund all spent Dragon Embers. Unlocking this costs 5 Embers once, and each respec costs 50 Dragon Shards.</Text>
						<Text style={styles.priceValue}>Refund preview: {formatAbbreviatedNumber(refundPreview)} Embers</Text>
						<View style={styles.actions}>
							<ActionButton
								label="Unlock Respec"
								variant="use"
								onPress={() => {
									const result = transcension.unlockDraconianRespec();
									if (!result.success) {
										Alert.alert('Unlock blocked', result.message ?? 'Unable to unlock ember multiplier respec.');
									}
								}}
							/>
							<ActionButton
								label="Respec"
								variant="sell"
								onPress={() => {
									const result = transcension.respecDraconianMultipliers();
									if (!result.success) {
										Alert.alert('Respec blocked', result.message ?? 'Unable to respec ember multipliers.');
									}
								}}
							/>
						</View>
					</View>
				) : null}
			</ScrollView>
		);
	};

	const renderDragonAttacksMode = () => (
		<ScrollView contentContainerStyle={styles.scrollContent}>
			<View style={styles.summaryGrid}>
				<SummaryCard label="Dragon Orbs" value={formatAbbreviatedNumber(orbs.getOrbs(), 1000)} accent={theme.colors.success} />
				<SummaryCard label="Damage" value={formatAbbreviatedNumber(attacks.rates.damage, 1000)} />
				<SummaryCard label="Population/Day" value={formatAbbreviatedNumber(attacks.rates.populationDestroyedPerDay, 1000)} />
				<SummaryCard label="Orbs/Day" value={formatAbbreviatedNumber(attacks.rates.orbsPerDay, 1000)} accent={theme.colors.success} />
				<SummaryCard label="Legion Damage/Day" value={formatAbbreviatedNumber(attacks.rates.legionsDestroyedPerDay, 1000)} />
				<SummaryCard label="Dragon HP Loss/Day" value={formatAbbreviatedNumber(attacks.rates.healthDeclinePerDay, 1000)} accent={theme.colors.danger} />
			</View>

			<Text style={styles.marketNote}>
				Dragon Orbs are a harder secondary currency. Earning Dragon Shards grants 2 Orbs per shard, and destruction grants 0.001 Orbs per population, 0.1 per tank, and 1 per aircraft.
			</Text>

			<Text style={styles.sectionTitle}>Dragon Damage Upgrades</Text>
			<View style={styles.twoColumnGrid}>
				{attacks.upgradeDefinitions.map(upgrade => {
					const level = attacks.getUpgradeLevel(upgrade.id);
					const coinCost = attacks.getUpgradeCoinCost(upgrade.id);
					const orbCost = attacks.getUpgradeOrbCost(upgrade.id);
					const maxed = upgrade.maxLevel !== undefined && level >= upgrade.maxLevel;
					return (
						<View key={upgrade.id} style={[styles.featureCard, styles.twoColumnCell]}>
							<View style={styles.featureHeader}>
								<Text style={styles.featureTitle}>{upgrade.name}</Text>
								<Text style={styles.featureBadge}>Level {formatAbbreviatedNumber(level)}</Text>
							</View>
							<Text style={styles.itemDesc}>{upgrade.description}</Text>
							<Text style={styles.priceValue}>Cost: {maxed ? 'Maxed' : formatMarketCost(coinCost, 0, 0, orbCost)}</Text>
							<View style={styles.actions}>
								<ActionButton
									label={maxed ? 'Maxed' : 'Buy Upgrade'}
									variant="buy"
									disabled={maxed}
									onPress={() => {
										const result = attacks.purchaseUpgrade(upgrade.id);
										if (!result.success) Alert.alert('Purchase blocked', result.message ?? 'Unable to buy this dragon attack upgrade.');
									}}
								/>
							</View>
						</View>
					);
				})}
			</View>

			<Text style={styles.sectionTitle}>Dragon Abilities</Text>
			<View style={styles.twoColumnGrid}>
				{attacks.abilityDefinitions.map(ability => {
					const remaining = attacks.getAbilityRemainingSeconds(ability.id);
					return (
						<View key={ability.id} style={[styles.featureCard, styles.twoColumnCell]}>
							<View style={styles.featureHeader}>
								<Text style={styles.featureTitle}>{ability.name}</Text>
								<Text style={styles.featureBadge}>{formatAbbreviatedNumber(ability.orbCost)} Orbs</Text>
							</View>
							<Text style={styles.itemDesc}>{ability.description}</Text>
							{remaining > 0 ? <Text style={styles.priceValue}>Active: {Math.ceil(remaining / 60)}m left</Text> : null}
							<View style={styles.actions}>
								<ActionButton
									label={remaining > 0 && ability.durationSeconds ? 'Extend' : 'Use Ability'}
									variant="use"
									onPress={() => {
										const result = attacks.activateAbility(ability.id);
										if (!result.success) Alert.alert('Ability blocked', result.message ?? 'Unable to use this dragon ability.');
									}}
								/>
							</View>
						</View>
					);
				})}
			</View>
		</ScrollView>
	);

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			<View style={styles.pageHeader}>
				<Text style={styles.title}>Market</Text>
				<View style={styles.topTabs}>
					<FilterPill label="Market" selected={marketMode === 'market'} onPress={() => setMarketMode('market')} />
					<FilterPill label="Dragon's Attacks" selected={marketMode === 'dragonAttacks'} onPress={() => setMarketMode('dragonAttacks')} />
					<FilterPill label="Hade's Market" selected={marketMode === 'hadesMarket'} onPress={() => setMarketMode('hadesMarket')} />
					<FilterPill label="Black Market" selected={marketMode === 'blackMarket'} onPress={() => setMarketMode('blackMarket')} />
				</View>
			</View>

			{marketMode === 'market' ? renderMarketMode() : null}
			{marketMode === 'dragonAttacks' ? renderDragonAttacksMode() : null}
			{marketMode === 'blackMarket' ? renderBlackMarketMode() : null}
			{marketMode === 'hadesMarket' ? renderHadesMarketMode() : null}
		</View>
	);
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.summaryCard}>
			<Text style={styles.summaryLabel}>{label}</Text>
			<Text style={[styles.summaryValue, accent ? { color: accent } : null]}>{value}</Text>
		</View>
	);
}

function FilterPill({ label, selected, onPress, compact = false }: { label: string; selected: boolean; onPress: () => void; compact?: boolean }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<Pressable style={[styles.filterButton, compact ? styles.filterButtonCompact : null, selected && styles.filterActive]} onPress={onPress}>
			<Text style={[styles.filterText, selected && styles.filterTextActive]}>{label}</Text>
		</Pressable>
	);
}

function ActionButton({ label, onPress, variant, disabled = false }: { label: string; onPress: () => void; variant: 'buy' | 'use' | 'sell'; disabled?: boolean }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<Pressable style={[styles.actionButton, variant === 'buy' ? styles.buyButton : variant === 'use' ? styles.useButton : styles.sellButton, disabled ? styles.actionDisabled : null]} onPress={onPress} disabled={disabled}>
			<Text style={styles.actionButtonText}>{label}</Text>
		</Pressable>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	pageHeader: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
	title: { fontSize: 24, fontWeight: '800', marginBottom: 12, color: colors.titleText },
	topTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 12 },
	summaryCard: { width: '47%', backgroundColor: colors.secondaryBackground, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
	summaryLabel: { fontSize: 12, color: colors.secondaryText, fontWeight: '600' },
	summaryValue: { fontSize: 20, fontWeight: '800', color: colors.titleText, marginTop: 4 },
	sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, marginBottom: 10 },
	controlLabel: { paddingHorizontal: 12, marginBottom: 6, fontSize: 12, fontWeight: '800', color: colors.headerText },
	filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground },
	filterButtonCompact: { paddingVertical: 7, paddingHorizontal: 10 },
	filterActive: { backgroundColor: colors.buttonBackground, borderColor: colors.buttonBackground },
	filterText: { fontSize: 12, fontWeight: '700', color: colors.text },
	filterTextActive: { color: colors.buttonText },
	list: { paddingBottom: 36, paddingHorizontal: 4 },
	card: { flex: 1, margin: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground },
	cardLocked: { opacity: 0.7, backgroundColor: colors.tertiaryBackground },
	itemName: { fontSize: 16, fontWeight: '800', color: colors.titleText },
	lockBadge: { fontSize: 11, color: colors.tint, marginTop: 4, fontWeight: '700' },
	itemDesc: { fontSize: 12, color: colors.text, marginTop: 8, lineHeight: 18 },
	priceRow: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
	priceText: { fontSize: 11, fontWeight: '700', color: colors.secondaryText },
	priceValue: { fontSize: 13, fontWeight: '700', color: colors.headerText, marginTop: 4 },
	actions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
	actionButton: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'center' },
	buyButton: { backgroundColor: colors.success },
	useButton: { backgroundColor: colors.info },
	sellButton: { backgroundColor: colors.tint },
	actionDisabled: { backgroundColor: colors.border },
	actionButtonText: { color: colors.buttonText, fontWeight: '800' },
	marketNote: { fontSize: 12, color: colors.secondaryText, lineHeight: 18, paddingHorizontal: 12, marginBottom: 12 },
	footerNote: { fontSize: 12, color: colors.secondaryText, lineHeight: 18, paddingHorizontal: 12, paddingTop: 8 },
	scrollContent: { paddingHorizontal: 12, paddingBottom: 36 },
	sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.titleText, marginTop: 8, marginBottom: 12 },
	featureCard: { borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 14, marginBottom: 12 },
	featureHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
	featureTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.titleText },
	featureBadge: { fontSize: 11, fontWeight: '800', color: colors.headerText, backgroundColor: colors.tertiaryBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
	twoColumnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
	twoColumnCell: { width: '50%' },
});
