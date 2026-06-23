import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useTheme } from '@/context/ThemeProvider';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
	return <FontAwesome size={25} style={{ marginBottom: 2 }} {...props} />;
}

export default function TabLayout() {
	const theme = useTheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: theme.colors.tabIconSelected,
				tabBarInactiveTintColor: theme.colors.tabIconDefault,
				tabBarStyle: {
					backgroundColor: theme.colors.secondaryBackground,
					borderTopColor: theme.colors.border,
				},
				headerStyle: { backgroundColor: theme.colors.secondaryBackground },
				headerTintColor: theme.colors.headerText,
				headerShown: useClientOnlyValue(false, true),
			}}>
			<Tabs.Screen
				name="pages/hatchery"
				options={{
					title: 'Hatchery',
					tabBarIcon: ({ color }) => <TabBarIcon name="fire" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="pages/world"
				options={{
					title: 'World',
					tabBarIcon: ({ color }) => <TabBarIcon name="globe" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="pages/archives"
				options={{
					title: 'Archives',
					tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="pages/options"
				options={{
					title: 'Options',
					tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
				}}
			/>
			{['index', 'pages/home', 'pages/market', 'pages/journal', 'pages/goals', 'pages/premium', 'pages/settings'].map(name => (
				<Tabs.Screen key={name} name={name} options={{ href: null }} />
			))}
		</Tabs>
	);
}
