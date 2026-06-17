import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getDevotionals } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { DrawerContext } from './_layout';
import { useLanguage } from '../../src/context/LanguageContext';

export default function DevotionalScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useContext(DrawerContext);
  const { t, lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load() {
    try {
      const res = await getDevotionals();
      setItems(res.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (selected) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.detailContainer}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.category}>{selected.category || t('faith')}</Text>
          <Text style={styles.detailTitle}>{lang === 'ta' && selected.title_tamil ? selected.title_tamil : selected.title}</Text>
          {selected.scripture && (
            <View style={styles.scriptureBox}>
              <Text style={styles.scriptureText}>"{selected.scripture}"</Text>
              <Text style={styles.scriptureRef}>— {selected.scripture_reference}</Text>
            </View>
          )}
          <Text style={styles.detailContent}>{lang === 'ta' && selected.content_tamil ? selected.content_tamil : selected.content}</Text>
          {selected.prayer && (
            <View style={styles.prayerBox}>
              <Text style={styles.prayerLabel}>{t('prayer')}</Text>
              <Text style={styles.prayerText}>{selected.prayer}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('devotionals_title')}</Text>
          <Text style={styles.subtitle}>{t('devotionals_subtitle')}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {items.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
            <Text style={styles.cardCategory}>{item.category || t('faith')}</Text>
            <Text style={styles.cardTitle}>{lang === 'ta' && item.title_tamil ? item.title_tamil : item.title}</Text>
            <Text style={styles.cardContent} numberOfLines={3}>
              {lang === 'ta' && item.content_tamil ? item.content_tamil : item.content}
            </Text>
            {item.scripture && <Text style={styles.cardScripture}>📖 {item.scripture_reference}</Text>}
          </TouchableOpacity>
        ))}
        {!loading && items.length === 0 && <Text style={styles.empty}>{t('no_devotionals')}</Text>}
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
  card: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  cardCategory: { fontSize: 11, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  cardContent: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 8 },
  cardScripture: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, marginBottom: Spacing.md },
  backText: { color: Colors.textMuted, fontSize: 14 },
  detailContainer: { padding: Spacing.md },
  category: { fontSize: 11, fontWeight: '700', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  detailTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  scriptureBox: { backgroundColor: 'rgba(200,153,26,0.1)', borderWidth: 1, borderColor: 'rgba(200,153,26,0.3)', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  scriptureText: { fontSize: 15, color: Colors.text, fontStyle: 'italic', lineHeight: 24, marginBottom: 6 },
  scriptureRef: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  detailContent: { fontSize: 15, color: Colors.textMuted, lineHeight: 26, marginBottom: Spacing.lg },
  prayerBox: { backgroundColor: 'rgba(46,204,113,0.08)', borderWidth: 1, borderColor: 'rgba(46,204,113,0.25)', borderRadius: Radius.md, padding: Spacing.md },
  prayerLabel: { fontSize: 13, fontWeight: '700', color: Colors.success, marginBottom: 6 },
  prayerText: { fontSize: 14, color: Colors.textMuted, lineHeight: 22, fontStyle: 'italic' },
});
