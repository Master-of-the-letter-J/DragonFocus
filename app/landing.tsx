import { images } from '@/constants';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const FEATURES = [
	{ title: 'Morning Survey', description: 'Plan your habits, to-dos, and focus before the day drifts.' },
	{ title: 'Night Survey', description: 'Lock in goal rewards, journal reflections, and dragon growth.' },
	{ title: 'Market and Lair', description: 'Turn progress into generators, snacks, souls, and ascension power.' },
];

export default function LandingPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const glowA = useRef(new Animated.Value(0)).current;
	const glowB = useRef(new Animated.Value(0)).current;
	const buttonLift = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(glowA, { toValue: 1, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
				Animated.timing(glowA, { toValue: 0, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
			]),
		).start();

		Animated.loop(
			Animated.sequence([
				Animated.timing(glowB, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
				Animated.timing(glowB, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
			]),
		).start();

		Animated.loop(
			Animated.sequence([
				Animated.timing(buttonLift, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
				Animated.timing(buttonLift, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
			]),
		).start();
	}, [buttonLift, glowA, glowB]);

	const handleStartApp = () => {
		setIsLoading(true);
		setTimeout(() => {
			router.replace('/(tabs)/pages/home');
		}, 500);
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<View style={styles.container}>
				<View style={styles.castleBand}>
					{Array.from({ length: 9 }).map((_, index) => (
						<View key={index} style={styles.crenel} />
					))}
				</View>

				<View style={styles.heroPanel}>
					<View style={styles.brandRow}>
						<View style={styles.brandMark}>
							<Text style={styles.brandMarkText}>🐉</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.kicker}>Medieval focus ritual</Text>
							<Text style={styles.title}>Dragon Focus</Text>
						</View>
					</View>

					<Text style={styles.subtitle}>Guide the day. Protect your dragon. Turn consistent surveys into long-term power.</Text>

					<Animated.View
						style={[
							styles.dragonStage,
							{
								opacity: glowA.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
								transform: [{ translateY: glowB.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
							},
						]}>
						<Image source={images.dragon} style={styles.heroDragon} />
					</Animated.View>

					<View style={styles.statusStrip}>
						<Text style={styles.statusTitle}>Spawn sequence</Text>
						<Text style={styles.statusText}>Placeholder intro for now. Final landing and spawn video hooks are ready to swap in later.</Text>
					</View>
				</View>

				<View style={styles.featureList}>
					{FEATURES.map((feature, index) => (
						<View key={feature.title} style={styles.featureCard}>
							<Text style={styles.featureIndex}>0{index + 1}</Text>
							<View style={{ flex: 1 }}>
								<Text style={styles.featureTitle}>{feature.title}</Text>
								<Text style={styles.featureDescription}>{feature.description}</Text>
							</View>
						</View>
					))}
				</View>

				<View style={styles.footer}>
					<Animated.View
						style={{
							transform: [
								{
									translateY: buttonLift.interpolate({
										inputRange: [0, 1],
										outputRange: [0, -4],
									}),
								},
							],
						}}>
						<Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleStartApp} disabled={isLoading}>
							<Text style={styles.buttonText}>{isLoading ? 'Opening Dragon Focus...' : 'Enter the Lair'}</Text>
						</Pressable>
					</Animated.View>

					<Text style={styles.disclaimer}>Morning and night surveys drive your dragon HP, fury, rewards, and ascension progress.</Text>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#111827',
		paddingHorizontal: 20,
		paddingTop: 64,
		paddingBottom: 36,
	},
	castleBand: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 34,
		backgroundColor: '#374151',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'flex-start',
	},
	crenel: {
		width: 24,
		height: 22,
		backgroundColor: '#111827',
	},
	heroPanel: {
		borderRadius: 8,
		padding: 22,
		backgroundColor: '#1F2937',
		borderWidth: 1,
		borderColor: '#B45309',
		marginBottom: 20,
	},
	brandRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		marginBottom: 16,
	},
	brandMark: {
		width: 64,
		height: 64,
		borderRadius: 8,
		backgroundColor: '#7C2D12',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.16)',
	},
	brandMarkText: {
		color: '#FFF7ED',
		fontSize: 28,
		fontWeight: '900',
		letterSpacing: 0,
	},
	kicker: {
		color: '#F59E0B',
		fontSize: 12,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 1.2,
		marginBottom: 4,
	},
	title: {
		color: '#F8FAFC',
		fontSize: 38,
		lineHeight: 42,
		fontWeight: '900',
	},
	subtitle: {
		color: '#D6E3F1',
		fontSize: 16,
		lineHeight: 24,
		marginBottom: 18,
	},
	statusStrip: {
		borderRadius: 8,
		padding: 16,
		backgroundColor: 'rgba(245, 158, 11, 0.12)',
		borderWidth: 1,
		borderColor: 'rgba(245, 158, 11, 0.24)',
	},
	dragonStage: {
		alignItems: 'center',
		marginBottom: 12,
	},
	heroDragon: {
		width: 190,
		height: 150,
		resizeMode: 'contain',
	},
	statusTitle: {
		color: '#FCD34D',
		fontSize: 13,
		fontWeight: '800',
		marginBottom: 4,
	},
	statusText: {
		color: '#F8FAFC',
		fontSize: 13,
		lineHeight: 20,
	},
	featureList: {
		flex: 1,
		gap: 12,
		justifyContent: 'center',
	},
	featureCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		borderRadius: 8,
		padding: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	featureIndex: {
		width: 40,
		color: '#F59E0B',
		fontSize: 18,
		fontWeight: '900',
	},
	featureTitle: {
		color: '#F8FAFC',
		fontSize: 17,
		fontWeight: '800',
		marginBottom: 4,
	},
	featureDescription: {
		color: '#CAD5E2',
		fontSize: 13,
		lineHeight: 20,
	},
	footer: {
		marginTop: 18,
	},
	button: {
		backgroundColor: '#D97706',
		paddingVertical: 18,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	buttonDisabled: {
		opacity: 0.72,
	},
	buttonText: {
		color: '#FFF7ED',
		fontSize: 18,
		fontWeight: '900',
	},
	disclaimer: {
		textAlign: 'center',
		fontSize: 12,
		lineHeight: 18,
		color: '#94A3B8',
		marginTop: 12,
	},
});
