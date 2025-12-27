import TopHeader from '@/components/TopHeader';
import { useDragonAlarm } from '@/context/DragonAlarmProvider';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Alarms() {
	const alarms = useDragonAlarm();
	const [show, setShow] = useState(false);
	const [time, setTime] = useState('07:00');

	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<Text style={styles.header}>⏰ Alarms</Text>
			<ScrollView contentContainerStyle={{ padding: 12 }}>
				{alarms.alarms.map(a => (
					<View key={a.id} style={styles.row}>
						<Text style={{ fontWeight: '700' }}>{a.label || a.times.join(', ')}</Text>
						<Pressable onPress={() => alarms.toggleAlarm(a.id, !a.enabled)} style={styles.toggle}>
							<Text>{a.enabled ? '🔔 On' : '🔕 Off'}</Text>
						</Pressable>
					</View>
				))}

				{!show ? (
					<Pressable style={styles.add} onPress={() => setShow(true)}>
						<Text>+ Add Alarm</Text>
					</Pressable>
				) : (
					<View style={{ marginTop: 8 }}>
						<TextInput value={time} onChangeText={setTime} style={styles.input} />
						<Pressable
							style={styles.add}
							onPress={() => {
								alarms.addAlarm(time);
								setShow(false);
							}}>
							<Text>Add</Text>
						</Pressable>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({ header: { fontSize: 18, fontWeight: '700', padding: 12 }, row: { padding: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, toggle: { padding: 8 }, add: { marginTop: 12, padding: 10, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' }, input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6 } });
