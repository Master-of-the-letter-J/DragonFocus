import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Achievements from './achievements';
import Alarms from './alarms';
import Graveyard from './graveyard';
import ListView from './listView';
import TableView from './tableView';

export default function JournalHub() {
	const [tab, setTab] = useState<'table' | 'list' | 'alarms' | 'achievements' | 'graveyard'>('table');

	const render = () => {
		if (tab === 'table') return <TableView />;
		if (tab === 'list') return <ListView />;
		if (tab === 'alarms') return <Alarms />;
		if (tab === 'achievements') return <Achievements />;
		return <Graveyard />;
	};

	return (
		<View style={{ flex: 1 }}>
			{/* Top segmented tabs */}
			<View style={styles.topTabs}>
				<Pressable style={[styles.tabBtn, tab === 'table' && styles.tabActive]} onPress={() => setTab('table')}>
					<Text>📊 Table</Text>
				</Pressable>
				<Pressable style={[styles.tabBtn, tab === 'list' && styles.tabActive]} onPress={() => setTab('list')}>
					<Text>📚 List</Text>
				</Pressable>
				<Pressable style={[styles.tabBtn, tab === 'alarms' && styles.tabActive]} onPress={() => setTab('alarms')}>
					<Text>⏰ Alarms</Text>
				</Pressable>
				<Pressable style={[styles.tabBtn, tab === 'achievements' && styles.tabActive]} onPress={() => setTab('achievements')}>
					<Text>🏆 Achievements</Text>
				</Pressable>
				<Pressable style={[styles.tabBtn, tab === 'graveyard' && styles.tabActive]} onPress={() => setTab('graveyard')}>
					<Text>🪦 Graveyard</Text>
				</Pressable>
			</View>

			{/* Content */}
			<View style={{ flex: 1 }}>{render()}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	topTabs: { flexDirection: 'row', padding: 8, justifyContent: 'space-between', backgroundColor: '#fafafa' },
	tabBtn: { padding: 8, borderRadius: 8 },
	tabActive: { backgroundColor: '#e6f4ea' },
	bottomTabs: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, borderTopWidth: 1, borderColor: '#eee' },
	bottomBtn: { padding: 6 },
});
