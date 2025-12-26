import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export default function PremiumPage() {
	const scarLevel = useScarLevel();

	const handleSubscribe = (plan: 'monthly' | 'yearly' | 'trial') => {
		// TODO: Integrate with payment provider (Stripe, RevenueCat, etc.)
		alert(`Subscribe to ${plan} plan`);
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<Text style={styles.title}>🐉 Dragon Pact</Text>
				<Text style={styles.subtitle}>Unlock exclusive benefits and accelerate your dragon's growth</Text>

				<View style={styles.benefitsSection}>
					<Text style={styles.sectionTitle}>Premium Benefits</Text>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>💰</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>2x Coin Multiplier</Text>
							<Text style={styles.benefitDesc}>Double your coin earnings on top of scar level multipliers</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>🔥</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>2x Fire XP Multiplier</Text>
							<Text style={styles.benefitDesc}>Unlock scar levels twice as fast</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>♾️</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>Unlimited To-Do Goals</Text>
							<Text style={styles.benefitDesc}>No limit on active to-do goals (normally {5 + scarLevel.currentScarLevel})</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>🎨</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>Premium Cosmetics</Text>
							<Text style={styles.benefitDesc}>Access exclusive dragon cosmetics and skins</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>🎯</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>Re-Roll Challenge Goals</Text>
							<Text style={styles.benefitDesc}>Change challenge goals if you don't like them</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>👑</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>Scar Level 10 Unlocks</Text>
							<Text style={styles.benefitDesc}>Get all scar level 10 features without reaching it (except cosmetics)</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>📊</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>Premium Table</Text>
							<Text style={styles.benefitDesc}>Enhanced stats table with more detailed analytics</Text>
						</View>
					</View>

					<View style={styles.benefitItem}>
						<Text style={styles.benefitIcon}>🌌</Text>
						<View style={styles.benefitContent}>
							<Text style={styles.benefitTitle}>Premium Background</Text>
							<Text style={styles.benefitDesc}>Exclusive premium app background theme</Text>
						</View>
					</View>
				</View>

				<View style={styles.pricingSection}>
					<Text style={styles.sectionTitle}>Choose Your Plan</Text>

					<View style={styles.planCard}>
						<View style={styles.planHeader}>
							<Text style={styles.planName}>Free Trial</Text>
							<Text style={styles.planBadge}>3 Days</Text>
						</View>
						<Text style={styles.planPrice}>Free</Text>
						<Text style={styles.planSubtext}>Try all premium features risk-free</Text>
						<Pressable style={[styles.subscribeButton, styles.trialButton]} onPress={() => handleSubscribe('trial')}>
							<Text style={[styles.subscribeText, styles.trialText]}>Start Free Trial</Text>
						</Pressable>
					</View>

					<View style={styles.planCard}>
						<View style={styles.planHeader}>
							<Text style={styles.planName}>Monthly</Text>
							<Text style={styles.planBadge}>Best for Testing</Text>
						</View>
						<Text style={styles.planPrice}>
							$1.99<Text style={styles.planDuration}>/month</Text>
						</Text>
						<Text style={styles.planSubtext}>Cancel anytime, no commitment</Text>
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
						<Text style={[styles.planSubtext, styles.yearlySubtext]}>Save 58% vs monthly</Text>
						<Pressable style={[styles.subscribeButton, styles.yearlyButton]} onPress={() => handleSubscribe('yearly')}>
							<Text style={[styles.subscribeText, styles.yearlySubscribeText]}>Subscribe Yearly</Text>
						</Pressable>
					</View>
				</View>

				<View style={styles.faqSection}>
					<Text style={styles.sectionTitle}>FAQ</Text>

					<View style={styles.faqItem}>
						<Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
						<Text style={styles.faqAnswer}>Yes, cancel your subscription at any time. Your premium benefits will remain active until the end of your billing period.</Text>
					</View>

					<View style={styles.faqItem}>
						<Text style={styles.faqQuestion}>What happens after the 3-day trial?</Text>
						<Text style={styles.faqAnswer}>You'll be charged for your chosen plan (monthly or yearly) unless you cancel before the trial ends.</Text>
					</View>

					<View style={styles.faqItem}>
						<Text style={styles.faqQuestion}>Do I lose progress if I cancel?</Text>
						<Text style={styles.faqAnswer}>No, your dragon and all progress are saved. You'll just lose access to premium features.</Text>
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
	},
	benefitIcon: {
		fontSize: 32,
		marginRight: 12,
		width: 40,
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
		borderColor: '#4CAF50',
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
		backgroundColor: '#4CAF50',
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
	},
	yearlySubtext: {
		color: '#4CAF50',
		fontWeight: '600',
	},
	subscribeButton: {
		backgroundColor: '#4CAF50',
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
