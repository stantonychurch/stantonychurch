import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch, RefreshControl, Alert } from 'react-native';
import apiClient from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { DrawerContext } from './_layout';
import { useLanguage } from '../../src/context/LanguageContext';

export default function PrayerScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const router = useRouter();
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('public');

  async function load() {
    try {
      if (activeTab === 'public') {
        const res = await apiClient.get('/platform/prayer/public');
        setItems(res.data || []);
      } else {
        const res = await apiClient.get('/platform/prayer/my');
        setItems(res.data || []);
      }
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [activeTab]);

  async function handleSubmit() {
    if (!text.trim()) return Alert.alert('Required', 'Please enter a prayer request.');
    setSubmitting(true);
    try {
      await apiClient.post('/platform/prayer/create', { request_text: text, is_public: isPublic });
      setText(''); setIsPublic(true);
      Alert.alert('🙏 Submitted', isPublic ? 'Added to the public wall!' : 'Sent securely to the Father.');
      load();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to submit.');
    } finally { setSubmitting(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}><View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('prayer_requests_title')}</Text>
          <Text style={styles.subtitle}>{t('submit_and_pray')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
      </View>
      
      <View style={{ flexDirection: 'row', padding: Spacing.md, paddingBottom: 0 }}>
        <TouchableOpacity style={[styles.tab, activeTab === 'public' && styles.activeTab]} onPress={() => setActiveTab('public')}>
          <Text style={[styles.tabText, activeTab === 'public' && styles.activeTabText]}>{t('public_wall')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'my' && styles.activeTab]} onPress={() => setActiveTab('my')}>
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>{t('my_prayers')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {/* Submit form */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>{t('share_prayer_req')}</Text>
          <TextInput
            style={styles.textarea}
            placeholder={t('write_prayer_req')}
            placeholderTextColor={Colors.textDim}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>{t('make_public')}</Text>
              <Text style={styles.switchSubLabel}>{isPublic ? t('visible_community') : t('private_father')}</Text>
            </View>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: Colors.gold }} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? t('submitting') : t('submit_prayer')}</Text>
          </TouchableOpacity>
        </View>

        {/* Prayer list */}
        <Text style={styles.sectionLabel}>{activeTab === 'public' ? t('community_prayers') : t('my_prayers_upper')}</Text>
        {items.map(item => (
          <View key={item.id} style={styles.prayerCard}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.prayerName}>{activeTab === 'my' ? t('you') : item.member_name}</Text>
              {!item.is_public && activeTab === 'my' && <Text style={{color: Colors.pink, fontSize: 11, fontWeight: 'bold'}}>{t('private')}</Text>}
            </View>
            <Text style={styles.prayerText}>{item.request_text || item.request}</Text>
            <Text style={styles.prayerMeta}>{new Date(item.created_at).toLocaleDateString()}</Text>
            {activeTab === 'my' && item.status === 'answered' && (
              <View style={{marginTop: 8, padding: 8, backgroundColor: 'rgba(46, 204, 113, 0.1)', borderRadius: 4}}>
                <Text style={{color: '#2ecc71', fontSize: 12, fontWeight: 'bold'}}>{t('father_replied')}</Text>
              </View>
            )}
          </View>
        ))}
        {!loading && items.length === 0 && <Text style={styles.empty}>{t('no_prayer_requests')}</Text>}
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
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.gold },
  tabText: { color: Colors.textMuted, fontWeight: 'bold' },
  activeTabText: { color: Colors.gold },
  scroll: { padding: Spacing.md },
  formCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  formLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  textarea: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.sm, padding: 12, color: Colors.text, fontSize: 14, minHeight: 100, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  switchLabel: { fontSize: 14, color: Colors.text, fontWeight: 'bold' },
  switchSubLabel: { fontSize: 11, color: Colors.textMuted },
  submitBtn: { backgroundColor: Colors.gold, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center', marginTop: 4 },
  submitText: { color: Colors.dark, fontSize: 15, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 1.2, marginBottom: 10 },
  prayerCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10 },
  prayerName: { fontSize: 14, fontWeight: '700', color: Colors.gold, marginBottom: 4 },
  prayerText: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 6, fontStyle: 'italic' },
  prayerMeta: { fontSize: 11, color: Colors.textDim },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
});
