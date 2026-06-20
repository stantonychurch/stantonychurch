import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { getEvents } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { DrawerContext } from './_layout';
import { useLanguage } from '../../src/context/LanguageContext';

export default function EventsScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await getEvents();
      setEvents(res.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}><View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('church_events_title')}</Text>
          <Text style={styles.subtitle}>{t('church_events_subtitle')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {events.map(ev => {
          const d = new Date(ev.event_date);
          const isUpcoming = d >= new Date();
          return (
            <View key={ev.id} style={[styles.card, isUpcoming && styles.upcomingCard]}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{d.getDate()}</Text>
                <Text style={styles.dateMonth}>{d.toLocaleString('default', { month: 'short' })}</Text>
                <Text style={styles.dateYear}>{d.getFullYear()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.eventTitle}>{lang === 'ta' && ev.title_tamil ? ev.title_tamil : ev.title}</Text>
                <Text style={styles.eventMeta}>
                  {ev.event_time ? `🕐 ${ev.event_time}  ` : ''}
                  {ev.location ? `📍 ${ev.location}` : ''}
                </Text>
                {ev.description ? <Text style={styles.eventDesc}>{lang === 'ta' && ev.description_tamil ? ev.description_tamil : ev.description}</Text> : null}
                {isUpcoming && <Text style={styles.upcomingBadge}>{t('upcoming')}</Text>}
              </View>
            </View>
          );
        })}
        {!loading && events.length === 0 && <Text style={styles.empty}>{t('no_events')}</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  menuBtn: { padding: 4, marginRight: 2 },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  list: { padding: Spacing.md },
  card: { flexDirection: 'row', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12, gap: 12 },
  upcomingCard: { borderColor: 'rgba(200,153,26,0.4)' },
  dateBox: { backgroundColor: Colors.gold, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 56 },
  dateDay: { fontSize: 22, fontWeight: '900', color: Colors.dark },
  dateMonth: { fontSize: 10, fontWeight: '700', color: Colors.dark, textTransform: 'uppercase' },
  dateYear: { fontSize: 10, color: 'rgba(13,10,6,0.7)', marginTop: 2 },
  info: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  eventMeta: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  eventDesc: { fontSize: 13, color: Colors.textDim, lineHeight: 20 },
  upcomingBadge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(200,153,26,0.15)', borderWidth: 1, borderColor: 'rgba(200,153,26,0.3)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, fontSize: 11, color: Colors.gold, fontWeight: '700' },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
});
