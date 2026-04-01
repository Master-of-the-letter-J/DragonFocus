import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Achievements from './achievements';
import AscensionPage from './ascension';
import Graveyard from './graveyard';
import ListView from './listView';
import TableView from './tableView';

type JournalTab = 'table' | 'list' | 'achievements' | 'graveyard' | 'ascension';

export default function JournalHub() {
	const [tab, setTab] = useState<JournalTab>('table');

	const render = () => {
		if (tab === 'table') return <TableView />;
		if (tab === 'list') return <ListView />;
		if (tab === 'achievements') return <Achievements />;
		if (tab === 'graveyard') return <Graveyard />;
		return <AscensionPage />;
	};

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.topTabs}>
				{([
					{ key: 'table', label: 'Table' },
					{ key: 'list', label: 'List' },
					{ key: 'achievements', label: 'Achievements' },
					{ key: 'graveyard', label: 'Graveyard' },
					{ key: 'ascension', label: 'Ascension' },
				] as { key: JournalTab; label: string }[]).map(item => (
					<Pressable key={item.key} style={[styles.tabBtn, tab === item.key && styles.tabActive]} onPress={() => setTab(item.key)}>
						<Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>{item.label}</Text>
					</Pressable>
				))}
			</View>

			<View style={{ flex: 1 }}>{render()}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	topTabs: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8, justifyContent: 'center', backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#eee' },
	tabBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
	tabActive: { backgroundColor: '#e6f4ea', borderColor: '#4CAF50' },
	tabText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
	tabTextActive: { color: '#166534' },
});
