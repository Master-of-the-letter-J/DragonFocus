import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

type PremiumPlan = 'trial' | 'monthly' | 'yearly';

const BENEFITS = [
	{
		label: '2x',
		title: '2x Coin Multiplier',
		description: 'Double your coin earnings on top of scar level multipliers.',
	},
	{
		label: 'XP',
		title: '2x Fire XP Multiplier',
		description: 'Reach new scar tiers much faster while keeping your existing progression.',
	},
	{
		label: 'TODO',
		title: 'Unlimited To-Do Goals',
		description: 'Ignore the normal active to-do cap and keep as many goals open as you want.',
	},
	{
		label: 'LOOK',
		title: 'Premium Cosmetics',
		description: 'Unlock extra visual rewards, premium skins, and future theme drops.',
	},
	{
		label: 'REROLL',
		title: 'Unlimited Goal Rerolls',
		description: 'Skip the standard reroll cap for suggested habits and to-do templates.',
	},
	{
		label: 'EARLY',
		title: 'Premium Early Unlocks',
		description: 'Get premium quality-of-life unlocks early without waiting for later scar tiers.',
	},
	{
		label: 'LOGS',
		title: 'Expanded Logs',
		description: 'Access richer stat views and more detailed history panels as premium features grow.',
	},
	{
		label: 'SKY',
		title: 'Premium Background',
		description: 'Use the premium background set and future premium visual themes.',
	},
] as const;

export default function PremiumPage() {
	const scarLevel = useScarLevel();
	const standardTodoLimit = 40 + Math.max(0, scarLevel.currentScarLevel) * 6;

	const handleSubscribe = (plan: PremiumPlan) => {
		Alert.alert('Premium Dragon Pact', `Subscribe to the ${plan} plan. Billing is still a placeholder for now.`);
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>Dragon Pact</Text>
				<Text style={styles.subtitle}>Premium perks for faster progression, more flexibility, and future cosmetic rewards.</Text>

				<View style={styles.benefitsSection}>
					<Text style={styles.sectionTitle}>Premium Benefits</Text>

					{BENEFITS.map((benefit) => (
						<View key={benefit.title} style={styles.benefitItem}>
							<View style={styles.benefitBadge}>
								<Text style={styles.benefitBadgeText}>{benefit.label}</Text>
							</View>
							<View style={styles.benefitContent}>
								<Text style={styles.benefitTitle}>{benefit.title}</Text>
								<Text style={styles.benefitDesc}>
									{benefit.title === 'Unlimited To-Do Goals'
										? `No limit on active to-do goals. Standard accounts currently cap at ${standardTodoLimit}.`
										: benefit.description}
								</Text>
							</View>
						</View>
					))}
				</View>

				<View style={styles.pricingSection}>
					<Text style={styles.sectionTitle}>Choose Your Plan</Text>

					<View style={styles.planCard}>
						<View style={styles.planHeader}>
							<Text style={styles.planName}>Free Trial</Text>
							<Text style={styles.planBadge}>3 Days</Text>
						</View>
						<Text style={styles.planPrice}>Free</Text>
						<Text style={styles.planSubtext}>Try the premium toolset before subscribing.</Text>
						<Pressable style={[styles.subscribeButton, styles.trialButton]} onPress={() => handleSubscribe('trial')}>
							<Text style={[styles.subscribeText, styles.trialText]}>Start Free Trial</Text>
						</Pressable>
					</View>

					<View style={styles.planCard}>
						<View style={styles.planHeader}>
							<Text style={styles.planName}>Monthly</Text>
							<Text style={styles.planBadge}>Flexible</Text>
						</View>
						<Text style={styles.planPrice}>
							$1.99<Text style={styles.planDuration}>/month</Text>
						</Text>
						<Text style={styles.planSubtext}>Good for testing premium without a longer commitment.</Text>
						<Pressable style={styles.subscribeButton} onPress={() => handleSubscribe('monthly')}>
							<Text style={styles.subscribeText}>Subscribe Monthly</Text>
						</Pressable>
					</View>

					<View style={[styles.planCard, styles.yearlyCard]}>
						<View style={styles.planHeader}>
							<Text style={[styles.planName, styles.yearlyName]}>Yearly</Text>
							<Text style={[styles.planBadge, styles.yearlyBadge]}>Best Value</Text>
						</View>
						<Text style={[styles.planPrice, styles.yearlyPrice]}>
							$9.99<Text style={styles.planDuration}>/year</Text>
						</Text>
						<Text style={[styles.planSubtext, styles.yearlySubtext]}>The lowest recurring price and the clearest long-term value.</Text>
						<Pressable style={[styles.subscribeButton, styles.yearlyButton]} onPress={() => handleSubscribe('yearly')}>
							<Text style={[styles.subscribeText, styles.yearlySubscribeText]}>Subscribe Yearly</Text>
						</Pressable>
					</View>
				</View>

				<View style={styles.faqSection}>
					<Text style={styles.sectionTitle}>FAQ</Text>

					<View style={styles.faqItem}>
						<Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
						<Text style={styles.faqAnswer}>Yes. Premium access would stay active until the end of the current billing period.</Text>
					</View>

					<View style={styles.faqItem}>
						<Text style={styles.faqQuestion}>What happens after the 3-day trial?</Text>
						<Text style={styles.faqAnswer}>The app will need real billing wired in first. For now, the premium buttons stay placeholder actions.</Text>
					</View>

					<View style={styles.faqItem}>
						<Text style={styles.faqQuestion}>Do I lose progress if I cancel?</Text>
						<Text style={styles.faqAnswer}>No. Your dragon, goals, and progression stay saved. You would only lose premium-only perks.</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollContent: {
		paddingHorizontal: 16,
		paddingVertical: 24,
		paddingBottom: 40,
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		textAlign: 'center',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		textAlign: 'center',
		color: '#666',
		marginBottom: 32,
		lineHeight: 20,
	},
	benefitsSection: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 16,
	},
	benefitItem: {
		flexDirection: 'row',
		marginBottom: 16,
		paddingHorizontal: 12,
		alignItems: 'center',
	},
	benefitBadge: {
		width: 54,
		height: 54,
		borderRadius: 14,
		backgroundColor: '#1f2937',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	benefitBadgeText: {
		color: '#fff',
		fontSize: 11,
		fontWeight: '800',
		textAlign: 'center',
	},
	benefitContent: {
		flex: 1,
	},
	benefitTitle: {
		fontSize: 16,
		fontWeight: '700',
		marginBottom: 4,
	},
	benefitDesc: {
		fontSize: 13,
		color: '#666',
		lineHeight: 18,
	},
	pricingSection: {
		marginBottom: 32,
	},
	planCard: {
		borderWidth: 2,
		borderColor: '#e0e0e0',
		borderRadius: 12,
		padding: 20,
		marginBottom: 12,
		backgroundColor: '#f9f9f9',
	},
	yearlyCard: {
		borderColor: '#4caf50',
		backgroundColor: '#f1f8f4',
		borderWidth: 3,
	},
	planHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	planName: {
		fontSize: 18,
		fontWeight: '700',
	},
	yearlyName: {
		color: '#2e7d32',
	},
	planBadge: {
		fontSize: 11,
		fontWeight: '600',
		backgroundColor: '#e0e0e0',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	yearlyBadge: {
		backgroundColor: '#4caf50',
		color: '#fff',
	},
	planPrice: {
		fontSize: 32,
		fontWeight: '800',
		marginBottom: 4,
	},
	yearlyPrice: {
		color: '#2e7d32',
	},
	planDuration: {
		fontSize: 16,
		fontWeight: '500',
	},
	planSubtext: {
		fontSize: 12,
		color: '#888',
		marginBottom: 16,
		lineHeight: 18,
	},
	yearlySubtext: {
		color: '#4caf50',
		fontWeight: '600',
	},
	subscribeButton: {
		backgroundColor: '#4caf50',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	trialButton: {
		backgroundColor: '#f0f0f0',
	},
	yearlyButton: {
		backgroundColor: '#2e7d32',
	},
	subscribeText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '700',
	},
	trialText: {
		color: '#333',
	},
	yearlySubscribeText: {
		color: '#fff',
	},
	faqSection: {
		marginTop: 16,
	},
	faqItem: {
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	faqQuestion: {
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 8,
	},
	faqAnswer: {
		fontSize: 13,
		color: '#666',
		lineHeight: 20,
	},
});
