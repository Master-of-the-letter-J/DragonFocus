import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartApp = () => {
    setIsLoading(true);
    // Simulate a short loading period
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 500);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🐉 DragonFocus</Text>
          <Text style={styles.subtitle}>Master Your Focus, Grow Your Dragon</Text>
        </View>

        {/* Feature List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Track Daily Surveys</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🐲</Text>
            <Text style={styles.featureText}>Raise Your Dragon</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>Unlock Achievements</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Earn Dragon Coins</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>Build Your Streak</Text>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleStartApp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : 'Start Your Journey'}
            </Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Your first dragon awaits...
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
  },
});
