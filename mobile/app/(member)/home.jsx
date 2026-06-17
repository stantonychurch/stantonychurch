import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { getVerses, getEvents, getAnnouncements, getDevotionals } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { DrawerContext } from './_layout';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { toggleDrawer } = useContext(DrawerContext);
  const [verse, setVerse] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [devotionals, setDevotionals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nextEventCountdown, setNextEventCountdown] = useState(null);
  const [countdownText, setCountdownText] = useState('');

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? t('good_morning') : h < 17 ? t('good_afternoon') : t('good_evening');
  };

  async function loadData() {
    try {
      const [v, e, a, d] = await Promise.allSettled([
        getVerses(), getEvents(), getAnnouncements(), getDevotionals()
      ]);
      if (v.status === 'fulfilled' && v.value.data?.length) setVerse(v.value.data[0]);
      if (e.status === 'fulfilled') {
        const evs = e.value.data || [];
        setEvents(evs.slice(0, 3));
        const upcoming = evs.filter(ev => new Date(ev.event_date) > new Date()).sort((a,b) => new Date(a.event_date) - new Date(b.event_date));
        if (upcoming.length > 0) setNextEventCountdown(upcoming[0]);
      }
      if (a.status === 'fulfilled') setAnnouncements(a.value.data?.slice(0, 3) || []);
      if (d.status === 'fulfilled') setDevotionals(d.value.data?.slice(0, 2) || []);
    } catch (_) {}
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    let timer;
    if (nextEventCountdown) {
      const eventDate = new Date(nextEventCountdown.event_date).getTime();
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = eventDate - now;
        if (distance < 0) {
          setCountdownText('Event Started!');
          clearInterval(timer);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdownText(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [nextEventCountdown]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const lang = user?.language || 'en';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>☰</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'Member'} 🙏</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <TouchableOpacity onPress={() => alert('No new notifications')}>
            <Text style={{fontSize: 24}}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        {/* Next Event Countdown */}
        {nextEventCountdown && (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>⏳ {t('next_event')}: {nextEventCountdown.title.toUpperCase()}</Text>
            <Text style={styles.countdownValue}>{countdownText}</Text>
          </View>
        )}

        {/* Today's Verse */}
        {verse && (
          <View style={styles.verseCard}>
            <Text style={styles.verseCardLabel}>📜 {t('todays_verse')}</Text>
            <Text style={styles.verseText}>
              "{lang === 'ta' && verse.verse_tamil ? verse.verse_tamil : verse.verse}"
            </Text>
            <Text style={styles.verseRef}>— {verse.reference}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>{t('quick_access')}</Text>
        <View style={styles.quickGrid}>
          {[
            { label: t('devotionals'), icon: '📖', route: '/(member)/devotional' },
            { label: t('prayer_wall'), icon: '🙏', route: '/(member)/prayer' },
            { label: t('videos_sermons'), icon: '🎬', route: '/(member)/videos' },
            { label: t('worship_songs'), icon: '🎵', route: '/(member)/worship' },
            { label: t('galleries'), icon: '🖼️', route: '/(member)/galleries' },
            { label: t('family_group'), icon: '👨‍👩‍👧', route: '/(member)/family' },
            { label: t('youth_group'), icon: '🔥', route: '/(member)/youth' },
            { label: t('faith_journal'), icon: '📝', route: '/(member)/journal' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickCard} onPress={() => router.push(item.route)}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements */}
        {announcements.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>📢 {t('announcements')}</Text>
            {announcements.map(a => (
              <View key={a.id} style={[styles.announceCard, !!a.is_emergency && styles.emergencyCard]}>
                {!!a.is_emergency && <Text style={styles.emergencyBadge}>🚨 {t('emergency')}</Text>}
                <Text style={styles.announceTitle}>
                  {lang === 'ta' && a.title_tamil ? a.title_tamil : a.title}
                </Text>
                <Text style={styles.announceContent} numberOfLines={2}>
                  {lang === 'ta' && a.content_tamil ? a.content_tamil : a.content}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>📅 UPCOMING EVENTS</Text>
              <TouchableOpacity onPress={() => router.push('/(member)/events')}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {events.map(ev => {
              const d = new Date(ev.event_date);
              return (
                <View key={ev.id} style={styles.eventCard}>
                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDay}>{d.getDate()}</Text>
                    <Text style={styles.eventMonth}>{d.toLocaleString('default', { month: 'short' })}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <Text style={styles.eventMeta}>🕐 {ev.event_time || 'TBA'}  📍 {ev.location || 'Church'}</Text>
                    {ev.description ? <Text style={styles.eventDesc} numberOfLines={2}>{ev.description}</Text> : null}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Latest Devotionals */}
        {devotionals.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>✝️ DEVOTIONALS</Text>
              <TouchableOpacity onPress={() => router.push('/(member)/devotional')}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {devotionals.map(d => (
              <View key={d.id} style={styles.devCard}>
                <Text style={styles.devTitle}>{lang === 'ta' && d.title_tamil ? d.title_tamil : d.title}</Text>
                <Text style={styles.devContent} numberOfLines={3}>
                  {lang === 'ta' && d.content_tamil ? d.content_tamil : d.content}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  menuBtn: { padding: 4, marginRight: 2 },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  greeting: { fontSize: 12, color: Colors.textMuted },
  userName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  logoutBtn: { backgroundColor: 'rgba(231,76,60,0.12)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  logoutText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  countdownCard: { backgroundColor: '#1a1a2e', padding: 15, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.gold, alignItems: 'center' },
  countdownLabel: { color: Colors.gold, fontSize: 11, fontWeight: '700', marginBottom: 5 },
  countdownValue: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1.5, fontVariant: ['tabular-nums'] },
  verseCard: { backgroundColor: 'rgba(200,153,26,0.1)', borderWidth: 1, borderColor: 'rgba(200,153,26,0.3)', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  verseCardLabel: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 0.5, marginBottom: 6 },
  verseText: { fontSize: 15, color: Colors.text, fontStyle: 'italic', lineHeight: 24, marginBottom: 8 },
  verseRef: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 1.2, marginBottom: 10, marginTop: 6 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 6 },
  seeAll: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.md },
  quickCard: { width: '30%', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', minWidth: 90 },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  announceCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10 },
  emergencyCard: { borderColor: 'rgba(231,76,60,0.5)', backgroundColor: 'rgba(231,76,60,0.08)' },
  emergencyBadge: { fontSize: 11, color: Colors.error, fontWeight: '700', marginBottom: 4 },
  announceTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  announceContent: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  eventCard: { flexDirection: 'row', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10, gap: 12 },
  eventDateBox: { backgroundColor: Colors.gold, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 52 },
  eventDay: { fontSize: 20, fontWeight: '900', color: Colors.dark },
  eventMonth: { fontSize: 10, fontWeight: '700', color: Colors.dark, textTransform: 'uppercase' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  eventMeta: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  eventDesc: { fontSize: 12, color: Colors.textDim, lineHeight: 18 },
  devCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10 },
  devTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  devContent: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
});
