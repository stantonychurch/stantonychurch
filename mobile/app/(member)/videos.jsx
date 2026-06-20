import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContext } from './_layout';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { getVideos } from '../../src/services/api';
import { API_BASE_URL } from '../../src/config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import SocialBar from '../../src/components/SocialBar';

const { width } = Dimensions.get('window');

export default function VideosScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('All');

  async function load() {
    try {
      const res = await getVideos();
      setItems(res.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const categories = [
    {key:'All', val:t('all')}, 
    {key:'Sermon', val:t('sermon')}, 
    {key:'Worship', val:t('worship_tag')}, 
    {key:'Youth', val:t('youth')}, 
    {key:'Healing', val:t('healing')}
  ];
  const filteredItems = category === 'All' ? items : items.filter(i => i.category === category);

  function renderVideoPlayer(item) {
    if (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.url.includes('youtube-nocookie.com'))) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const match = item.url.match(regex);
      const videoId = match ? match[1] : '';
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      return (
        <View style={styles.videoContainer}>
          <WebView
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            source={{ uri: embedUrl }}
          />
        </View>
      );
    } else {
      const videoUri = item.filename 
        ? `${SERVER_URL}/uploads/${item.filename}` 
        : item.url;
      return (
        <View style={styles.videoContainer}>
          <Video
            style={styles.video}
            source={{ uri: videoUri }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
          />
        </View>
      );
    }
  }

  if (selected) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.detailContainer}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
          
          {renderVideoPlayer(selected)}

          <Text style={styles.categoryBadge}>{categories.find(c=>c.key===(selected.category || 'Sermon'))?.val}</Text>
          <Text style={styles.detailTitle}>{lang === 'ta' && selected.title_tamil ? selected.title_tamil : selected.title}</Text>
          {selected.description || selected.description_tamil ? (
            <Text style={styles.detailDescription}>{lang === 'ta' && selected.description_tamil ? selected.description_tamil : selected.description}</Text>
          ) : null}
          <Text style={styles.uploadedBy}>{t('uploaded_by')} {selected.uploaded_by || t('admin')}</Text>
          
          <SocialBar mediaType="video" mediaId={selected.id} />
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
          
          <Text style={styles.title}>{t('sermons_videos_title')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
        <Text style={styles.subtitle}>{t('watch_listen')}</Text>
      </View>

      {/* Category selector */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.key} 
              style={[styles.catBtn, category === cat.key && styles.catBtnActive]} 
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.catText, category === cat.key && styles.catTextActive]}>{cat.val}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
      >
        {filteredItems.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
            <View style={styles.cardThumbnailPlaceholder}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardCategory}>{categories.find(c=>c.key===(item.category || 'Sermon'))?.val}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{lang === 'ta' && item.title_tamil ? item.title_tamil : item.title}</Text>
              {item.description || item.description_tamil ? (
                <Text style={styles.cardDesc} numberOfLines={1}>{lang === 'ta' && item.description_tamil ? item.description_tamil : item.description}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
        {!loading && filteredItems.length === 0 && <Text style={styles.empty}>{t('no_videos')}</Text>}
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
  categoriesContainer: { paddingVertical: Spacing.sm, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  categoriesScroll: { paddingHorizontal: Spacing.md },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8 },
  catBtnActive: { backgroundColor: Colors.gold },
  catText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  catTextActive: { color: Colors.dark, fontWeight: '700' },
  list: { padding: Spacing.md },
  card: { flexDirection: 'row', backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: 12, alignItems: 'center' },
  cardThumbnailPlaceholder: { width: 80, height: 60, backgroundColor: 'rgba(200, 153, 26, 0.1)', borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderHeight: 1, borderColor: Colors.glassBorder },
  playIcon: { fontSize: 20, color: Colors.gold },
  cardInfo: { flex: 1 },
  cardCategory: { fontSize: 10, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, marginBottom: 2, textTransform: 'uppercase' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: Colors.textMuted },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 40 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, marginBottom: Spacing.md },
  backText: { color: Colors.textMuted, fontSize: 14 },
  detailContainer: { padding: Spacing.md },
  videoContainer: { width: '100%', height: 210, backgroundColor: '#000', borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.md, borderHeight: 1, borderColor: Colors.glassBorder },
  video: { width: '100%', height: '100%' },
  webview: { width: '100%', height: '100%' },
  categoryBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '700', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  detailTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  detailDescription: { fontSize: 14, color: Colors.textMuted, lineHeight: 22, marginBottom: Spacing.md },
  uploadedBy: { fontSize: 12, color: Colors.textDim, fontStyle: 'italic' },
});
