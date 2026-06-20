import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContext } from './_layout';
import { getWorship } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useLanguage } from '../../src/context/LanguageContext';

export default function WorshipScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t } = useLanguage();
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [language, setLanguage] = useState('All');

  async function load() {
    try {
      const res = await getWorship();
      setSongs(res.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const categories = [{key:'All', val:t('all')}, {key:'Worship', val:t('worship_tag')}, {key:'Hymn', val:t('hymn_tag')}, {key:'Contemporary', val:t('contemporary_tag')}];
  const languages = [{key:'All', val:t('all')}, {key:'English', val:t('english')}, {key:'Tamil', val:t('tamil')}];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase()) || 
                          (song.artist && song.artist.toLowerCase().includes(search.toLowerCase())) ||
                          (song.lyrics && song.lyrics.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' ? true : song.category === category;
    const matchesLanguage = language === 'All' ? true : song.language?.toLowerCase() === language.toLowerCase();
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  if (selected) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.detailContainer}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.categoryBadge}>{categories.find(c=>c.key===(selected.category || 'Worship'))?.val} • {languages.find(l=>l.key===(selected.language || 'English'))?.val}</Text>
          <Text style={styles.detailTitle}>{selected.title}</Text>
          {selected.artist ? <Text style={styles.detailArtist}>{t('by')} {selected.artist}</Text> : null}
          
          <View style={styles.lyricsCard}>
            <Text style={styles.lyricsText}>{selected.lyrics || t('no_lyrics')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}><View style={{flexDirection: 'row', alignItems: 'center'}}>
          
          <Text style={styles.title}>{t('worship_hymns_title')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
        <Text style={styles.subtitle}>{t('lyrics_praise')}</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput} 
            placeholder={t('search_lyrics')} 
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {/* Category filter */}
          {categories.map(cat => (
            <TouchableOpacity 
              key={`cat-${cat.key}`} 
              style={[styles.filterBtn, category === cat.key && styles.filterBtnActive]} 
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.filterBtnText, category === cat.key && styles.filterBtnTextActive]}>{cat.val}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          {/* Language filter */}
          {languages.map(lang => (
            <TouchableOpacity 
              key={`lang-${lang.key}`} 
              style={[styles.filterBtn, language === lang.key && styles.filterBtnActive]} 
              onPress={() => setLanguage(lang.key)}
            >
              <Text style={[styles.filterBtnText, language === lang.key && styles.filterBtnTextActive]}>{lang.val}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {filteredSongs.map(song => (
          <TouchableOpacity key={song.id} style={styles.card} onPress={() => setSelected(song)} activeOpacity={0.85}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardCategory}>{categories.find(c=>c.key===(song.category || 'Worship'))?.val} • {languages.find(l=>l.key===(song.language || 'English'))?.val}</Text>
              <Text style={styles.cardTitle}>{song.title}</Text>
              {song.artist ? <Text style={styles.cardArtist}>{t('by')} {song.artist}</Text> : null}
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        ))}
        {!loading && filteredSongs.length === 0 && <Text style={styles.empty}>{t('no_songs')}</Text>}
        <View style={{ height: 20 }} />
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
  backBtnSmall: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm },
  backTextSmall: { color: Colors.textMuted, fontSize: 12 },
  
  filterContainer: { backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder, paddingBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, marginHorizontal: Spacing.md, marginVertical: Spacing.sm, paddingHorizontal: 12 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, color: Colors.text, fontSize: 14 },
  
  filtersScroll: { paddingHorizontal: Spacing.md },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 6 },
  filterBtnActive: { backgroundColor: Colors.gold },
  filterBtnText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterBtnTextActive: { color: Colors.dark, fontWeight: '700' },
  divider: { width: 1, backgroundColor: Colors.glassBorder, marginHorizontal: 6, height: 20, alignSelf: 'center' },

  list: { padding: Spacing.md },
  card: { flexDirection: 'row', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
  cardInfo: { flex: 1 },
  cardCategory: { fontSize: 10, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  cardArtist: { fontSize: 12, color: Colors.textMuted },
  arrowIcon: { fontSize: 18, color: Colors.gold, paddingLeft: 8 },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
  
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, marginBottom: Spacing.md },
  backText: { color: Colors.textMuted, fontSize: 14 },
  detailContainer: { padding: Spacing.md },
  categoryBadge: { fontSize: 11, fontWeight: '700', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  detailTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  detailArtist: { fontSize: 15, color: Colors.gold, marginBottom: Spacing.md },
  lyricsCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.lg },
  lyricsText: { fontSize: 16, color: Colors.text, lineHeight: 28, textAlign: 'center', whiteSpace: 'pre-wrap' },
});
