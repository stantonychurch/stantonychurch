import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContext } from './_layout';
import { getPlatform, postPlatform } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useLanguage } from '../../src/context/LanguageContext';

export default function MoreScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  
  // Section state: null (menu), 'fasting', 'reading', 'services', 'podcasts'
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fasting form
  const [fastingPurpose, setFastingPurpose] = useState('');
  const [fastingNotes, setFastingNotes] = useState('');
  const [fastingStarting, setFastingStarting] = useState(false);

  async function loadSectionData(sec) {
    setLoading(true);
    try {
      let res;
      if (sec === 'fasting') {
        res = await getPlatform(`/fasting/${user?.id}`);
      } else if (sec === 'reading') {
        res = await getPlatform('/reading-plans');
      } else if (sec === 'services') {
        res = await getPlatform('/service-schedules');
      } else if (sec === 'podcasts') {
        res = await getPlatform('/podcasts');
      }
      setData(res?.data || []);
    } catch (_) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSectionSelect(sec) {
    setActiveSection(sec);
    if (sec) {
      loadSectionData(sec);
    }
  }

  async function handleStartFasting() {
    if (!fastingPurpose.trim()) return;
    setFastingStarting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await postPlatform('/fasting', {
        start_date: today,
        purpose: fastingPurpose.trim(),
        notes: fastingNotes.trim()
      });
      setFastingPurpose('');
      setFastingNotes('');
      await loadSectionData('fasting');
    } catch (_) {} finally {
      setFastingStarting(false);
    }
  }

  const menuItems = [
    { key: 'reading', title: t('reading'), desc: t('reading_desc') },
    { key: 'fasting', title: t('fasting'), desc: t('fasting_desc') },
    { key: 'services', title: t('services'), desc: t('services_desc') },
    { key: 'podcasts', title: t('podcasts'), desc: t('podcasts_desc') },
  ];

  if (activeSection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => handleSectionSelect(null)} style={styles.backBtnSmall}>
            <Text style={styles.backTextSmall}>{t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {activeSection === 'reading' && t('reading_plans')}
            {activeSection === 'fasting' && t('fasting')}
            {activeSection === 'services' && t('services')}
            {activeSection === 'podcasts' && t('podcasts')}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.gold} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.sectionContainer}>
            {/* READING PLANS SECTION */}
            {activeSection === 'reading' && (
              <View>
                {data.map(plan => (
                  <View key={plan.id} style={styles.planCard}>
                    <Text style={styles.planDuration}>{plan.duration_days} {t('day_plan')} ({plan.language === 'ta' ? t('tamil') : t('english')})</Text>
                    <Text style={styles.planTitle}>{lang === 'ta' && plan.title_tamil ? plan.title_tamil : plan.title}</Text>
                    {plan.description || plan.description_tamil ? <Text style={styles.planDesc}>{lang === 'ta' && plan.description_tamil ? plan.description_tamil : plan.description}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_reading_plans')}</Text>}
              </View>
            )}

            {/* FASTING TRACKER SECTION */}
            {activeSection === 'fasting' && (
              <View>
                <View style={styles.composeCard}>
                  <Text style={styles.composeTitle}>{t('log_a_fast')}</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder={t('fasting_purpose')} 
                    placeholderTextColor="#888"
                    value={fastingPurpose}
                    onChangeText={setFastingPurpose}
                  />
                  <TextInput 
                    style={[styles.input, { height: 70 }]} 
                    placeholder={t('notes_optional')} 
                    placeholderTextColor="#888"
                    multiline
                    value={fastingNotes}
                    onChangeText={setFastingNotes}
                  />
                  <TouchableOpacity 
                    style={[styles.saveBtn, !fastingPurpose.trim() && styles.saveBtnDisabled]}
                    onPress={handleStartFasting}
                    disabled={!fastingPurpose.trim() || fastingStarting}
                  >
                    {fastingStarting ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.saveBtnText}>{t('log_fast_btn')}</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>{t('your_fasting_log')}</Text>
                {data.map(fast => (
                  <View key={fast.id} style={styles.fastCard}>
                    <View style={styles.fastHeader}>
                      <Text style={styles.fastDate}>🗓️ {fast.start_date}</Text>
                      {fast.end_date ? <Text style={styles.fastDate}>to {fast.end_date}</Text> : null}
                    </View>
                    <Text style={styles.fastPurpose}>{t('purpose')} {fast.purpose}</Text>
                    {fast.notes ? <Text style={styles.fastNotes}>{fast.notes}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_fasting_records')}</Text>}
              </View>
            )}

            {/* SERVICE SCHEDULES SECTION */}
            {activeSection === 'services' && (
              <View>
                {data.map(sched => (
                  <View key={sched.id} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.scheduleDay}>{lang === 'ta' && sched.day_of_week_tamil ? sched.day_of_week_tamil : sched.day_of_week}</Text>
                      <Text style={styles.scheduleTime}>🕐 {sched.service_time}</Text>
                    </View>
                    <Text style={styles.scheduleType}>{lang === 'ta' && sched.service_type_tamil ? sched.service_type_tamil : sched.service_type}</Text>
                    <Text style={styles.scheduleLocation}>📍 {sched.location || t('church_sanctuary')}</Text>
                    {sched.description || sched.description_tamil ? <Text style={styles.scheduleDesc}>{lang === 'ta' && sched.description_tamil ? sched.description_tamil : sched.description}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_service_schedules')}</Text>}
              </View>
            )}

            {/* PODCASTS SECTION */}
            {activeSection === 'podcasts' && (
              <View>
                {data.map(pod => (
                  <View key={pod.id} style={styles.podcastCard}>
                    <Text style={styles.podcastLang}>{pod.language === 'ta' ? t('tamil') : t('english')}</Text>
                    <Text style={styles.podcastTitle}>{lang === 'ta' && pod.title_tamil ? pod.title_tamil : pod.title}</Text>
                    <Text style={styles.podcastPastor}>🎤 {pod.pastor || t('pastor')}</Text>
                    {pod.description || pod.description_tamil ? <Text style={styles.podcastDesc}>{lang === 'ta' && pod.description_tamil ? pod.description_tamil : pod.description}</Text> : null}
                  </View>
                ))}
                {data.length === 0 && <Text style={styles.empty}>{t('no_podcasts')}</Text>}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('church_menu')}</Text>
        <Text style={styles.subtitle}>{t('more_church_features')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {menuItems.map(item => (
          <TouchableOpacity 
            key={item.key} 
            style={styles.menuCard} 
            onPress={() => handleSectionSelect(item.key)}
            activeOpacity={0.85}
          >
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>{t('st_antony_church')}</Text>
          <Text style={styles.aboutText}>{t('faith_community_love')}</Text>
          <Text style={styles.aboutText}>Version 1.0.0 (Expo Platform)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuBtn: { padding: 4, marginRight: 8, alignSelf: 'center' },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  backBtnSmall: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm, marginBottom: 4 },
  backTextSmall: { color: Colors.textMuted, fontSize: 12 },
  
  list: { padding: Spacing.md },
  menuCard: { flexDirection: 'row', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between' },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  menuDesc: { fontSize: 12, color: Colors.textMuted },
  arrow: { fontSize: 18, color: Colors.gold, paddingLeft: 8 },
  
  aboutCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  aboutTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  aboutText: { fontSize: 12, color: Colors.textDim, marginBottom: 2 },
  
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionContainer: { padding: Spacing.md },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
  
  // Reading
  planCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  planDuration: { fontSize: 10, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  planTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  planDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  
  // Fasting
  composeCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  composeTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, fontSize: 14, marginBottom: 10 },
  saveBtn: { backgroundColor: Colors.gold, paddingVertical: 12, borderRadius: Radius.sm, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.dark, fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 1.2, marginBottom: 10 },
  fastCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10 },
  fastHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fastDate: { fontSize: 11, color: Colors.textDim, fontWeight: '600' },
  fastPurpose: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  fastNotes: { fontSize: 12, color: Colors.textMuted },
  
  // Services
  scheduleCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  scheduleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  scheduleDay: { fontSize: 15, fontWeight: '800', color: Colors.gold },
  scheduleTime: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  scheduleType: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  scheduleLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  scheduleDesc: { fontSize: 13, color: Colors.textDim, lineHeight: 18 },
  
  // Podcasts
  podcastCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  podcastLang: { fontSize: 9, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, marginBottom: 4 },
  podcastTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  podcastPastor: { fontSize: 12, color: Colors.gold, fontWeight: '600', marginBottom: 6 },
  podcastDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
});
