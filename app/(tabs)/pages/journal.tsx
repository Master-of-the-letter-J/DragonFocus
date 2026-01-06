// screens/DragonLair.tsx

// journal hub will import needed providers internally

import TopHeader from '@/components/TopHeader';
import React from 'react';
import { View } from 'react-native';
import JournalHub from '../../(journal)';

export default function DragonLair() {
	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<JournalHub />
		</View>
	);
}
// styles removed — journal hub provides its own styling
