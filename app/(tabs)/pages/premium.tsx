import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

type PremiumPlan = 'monthly' | 'yearly' | 'permanent';

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
				<Text style={styles.subtitle}>Dragon Pact uses the current launch pricing: simple monthly access, a low yearly option, or a one-time permanent unlock.</Text>

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
							<Text style={styles.planName}>Monthly</Text>
							<Text style={styles.planBadge}>Flexible</Text>
						</View>
						<Text style={styles.planPrice}>
							$1.99<Text style={styles.planDuration}>/month</Text>
						</Text>
						<Text style={styles.planSubtext}>A flexible pact for trying premium progression, extra rerolls, and expanded goal capacity month to month.</Text>
						<Pressable style={styles.subscribeButton} onPress={() => handleSubscribe('monthly')}>
							<Text style={styles.subscribeText}>Subscribe Monthly</Text>
						</Pressable>
					</View>

					<View style={[styles.planCard, styles.yearlyCard]}>
						<View style={styles.planHeader}>
							<Text style={[styles.planName, styles.yearlyName]}>Yearly</Text>
							<Text style={[styles.planBadge, styles.yearlyBadge]}>Launch Special</Text>
						</View>
						<Text style={[styles.planPrice, styles.yearlyPrice]}>
							$4.99<Text style={styles.planDuration}>/year</Text>
						</Text>
						<Text style={[styles.planSubtext, styles.yearlySubtext]}>The best short-term value while launch pricing is active.</Text>
						<Pressable style={[styles.subscribeButton, styles.yearlyButton]} onPress={() => handleSubscribe('yearly')}>
							<Text style={[styles.subscribeText, styles.yearlySubscribeText]}>Subscribe Yearly</Text>
						</Pressable>
					</View>

					<View style={[styles.planCard, styles.permanentCard]}>
						<View style={styles.planHeader}>
							<Text style={[styles.planName, styles.permanentName]}>Permanent</Text>
							<Text style={[styles.planBadge, styles.permanentBadge]}>Best Value</Text>
						</View>
						<Text style={[styles.planPrice, styles.permanentPrice]}>
							$9.99<Text style={styles.planDuration}> once</Text>
						</Text>
						<Text style={[styles.planSubtext, styles.permanentSubtext]}>Pay once for permanent Dragon Pact access at the current launch-special permanent price.</Text>
						<Pressable style={[styles.subscribeButton, styles.permanentButton]} onPress={() => handleSubscribe('permanent')}>
							<Text style={[styles.subscribeText, styles.permanentSubscribeText]}>Buy Permanent</Text>
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
						<Text style={styles.faqQuestion}>What happens when these buttons are pressed right now?</Text>
						<Text style={styles.faqAnswer}>Real billing still needs to be wired up. The pricing and layout are ready, but checkout is still placeholder-only.</Text>
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
	permanentCard: {
		borderColor: '#C2410C',
		backgroundColor: '#FFF7ED',
		borderWidth: 3,
	},
	permanentName: {
		color: '#9A3412',
	},
	permanentBadge: {
		backgroundColor: '#C2410C',
		color: '#fff',
	},
	permanentPrice: {
		color: '#9A3412',
	},
	permanentSubtext: {
		color: '#9A3412',
		fontWeight: '600',
	},
	subscribeButton: {
		backgroundColor: '#4caf50',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	yearlyButton: {
		backgroundColor: '#2e7d32',
	},
	permanentButton: {
		backgroundColor: '#C2410C',
	},
	subscribeText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '700',
	},
	yearlySubscribeText: {
		color: '#fff',
	},
	permanentSubscribeText: {
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
