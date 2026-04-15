import TopHeader from '@/components/TopHeader';
import React from 'react';
import { View } from 'react-native';
import JournalHub from '../../(journal)';

export default function DragonLairPage() {
	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<JournalHub />
		</View>
	);
}
