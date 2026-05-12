import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import ParentProvider from '@/context/ParentProvider';
import { useTheme } from '@/context/ThemeProvider';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: 'landing',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	return (
		<ParentProvider>
			<NavigationThemeBridge />
		</ParentProvider>
	);
}

function NavigationThemeBridge() {
	const colorScheme = useColorScheme();
	const dragonTheme = useTheme();
	const fallbackTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
	const navigationTheme = {
		...fallbackTheme,
		colors: {
			...fallbackTheme.colors,
			background: dragonTheme.colors.background,
			card: dragonTheme.colors.secondaryBackground,
			text: dragonTheme.colors.text,
			border: dragonTheme.colors.border,
			primary: dragonTheme.colors.tint,
			notification: dragonTheme.colors.warning,
		},
	};

	return (
		<ThemeProvider value={navigationTheme}>
			<Stack>
				<Stack.Screen name="landing" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
			</Stack>
		</ThemeProvider>
	);
}
